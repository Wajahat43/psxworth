import { boolean, date, integer, pgTable, real, text, timestamp, unique } from "drizzle-orm/pg-core";

export const portfolioTable = pgTable("portfolioTable", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  title: text("title").notNull(),
  userId: text("user_id").notNull(),
  backgroundColor: text("background_color").notNull(),
  emoji: text("emoji").notNull(),
  useGlobalTax: boolean("use_global_tax").notNull().default(true),
  taxStatus: text("tax_status", { enum: ["filer", "non-filer"] }).notNull().default("filer"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const transactionTable = pgTable("transactionTable", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: text("user_id").notNull(),
  portfolioId: integer("portfolio_id")
    .notNull()
    .references(() => portfolioTable.id, { onDelete: "cascade" }),
  type: text("type", { enum: ["buy", "sell", "dividend"] }).notNull(),
  transactionDate: date("transaction_date", { mode: "string" }).notNull(),
  stockSymbol: text("stock_symbol").notNull(),
  numberOfShares: real("number_of_shares").notNull(),
  pricePerShare: real("price_per_share"),
  dividendPerShare: real("dividend_per_share"),
  commissionAndTaxes: real("commission_and_taxes"),
  isCommissionPercentage: boolean("is_commission_percentage").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export const stockPerformanceTable = pgTable(
  "stockPerformance",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: text("user_id").notNull(),
    portfolioId: integer("portfolio_id")
      .notNull()
      .references(() => portfolioTable.id, { onDelete: "cascade" }),
    stockSymbol: text("stock_symbol").notNull(),
    averageCost: real("average_cost").notNull().default(0),
    totalShares: real("total_shares").notNull().default(0),
    totalCost: real("total_cost").notNull().default(0),
    totalDividends: real("total_dividends").notNull().default(0),
    realizedProfit: real("realized_profit").notNull().default(0),
    commissionAndTaxes: real("tax_and_broker_fee").notNull().default(0),
    totalInflow: real("total_inflow").notNull().default(0),
    totalOutflow: real("total_outflow").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.portfolioId, table.stockSymbol)]
);

export const userSettingsTable = pgTable("userSettingsTable", {
  userId: text("user_id").primaryKey(),
  taxStatus: text("tax_status", { enum: ["filer", "non-filer"] }).notNull().default("filer"),
  commissionRate: real("commission_rate").notNull().default(0),
  isCommissionPercentage: boolean("is_commission_percentage").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});

export type UserPortfolio = typeof portfolioTable.$inferSelect;
export type UserTransaction = typeof transactionTable.$inferSelect;
export type UserStockPerformance = typeof stockPerformanceTable.$inferSelect;
export type UserSettings = typeof userSettingsTable.$inferSelect;
export type Portfolio = UserPortfolio;
export type Transaction = UserTransaction;
export type StockPerformance = UserStockPerformance;
export type UserSettingsType = UserSettings;
