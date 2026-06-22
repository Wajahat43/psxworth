"use server";

import { db } from "@/db";
import { userSettingsTable, UserSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
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
        // Create default settings if not exists
        const defaultSettings = {
          userId: id,
          taxStatus: "filer" as const,
          commissionRate: 0.15,
          isCommissionPercentage: true,
        };
        const result = await db.insert(userSettingsTable).values(defaultSettings).returning();
        settings = result[0];
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

    // Upsert user settings
    const existing = await db
      .select()
      .from(userSettingsTable)
      .where(eq(userSettingsTable.userId, userId))
      .limit(1)
      .then((rows) => rows[0]);

    let updated;
    if (existing) {
      const result = await db
        .update(userSettingsTable)
        .set({
          taxStatus: data.taxStatus,
          commissionRate: data.commissionRate,
          isCommissionPercentage: data.isCommissionPercentage,
          updatedAt: new Date(),
        })
        .where(eq(userSettingsTable.userId, userId))
        .returning();
      updated = result[0];
    } else {
      const result = await db
        .insert(userSettingsTable)
        .values({
          userId,
          taxStatus: data.taxStatus,
          commissionRate: data.commissionRate,
          isCommissionPercentage: data.isCommissionPercentage,
        })
        .returning();
      updated = result[0];
    }

    updateTag(`user-settings-${userId}`);
    return updated;
  }
);
