import { z } from "zod";

export const userSettingsSchema = z
  .object({
    taxStatus: z.enum(["filer", "non-filer"]),
    commissionRate: z.coerce
      .number({ invalid_type_error: "Commission rate must be a number" })
      .min(0, "Commission rate cannot be negative"),
    isCommissionPercentage: z.boolean(),
  })
  .refine(
    (data) => !(data.isCommissionPercentage && data.commissionRate > 100),
    {
      message: "Percentage commission rate cannot exceed 100%",
      path: ["commissionRate"],
    }
  );

export type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;
