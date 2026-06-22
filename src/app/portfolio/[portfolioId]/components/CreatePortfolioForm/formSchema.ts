import { z } from "zod";

export const createPortfolioSchema = z.object({
  title: z.string().trim().min(1, {
    message: "Title is required.",
  }),
  emoji: z.string().trim().min(1, {
    message: "Emoji is required.",
  }),
  backgroundColor: z.string().trim().min(1, {
    message: "Background color is required.",
  }),
  useGlobalTax: z.boolean().default(true),
  taxStatus: z.enum(["filer", "non-filer"]).default("filer"),
});

export const updatePortfolioSchema = createPortfolioSchema.extend({
  id: z.coerce.number(),
});

export const schema = updatePortfolioSchema;

export type CreatePortfolioSchemaType = z.infer<typeof createPortfolioSchema>;
export type UpdatePortfolioSchemaType = z.infer<typeof updatePortfolioSchema>;
