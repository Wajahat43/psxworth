"use server";

import { db } from "@/db";
import { userSettingsTable, UserSettings, portfolioTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { updateTag, unstable_cache } from "next/cache";
import { requireAuth, withErrorHandling } from "../utils/middleware";

export const getUserSettings = withErrorHandling(async () => {
  const userId = await requireAuth();

  const getCachedSettings = unstable_cache(
    async (id: string) => {
      let settings = await db
        .select()
        .from(userSettingsTable)
        .where(eq(userSettingsTable.userId, id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!settings) {
        // Create default settings atomically if not exists
        const defaultSettings = {
          userId: id,
          taxStatus: "filer" as const,
          commissionRate: 0.15,
          isCommissionPercentage: true,
        };
        const result = await db
          .insert(userSettingsTable)
          .values(defaultSettings)
          .onConflictDoNothing()
          .returning();
        
        if (result.length > 0) {
          settings = result[0];
        } else {
          // If conflict occurred, select the setting created by concurrent query
          settings = await db
            .select()
            .from(userSettingsTable)
            .where(eq(userSettingsTable.userId, id))
            .limit(1)
            .then((rows) => rows[0]);
        }
      }
      return settings;
    },
    [`user-settings-${userId}`],
    {
      tags: [`user-settings-${userId}`],
      revalidate: 60 * 60, // Cache for 1 hour
    }
  );

  return await getCachedSettings(userId);
});

export const updateUserSettings = withErrorHandling(
  async (data: Omit<UserSettings, "userId" | "createdAt" | "updatedAt">) => {
    const userId = await requireAuth();

    if (data.taxStatus !== "filer" && data.taxStatus !== "non-filer") {
      throw new Error("Invalid tax status value");
    }
    if (typeof data.commissionRate !== "number" || !isFinite(data.commissionRate) || data.commissionRate < 0) {
      throw new Error("Commission rate must be a non-negative finite number");
    }
    if (data.isCommissionPercentage && data.commissionRate > 100) {
      throw new Error("Commission rate percentage cannot exceed 100%");
    }
    if (typeof data.isCommissionPercentage !== "boolean") {
      throw new Error("isCommissionPercentage must be a boolean");
    }

    const result = await db.transaction(async (tx) => {
      const txResult = await tx
        .insert(userSettingsTable)
        .values({
          userId,
          taxStatus: data.taxStatus,
          commissionRate: data.commissionRate,
          isCommissionPercentage: data.isCommissionPercentage,
        })
        .onConflictDoUpdate({
          target: userSettingsTable.userId,
          set: {
            taxStatus: data.taxStatus,
            commissionRate: data.commissionRate,
            isCommissionPercentage: data.isCommissionPercentage,
            updatedAt: new Date(),
          },
        })
        .returning();

      await tx
        .update(portfolioTable)
        .set({ taxStatus: data.taxStatus })
        .where(and(eq(portfolioTable.userId, userId), eq(portfolioTable.useGlobalTax, true)));

      return txResult;
    });

    const updated = result[0];
    updateTag(`user-settings-${userId}`);
    updateTag(`user-${userId}-portfolios`);
    return updated;
  }
);
