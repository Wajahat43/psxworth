"use server";

import {
  calculateStockPerformance,
  updateMultiplePerformances,
} from "@/actions/portfolioPerformance/portfolioPerformance";
import { getPostHogServer } from "@/app/posthog-server";
import { db } from "@/db";
import { portfolioTable, transactionTable, userSettingsTable } from "@/db/schema";
import { createTracedModel } from "@/lib/ai/aiClient";
import { parseTransactionsAIResponse } from "@/lib/ai/helpers";
import { TRANSACTION_PARSER_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { transactionsAISchema } from "@/lib/ai/schema";
import { Transaction, TransactionSchemaType } from "@/types";
import { MULTIPLE_TRANSACTIONS_CREATED, TRANSACTION_CREATED, TRANSACTION_DELETED } from "@/utils/posthog/events";
import { generateObject } from "ai";
import "dotenv/config";
import { and, asc, eq } from "drizzle-orm";
import { unstable_cache, updateTag } from "next/cache";
import { createResponse } from "../utils";
import { requireAuth, withPortfolioOwnership, withErrorHandling } from "../utils/middleware";
import { sortTransactionsByDateAndType } from "./helpers";

/**
 * Fetches the user's global settings and the portfolio's tax override, then
 * mutates each item in-place to fill in missing commissionAndTaxes /
 * isCommissionPercentage values using the effective tax rules.
 *
 * Dividend tax rates (percentage of gross dividend):
 *   - Filer:     15 %
 *   - Non-filer: 30 %
 *
 * Buy / Sell commissions default to the user's saved commissionRate setting.
 *
 * @param userId      - Authenticated user ID (already verified by the caller).
 * @param portfolioId - Portfolio that owns the transactions.
 * @param items       - Transaction payloads to mutate in-place.
 */
async function applySettingsDefaults(
  userId: string,
  portfolioId: number,
  items: TransactionSchemaType[]
): Promise<void> {
  // Fetch portfolio settings scoped to user for security
  const portfolio = await db
    .select()
    .from(portfolioTable)
    .where(and(eq(portfolioTable.id, portfolioId), eq(portfolioTable.userId, userId)))
    .limit(1)
    .then((rows) => rows[0]);

  // Query settings once and fall back to safe defaults if not found
  let settings = await db
    .select()
    .from(userSettingsTable)
    .where(eq(userSettingsTable.userId, userId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!settings) {
    settings = {
      userId,
      taxStatus: "filer" as const,
      commissionRate: 0.15,
      isCommissionPercentage: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Determine the effective tax status (portfolio-local vs global)
  const effectiveTaxStatus: "filer" | "non-filer" =
    portfolio && !portfolio.useGlobalTax ? portfolio.taxStatus : settings.taxStatus;

  for (const item of items) {
    if (item.type === "dividend") {
      if (
        item.commissionAndTaxes === undefined ||
        item.commissionAndTaxes === null ||
        item.commissionAndTaxes === 0
      ) {
        item.commissionAndTaxes = effectiveTaxStatus === "filer" ? 15 : 30;
        item.isCommissionPercentage = true;
      }
    } else if (item.type === "buy" || item.type === "sell") {
      if (
        item.commissionAndTaxes === undefined ||
        item.commissionAndTaxes === null ||
        item.commissionAndTaxes === 0
      ) {
        item.commissionAndTaxes = settings.commissionRate;
        item.isCommissionPercentage = settings.isCommissionPercentage;
      }
    }
  }
}

export const createTransactionServer = withErrorHandling(async (transactionData: TransactionSchemaType) => {
  const userId = await requireAuth();
  await withPortfolioOwnership(transactionData.portfolioId, userId);

  await applySettingsDefaults(userId, transactionData.portfolioId, [transactionData]);

  const formattedData = {
    ...transactionData,
    userId,
  };

  await db.transaction(async (tx) => {
    await updateMultiplePerformances([formattedData] as unknown as Transaction[], tx);
    await tx.insert(transactionTable).values(formattedData);
  });

  updateTag(`${userId}-${transactionData.portfolioId}-transactions`);
  updateTag(`portfolio-${transactionData.portfolioId}-performance`);
  const posthog = getPostHogServer();
  posthog.capture(TRANSACTION_CREATED, {
    portfolio_id: transactionData.portfolioId,
    user_id: userId,
  });

  return createResponse.success("Transaction added successfully");
});

export const createMultipleTransactions = withErrorHandling(async (transactions: TransactionSchemaType[]) => {
  if (!transactions || transactions.length === 0) {
    throw new Error("No transactions provided");
  }

  const userId = await requireAuth();
  
  const uniquePortfolioIds = new Set(transactions.map((t) => t.portfolioId));
  if (uniquePortfolioIds.size !== 1) {
    throw new Error("All transactions in a batch must belong to the same portfolio");
  }

  const portfolioId = transactions[0].portfolioId;
  await withPortfolioOwnership(portfolioId, userId);

  await applySettingsDefaults(userId, portfolioId, transactions);

  const sortedTransactions = sortTransactionsByDateAndType(transactions);
  await db.transaction(async (tx) => {
    const formattedTransactions = sortedTransactions.map((t) => ({
      ...t,
      userId,
    }));

    await tx.insert(transactionTable).values(formattedTransactions);
    await updateMultiplePerformances(formattedTransactions as unknown as Transaction[], tx);
  });

  updateTag(`${userId}-${portfolioId}-transactions`);
  updateTag(`portfolio-${portfolioId}-performance`);

  const posthog = getPostHogServer();
  posthog.capture(MULTIPLE_TRANSACTIONS_CREATED, {
    portfolio_id: portfolioId,
    user_id: userId,
  });

  return createResponse.success("Transactions added successfully");
});

/**
 * Takes a raw string of transactions data and sends it to the AI
 * to parse it into a structured format according to the provided schema.
 * @param rawTransactions The raw string of transactions data
 * @returns A ServerFunctionResponse object with the parsed transactions data
 *          or an error message if the request was unsuccessful.
 */

export const parseRawTransactions = withErrorHandling(async (rawTransactions: string) => {
  const userId = await requireAuth();
  const model = createTracedModel("google/gemini-2.5-flash-lite", userId);

  const { object } = await generateObject({
    model,
    schema: transactionsAISchema,
    prompt: `${TRANSACTION_PARSER_SYSTEM_PROMPT}
    
    Parse the following transactions data: ${rawTransactions}`,
  });

  if (object && object.transactions) {
    const parsedTransactions = parseTransactionsAIResponse(object.transactions);

    return parsedTransactions;
  }

  throw new Error("Transactions Couldn't be parsed properly. Please check if your data is valid.");
});

const getTransactionsUncached = async (userId: string, portfolioId: number) => {
  await withPortfolioOwnership(portfolioId, userId);
  const transactions = await db
    .select()
    .from(transactionTable)
    .where(eq(transactionTable.portfolioId, portfolioId))
    .orderBy(asc(transactionTable.transactionDate), asc(transactionTable.type));

  return transactions;
};

export const getTransactions = withErrorHandling(async (portfolioId: number) => {
  const userId = await requireAuth();
  await withPortfolioOwnership(portfolioId, userId);

  const transactions = await unstable_cache(
    async () => {
      return await getTransactionsUncached(userId, portfolioId);
    },
    [`${userId}-${portfolioId}-transactions`],
    {
      tags: [`${userId}-${portfolioId}-transactions`],
      revalidate: 60 * 60, //Revalidate after 1 hour.
    }
  )();

  return transactions;
});

export const editTransaction = withErrorHandling(
  async (transactionId: number, updatedTransactionData: TransactionSchemaType) => {
    const userId = await requireAuth();
    await withPortfolioOwnership(updatedTransactionData.portfolioId, userId);

    // Get the old transaction for rollback and performance calculation
    const oldTransaction = await db
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.id, transactionId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!oldTransaction) {
      throw new Error("Transaction not found");
    }

    const portfolioId = updatedTransactionData.portfolioId;
    const oldStockSymbol = oldTransaction.stockSymbol;
    const newStockSymbol = updatedTransactionData.stockSymbol;

    const formattedData = {
      ...updatedTransactionData,
      userId,
    };

    // Use database transaction for atomic delete and create with automatic rollback
    await db.transaction(async (tx) => {
      // Step 1: Delete the old transaction
      await tx.delete(transactionTable).where(eq(transactionTable.id, transactionId));

      // Step 2: Recalculate performance for the old stock after deletion
      await calculateStockPerformance(portfolioId, oldStockSymbol, tx);

      // Step 3: Insert the new transaction
      await tx.insert(transactionTable).values(formattedData);

      // Step 4: Recalculate performance for the new stock symbol
      // This handles both same stock updates and stock symbol changes
      await calculateStockPerformance(portfolioId, newStockSymbol, tx);
    });

    // Revalidate caches
    updateTag(`${userId}-${portfolioId}-transactions`);
    updateTag(`portfolio-${portfolioId}-performance`);

    // Track event
    const posthog = getPostHogServer();
    posthog.capture(TRANSACTION_CREATED, {
      portfolio_id: portfolioId,
      user_id: userId,
      is_edit: true,
    });

    return createResponse.success("Transaction updated successfully");
  }
);

export const deleteTransaction = withErrorHandling(async (transactionId: number, portfolioId: number) => {
  const userId = await requireAuth();
  await withPortfolioOwnership(portfolioId, userId);

  const transaction = await db
    .select()
    .from(transactionTable)
    .where(eq(transactionTable.id, transactionId))
    .limit(1)
    .then((rows) => rows[0]);
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  await db.transaction(async (tx) => {
    await tx.delete(transactionTable).where(eq(transactionTable.id, transactionId));
    await calculateStockPerformance(portfolioId, transaction.stockSymbol, tx);
  });

  updateTag(`${userId}-${portfolioId}-transactions`);
  updateTag(`portfolio-${portfolioId}-performance`);
  const posthog = getPostHogServer();
  posthog.capture(TRANSACTION_DELETED, {
    portfolio_id: portfolioId,
    user_id: userId,
  });

  return createResponse.success("Transaction deleted successfully");
});
