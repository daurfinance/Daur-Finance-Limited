import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as tron from "./tron";
import * as stripe from "./stripe";
import { randomBytes } from "crypto";

// Initialize Tron and Stripe (in production, get these from env)
tron.initTron();
// stripe.initStripe(process.env.STRIPE_SECRET_KEY || "", process.env.STRIPE_WEBHOOK_SECRET || "");

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  wallet: router({
    // Get user's wallet
    get: protectedProcedure.query(async ({ ctx }) => {
      const wallet = await db.getWalletByUserId(ctx.user.id);
      
      if (!wallet) {
        return null;
      }

      // Update balance from blockchain
      const balance = await tron.getUSDTBalance(wallet.address);
      if (balance !== wallet.balance) {
        await db.updateWalletBalance(wallet.id, balance);
      }

      return {
        ...wallet,
        balance,
        // Don't expose private key
        privateKeyEncrypted: undefined,
      };
    }),

    // Create new wallet for user
    create: protectedProcedure.mutation(async ({ ctx }) => {
      // Check if user already has a wallet
      const existingWallet = await db.getWalletByUserId(ctx.user.id);
      if (existingWallet) {
        throw new Error("User already has a wallet");
      }

      // Generate wallet
      const encryptionKey = process.env.WALLET_ENCRYPTION_KEY || "default-key-change-in-production";
      const { address, privateKeyEncrypted } = await tron.generateWallet(encryptionKey);

      // Save to database
      const wallet = await db.createWallet({
        id: randomBytes(16).toString('hex'),
        userId: ctx.user.id,
        address,
        privateKeyEncrypted,
        network: "tron",
        balance: "0",
      });

      return {
        ...wallet,
        privateKeyEncrypted: undefined,
      };
    }),

    // Get balance
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const wallet = await db.getWalletByUserId(ctx.user.id);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      const usdtBalance = await tron.getUSDTBalance(wallet.address);
      const trxBalance = await tron.getTRXBalance(wallet.address);

      return {
        usdt: usdtBalance,
        trx: trxBalance,
        address: wallet.address,
      };
    }),

    // Send USDT
    send: protectedProcedure
      .input(z.object({
        toAddress: z.string(),
        amount: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const wallet = await db.getWalletByUserId(ctx.user.id);
        if (!wallet) {
          throw new Error("Wallet not found");
        }

        // Validate address
        if (!tron.isValidTronAddress(input.toAddress)) {
          throw new Error("Invalid Tron address");
        }

        // Check balance
        const balance = await tron.getUSDTBalance(wallet.address);
        if (parseFloat(balance) < parseFloat(input.amount)) {
          throw new Error("Insufficient balance");
        }

        // Create transaction record
        const transaction = await db.createTransaction({
          id: randomBytes(16).toString('hex'),
          userId: ctx.user.id,
          type: "transfer",
          amount: input.amount,
          currency: "USDT",
          status: "pending",
          fromAddress: wallet.address,
          toAddress: input.toAddress,
        });

        if (!transaction) {
          throw new Error("Failed to create transaction");
        }

        // Decrypt private key and send
        const encryptionKey = process.env.WALLET_ENCRYPTION_KEY || "default-key-change-in-production";
        const privateKey = tron.decryptPrivateKey(wallet.privateKeyEncrypted, encryptionKey);

        const result = await tron.sendUSDT({
          fromAddress: wallet.address,
          privateKey,
          toAddress: input.toAddress,
          amount: input.amount,
        });

        if (result.success && result.txHash) {
          await db.updateTransactionStatus(transaction.id, "completed", result.txHash);
          return {
            success: true,
            txHash: result.txHash,
            transaction,
          };
        } else {
          await db.updateTransactionStatus(transaction.id, "failed");
          throw new Error(result.error || "Transaction failed");
        }
      }),
  }),

  cards: router({
    // List user's cards
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCardsByUserId(ctx.user.id);
    }),

    // Create new card (requires Stripe setup)
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["virtual", "physical"]),
        spendingLimit: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Note: This requires proper Stripe Issuing setup
        // For now, return mock data
        throw new Error("Card creation requires Stripe API key configuration");
        
        /* Uncomment when Stripe is configured:
        const user = ctx.user;
        
        // Create cardholder if not exists
        const cardholder = await stripe.createCardholder({
          name: user.name || "User",
          email: user.email || "",
          billing: {
            address: {
              line1: "123 Main St",
              city: "San Francisco",
              state: "CA",
              postal_code: "94111",
              country: "US",
            },
          },
        });

        // Create card
        const stripeCard = await stripe.createIssuingCard({
          cardholderId: cardholder.id,
          currency: "usd",
          type: input.type,
          spendingControls: input.spendingLimit ? {
            spending_limits: [{
              amount: parseInt(input.spendingLimit) * 100, // Convert to cents
              interval: "monthly",
            }],
          } : undefined,
        });

        // Save to database
        const card = await db.createCard({
          id: randomBytes(16).toString('hex'),
          userId: ctx.user.id,
          stripeCardId: stripeCard.id,
          last4: stripeCard.last4,
          brand: stripeCard.brand,
          status: "active",
          cardholderName: user.name || "",
          expiryMonth: stripeCard.exp_month,
          expiryYear: stripeCard.exp_year,
          spendingLimit: input.spendingLimit,
        });

        return card;
        */
      }),

    // Get card details
    get: protectedProcedure
      .input(z.object({ cardId: z.string() }))
      .query(async ({ ctx, input }) => {
        const card = await db.getCardById(input.cardId);
        
        if (!card || card.userId !== ctx.user.id) {
          throw new Error("Card not found");
        }

        return card;
      }),

    // Cancel card
    cancel: protectedProcedure
      .input(z.object({ cardId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const card = await db.getCardById(input.cardId);
        
        if (!card || card.userId !== ctx.user.id) {
          throw new Error("Card not found");
        }

        // Update in Stripe
        // await stripe.updateCardStatus(card.stripeCardId, "canceled");

        // Update in database
        await db.updateCardStatus(input.cardId, "canceled");

        return { success: true };
      }),
  }),

  transactions: router({
    // List user's transactions
    list: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getTransactionsByUserId(ctx.user.id, input.limit);
      }),

    // Get transaction details
    get: protectedProcedure
      .input(z.object({ txHash: z.string() }))
      .query(async ({ ctx, input }) => {
        try {
          const txData = await tron.getTransaction(input.txHash);
          return txData;
        } catch (error: any) {
          throw new Error(error.message || "Transaction not found");
        }
      }),
  }),

  exchange: router({
    // Get exchange rate
    getRate: protectedProcedure
      .input(z.object({
        from: z.string(),
        to: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const rate = await db.getLatestExchangeRate(input.from, input.to);
        
        if (!rate) {
          // Return default rate for USDT/USD
          if (input.from === "USDT" && input.to === "USD") {
            return { rate: "1.0", from: "USDT", to: "USD" };
          }
          throw new Error("Exchange rate not found");
        }

        return rate;
      }),
  }),

  kyc: router({
    // Submit KYC documents
    submit: protectedProcedure
      .input(z.object({
        documents: z.string(), // JSON string of document URLs
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUser(ctx.user.id);
        if (!user) {
          throw new Error("User not found");
        }

        await db.upsertUser({
          id: ctx.user.id,
          kycDocuments: input.documents,
          kycStatus: "pending",
        });

        return { success: true };
      }),

    // Get KYC status
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUser(ctx.user.id);
      return {
        status: user?.kycStatus || "pending",
        documents: user?.kycDocuments,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;

