"use server";

import {
  createPortfolioSchema,
  updatePortfolioSchema,
} from "@/app/portfolio/[portfolioId]/components/CreatePortfolioForm/formSchema";
import { db } from "@/db";
import { Portfolio, portfolioTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache, updateTag } from "next/cache";
import { requireAuth, withPortfolioOwnership, withErrorHandling } from "../utils/middleware";

export const deletePortfolioAction = withErrorHandling(async (portfolioId: number) => {
  const userId = await requireAuth();
  await withPortfolioOwnership(portfolioId, userId);

  await db.delete(portfolioTable).where(eq(portfolioTable.id, portfolioId));
  updateTag(`user-${userId}-portfolios`);
  return { portfolioId };
});

export const createPortfolio = withErrorHandling(
  async (data: Omit<Portfolio, "id" | "userId" | "createdAt" | "updatedAt">) => {
    const userId = await requireAuth();
    const parsed = createPortfolioSchema.safeParse(data);
    if (!parsed.success) throw new Error("Invalid form data");

    const portfolioData = {
      ...parsed.data,
      userId: userId,
    };
    const result = await db.insert(portfolioTable).values(portfolioData).returning();
    if (!result || result.length === 0) {
      throw new Error("Failed to create portfolio");
    }
    const createdPortfolio = result[0];
    updateTag(`user-${userId}-portfolios`);
    return createdPortfolio;
  }
);

export const updatePortfolio = withErrorHandling(async (data: Portfolio) => {
  const userId = await requireAuth();
  const parsed = updatePortfolioSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid form data");
  }

  const { id, ...portfolioData } = parsed.data;

  await withPortfolioOwnership(id, userId);

  const portfolio = {
    ...portfolioData,
    userId: userId,
  };
  await db.update(portfolioTable).set(portfolio).where(eq(portfolioTable.id, id));
  updateTag(`user-${userId}-portfolios`);
  return { ...portfolio, id: id };
});

export const getPortfolios = withErrorHandling(async () => {
  const userId = await requireAuth();

  const getCachedPortfolios = unstable_cache(
    async (id: string) => {
      return db.select().from(portfolioTable).where(eq(portfolioTable.userId, id));
    },
    ["user-portfolios", userId],
    {
      tags: [`user-${userId}-portfolios`],
      revalidate: 10,
    }
  );

  const portfolios = await getCachedPortfolios(userId);
  return portfolios;
});
