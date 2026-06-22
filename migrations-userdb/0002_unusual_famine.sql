ALTER TABLE "portfolioTable" ADD COLUMN "use_global_tax" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolioTable" ADD COLUMN "tax_status" text DEFAULT 'filer' NOT NULL;