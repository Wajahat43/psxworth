CREATE TABLE "userSettingsTable" (
	"user_id" text PRIMARY KEY NOT NULL,
	"tax_status" text DEFAULT 'filer' NOT NULL,
	"commission_rate" real DEFAULT 0 NOT NULL,
	"is_commission_percentage" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
