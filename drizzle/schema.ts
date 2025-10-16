import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  telegramId: varchar("telegramId", { length: 64 }),
  telegramUsername: varchar("telegramUsername", { length: 255 }),
  kycStatus: mysqlEnum("kycStatus", ["pending", "verified", "rejected"]).default("pending"),
  kycDocuments: text("kycDocuments"), // JSON string
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Wallet table for USDT on Tron
 */
export const wallets = mysqlTable("wallets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(), // Tron address
  privateKeyEncrypted: text("privateKeyEncrypted").notNull(), // Encrypted private key
  network: varchar("network", { length: 50 }).default("tron").notNull(),
  balance: varchar("balance", { length: 100 }).default("0"), // Store as string to avoid precision issues
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Stripe cards table for issued cards
 */
export const cards = mysqlTable("cards", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  stripeCardId: varchar("stripeCardId", { length: 255 }).notNull(),
  last4: varchar("last4", { length: 4 }),
  brand: varchar("brand", { length: 50 }),
  status: mysqlEnum("status", ["active", "inactive", "canceled"]).default("active"),
  cardholderName: varchar("cardholderName", { length: 255 }),
  expiryMonth: int("expiryMonth"),
  expiryYear: int("expiryYear"),
  spendingLimit: varchar("spendingLimit", { length: 100 }), // Monthly limit in cents
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Card = typeof cards.$inferSelect;
export type InsertCard = typeof cards.$inferInsert;

/**
 * Transactions table for all financial operations
 */
export const transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["deposit", "withdrawal", "transfer", "card_payment", "card_refund"]).notNull(),
  amount: varchar("amount", { length: 100 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USDT"),
  status: mysqlEnum("status", ["pending", "completed", "failed", "canceled"]).default("pending"),
  fromAddress: varchar("fromAddress", { length: 255 }),
  toAddress: varchar("toAddress", { length: 255 }),
  txHash: varchar("txHash", { length: 255 }), // Blockchain transaction hash
  stripeTransactionId: varchar("stripeTransactionId", { length: 255 }), // Stripe transaction ID
  description: text("description"),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Card authorizations table for Stripe Issuing webhooks
 */
export const cardAuthorizations = mysqlTable("cardAuthorizations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  cardId: varchar("cardId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  stripeAuthorizationId: varchar("stripeAuthorizationId", { length: 255 }).notNull(),
  amount: varchar("amount", { length: 100 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  merchantName: varchar("merchantName", { length: 255 }),
  merchantCategory: varchar("merchantCategory", { length: 100 }),
  status: mysqlEnum("status", ["pending", "approved", "declined"]).default("pending"),
  approved: boolean("approved").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type CardAuthorization = typeof cardAuthorizations.$inferSelect;
export type InsertCardAuthorization = typeof cardAuthorizations.$inferInsert;

/**
 * Exchange rates table for currency conversion
 */
export const exchangeRates = mysqlTable("exchangeRates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  fromCurrency: varchar("fromCurrency", { length: 10 }).notNull(),
  toCurrency: varchar("toCurrency", { length: 10 }).notNull(),
  rate: varchar("rate", { length: 100 }).notNull(),
  source: varchar("source", { length: 100 }).default("coingecko"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = typeof exchangeRates.$inferInsert;

