import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  wallets, InsertWallet, Wallet,
  cards, InsertCard, Card,
  transactions, InsertTransaction, Transaction,
  cardAuthorizations, InsertCardAuthorization, CardAuthorization,
  exchangeRates, InsertExchangeRate, ExchangeRate
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "telegramId", "telegramUsername", "kycDocuments"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    
    if (user.kycStatus !== undefined) {
      values.kycStatus = user.kycStatus;
      updateSet.kycStatus = user.kycStatus;
    }
    
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Wallet operations
export async function createWallet(wallet: InsertWallet): Promise<Wallet | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.insert(wallets).values(wallet);
  const result = await db.select().from(wallets).where(eq(wallets.id, wallet.id!)).limit(1);
  return result[0];
}

export async function getWalletByUserId(userId: string): Promise<Wallet | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return result[0];
}

export async function updateWalletBalance(walletId: string, balance: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(wallets)
    .set({ balance, updatedAt: new Date() })
    .where(eq(wallets.id, walletId));
}

// Card operations
export async function createCard(card: InsertCard): Promise<Card | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.insert(cards).values(card);
  const result = await db.select().from(cards).where(eq(cards.id, card.id!)).limit(1);
  return result[0];
}

export async function getCardsByUserId(userId: string): Promise<Card[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(cards).where(eq(cards.userId, userId));
}

export async function getCardById(cardId: string): Promise<Card | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(cards).where(eq(cards.id, cardId)).limit(1);
  return result[0];
}

export async function updateCardStatus(cardId: string, status: "active" | "inactive" | "canceled"): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(cards)
    .set({ status, updatedAt: new Date() })
    .where(eq(cards.id, cardId));
}

// Transaction operations
export async function createTransaction(transaction: InsertTransaction): Promise<Transaction | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.insert(transactions).values(transaction);
  const result = await db.select().from(transactions).where(eq(transactions.id, transaction.id!)).limit(1);
  return result[0];
}

export async function getTransactionsByUserId(userId: string, limit: number = 50): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function updateTransactionStatus(
  transactionId: string, 
  status: "pending" | "completed" | "failed" | "canceled",
  txHash?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const updateData: any = { status, updatedAt: new Date() };
  if (txHash) updateData.txHash = txHash;

  await db.update(transactions)
    .set(updateData)
    .where(eq(transactions.id, transactionId));
}

// Card authorization operations
export async function createCardAuthorization(auth: InsertCardAuthorization): Promise<CardAuthorization | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db.insert(cardAuthorizations).values(auth);
  const result = await db.select().from(cardAuthorizations).where(eq(cardAuthorizations.id, auth.id!)).limit(1);
  return result[0];
}

export async function getCardAuthorizationsByUserId(userId: string, limit: number = 50): Promise<CardAuthorization[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(cardAuthorizations)
    .where(eq(cardAuthorizations.userId, userId))
    .orderBy(desc(cardAuthorizations.createdAt))
    .limit(limit);
}

// Exchange rate operations
export async function createExchangeRate(rate: InsertExchangeRate): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(exchangeRates).values(rate);
}

export async function getLatestExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select()
    .from(exchangeRates)
    .where(and(
      eq(exchangeRates.fromCurrency, fromCurrency),
      eq(exchangeRates.toCurrency, toCurrency)
    ))
    .orderBy(desc(exchangeRates.createdAt))
    .limit(1);

  return result[0];
}

