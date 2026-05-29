"use server";

import {
  calculateStockPerformance,
  updateMultiplePerformances,
} from "@/actions/portfolioPerformance/portfolioPerformance";
import { getPostHogServer } from "@/app/posthog-server";
import { db } from "@/db";
import { transactionTable } from "@/db/schema";
import { createTracedModel } from "@/lib/ai/aiClient";
import { parseTransactionsAIResponse } from "@/lib/ai/helpers";
import { TRANSACTION_PARSER_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { transactionsAISchema } from "@/lib/ai/schema";
import { Transaction, TransactionSchemaType } from "@/types";
import { MULTIPLE_TRANSACTIONS_CREATED, TRANSACTION_CREATED, TRANSACTION_DELETED } from "@/utils/posthog/events";
import { generateObject } from "ai";
import "dotenv/config";
import { asc, desc, eq, and, inArray, count } from "drizzle-orm";
import { unstable_cache, updateTag } from "next/cache";
import { createResponse } from "../utils";
import { requireAuth, withPortfolioOwnership, withErrorHandling } from "../utils/middleware";
import { sortTransactionsByDateAndType } from "./helpers";

export const createTransactionServer = withErrorHandling(async (transactionData: TransactionSchemaType) => {
  const userId = await requireAuth();
  await withPortfolioOwnership(transactionData.portfolioId, userId);

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
  const userId = await requireAuth();
  await withPortfolioOwnership(transactions[0].portfolioId, userId);

  if (!transactions || transactions.length === 0) {
    throw new Error("No transactions provided");
  }

  const portfolioId = transactions[0].portfolioId;
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

const getTransactionsUncached = async (
  userId: string,
  portfolioId: number,
  page: number = 1,
  pageSize: number = 20,
  filters?: { types?: ("buy" | "sell" | "dividend")[], symbols?: string[] },
  sorting?: { key: string; order: string } | null
) => {
  await withPortfolioOwnership(portfolioId, userId);
  const offset = Math.max(0, (page - 1) * pageSize);

  const whereClause = and(
    eq(transactionTable.portfolioId, portfolioId),
    filters?.types && filters.types.length > 0 ? inArray(transactionTable.type, filters.types) : undefined,
    filters?.symbols && filters.symbols.length > 0 ? inArray(transactionTable.stockSymbol, filters.symbols) : undefined,
  );

  const sortableColumns = {
    transactionDate: transactionTable.transactionDate,
    type: transactionTable.type,
    stockSymbol: transactionTable.stockSymbol,
    numberOfShares: transactionTable.numberOfShares,
    pricePerShare: transactionTable.pricePerShare,
    commissionAndTaxes: transactionTable.commissionAndTaxes,
  } as const;

  const sortColumn = sorting?.key ? sortableColumns[sorting.key as keyof typeof sortableColumns] : undefined;

  const orderByClause =
    sortColumn
      ? sorting?.order === "desc"
        ? [desc(sortColumn)]
        : [asc(sortColumn)]
      : [asc(transactionTable.transactionDate), asc(transactionTable.type)];

  const [transactions, totalCountResult,availableSymbols] = await Promise.all([
    db
      .select()
      .from(transactionTable)
      .where(whereClause)
      .orderBy(...orderByClause)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: count() })
      .from(transactionTable)
      .where(whereClause),
  db
  .selectDistinct({ stockSymbol: transactionTable.stockSymbol })
  .from(transactionTable)
  .where(eq(transactionTable.portfolioId, portfolioId))

  ]);

  return {
    items: transactions,
    totalCount: Number(totalCountResult[0].count),
    availableSymbols
  };
};

export const getTransactions = withErrorHandling(
  async (
    portfolioId: number,
    page: number = 1,
    pageSize: number = 20,
    filters?: { types?: ("buy" | "sell" | "dividend")[]; symbols?: string[] },
    sorting?: { key: string; order: string } | null
  ) => {
    page = Math.max(1, page ?? 1);
    pageSize = [10, 20, 40, 50].includes(pageSize)
      ? pageSize
      : 10;

    const userId = await requireAuth();
    await withPortfolioOwnership(portfolioId, userId);
    const filterKey = JSON.stringify(filters || {});
    const sortKey = JSON.stringify(sorting || {});
    const result = await unstable_cache(
      async () => {
        return await getTransactionsUncached(userId, portfolioId, page, pageSize, filters, sorting);
      },
      [`${userId}-${portfolioId}-transactions-page-${page}-size-${pageSize}-filters-${filterKey}-sorting-${sortKey}`],
      {
        tags: [`${userId}-${portfolioId}-transactions`],
        revalidate: 60 * 60, //Revalidate after 1 hour.
      }
    )();

    return {
      items: result.items,
      totalCount: result.totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(result.totalCount / pageSize),
      availableSymbols:result.availableSymbols
    };
  }
);

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
