# Daur Finance Limited - Setup Guide

## Overview

Daur Finance Limited is a Web3 fintech banking solution designed as a Telegram Mini App with:
- **USDT Wallet** on Tron blockchain (TRC20)
- **Stripe Issuing** integration for virtual and physical cards
- **White Label** architecture for easy customization

---

## Prerequisites

1. **Stripe Account** with Issuing enabled
2. **Telegram Bot** created via [@BotFather](https://t.me/botfather)
3. **Tron API Key** (optional, for production use)
4. **Database** (MySQL/TiDB) - already configured via Manus platform

---

## Environment Variables

### Required for Production

Add these environment variables to your project:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Wallet Encryption
WALLET_ENCRYPTION_KEY=your-secure-encryption-key-change-this

# Tron API (optional, for better rate limits)
TRON_API_KEY=your-trongrid-api-key

# Telegram Bot (for Mini App)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_MINI_APP_URL=https://your-app-url.com
```

### How to Set Environment Variables

Use the Manus platform's environment variable management or add them via the project settings.

---

## Stripe Issuing Setup

### 1. Enable Stripe Issuing

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Issuing** → **Get Started**
3. Complete the onboarding process
4. Verify your business information

### 2. Create Cardholders

Cardholders are created automatically when users request cards via the app. The system uses the user's profile information.

### 3. Configure Webhooks

Set up webhooks to receive real-time authorization events:

1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-app-url.com/api/stripe/webhook`
3. Select events:
   - `issuing_authorization.created`
   - `issuing_authorization.updated`
   - `issuing_card.created`
   - `issuing_card.updated`
   - `issuing_transaction.created`

4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 4. Uncomment Stripe Code

In `server/routers.ts`, uncomment the Stripe initialization:

```typescript
// Line 12-13
stripe.initStripe(
  process.env.STRIPE_SECRET_KEY || "", 
  process.env.STRIPE_WEBHOOK_SECRET || ""
);
```

Also uncomment the card creation logic in the `cards.create` mutation (lines 180-220).

---

## Tron Blockchain Setup

### 1. Wallet Generation

The app automatically generates Tron wallets for users. Private keys are encrypted using AES-256-CBC.

**Security Note:** Change `WALLET_ENCRYPTION_KEY` to a strong, unique value in production.

### 2. TronGrid API (Optional)

For better rate limits and reliability:

1. Sign up at [TronGrid](https://www.trongrid.io)
2. Get your API key
3. Add to environment: `TRON_API_KEY=your-key`

### 3. Production Wallet Integration

For production, replace the mock wallet generation in `server/tron.ts` with [TronWeb](https://github.com/tronprotocol/tronweb):

```bash
pnpm add tronweb
```

Update `generateWallet()` function:

```typescript
import TronWeb from 'tronweb';

export async function generateWallet(encryptionKey: string) {
  const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
  });
  
  const account = await tronWeb.createAccount();
  
  // Encrypt private key
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(account.privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  encrypted = iv.toString('hex') + ':' + encrypted;
  
  return {
    address: account.address.base58,
    privateKeyEncrypted: encrypted,
  };
}
```

---

## Telegram Mini App Setup

### 1. Create Telegram Bot

1. Open [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Follow instructions to create your bot
4. Save the bot token

### 2. Configure Mini App

1. Send `/newapp` to @BotFather
2. Select your bot
3. Provide app details:
   - **Title:** Daur Finance
   - **Description:** Your Web3 Banking Solution
   - **Photo:** Upload app icon
   - **Web App URL:** `https://your-app-url.com`

### 3. Test in Telegram

1. Open your bot in Telegram
2. Send `/start`
3. Click the Mini App button
4. Your app should load in Telegram's in-app browser

### 4. Telegram Authentication

To enable Telegram authentication, add Telegram Login Widget:

```typescript
// In server/routers.ts, add new auth method
telegramAuth: publicProcedure
  .input(z.object({
    id: z.number(),
    first_name: z.string(),
    username: z.string().optional(),
    auth_date: z.number(),
    hash: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Verify Telegram data
    // Create/update user
    // Return session token
  });
```

---

## Database Schema

The database is automatically set up with these tables:

- **users** - User accounts and KYC status
- **wallets** - Tron wallets with encrypted keys
- **cards** - Stripe Issuing cards
- **transactions** - All financial transactions
- **cardAuthorizations** - Card authorization requests
- **exchangeRates** - Currency conversion rates

To view or modify the schema, see `drizzle/schema.ts`.

---

## White Label Customization

### 1. Branding

Update environment variables:

```bash
VITE_APP_TITLE="Your Bank Name"
VITE_APP_LOGO="https://your-logo-url.com/logo.png"
```

### 2. Colors

Edit `client/src/index.css` to change the color scheme:

```css
:root {
  --primary: oklch(0.55 0.25 260); /* Your primary color */
  --accent: oklch(0.65 0.20 200);  /* Your accent color */
}
```

### 3. Features

Enable/disable features by modifying the UI components:

- Remove card features: Delete `Cards.tsx` and related routes
- Add new features: Create new pages and tRPC routers

---

## Security Checklist

- [ ] Change `WALLET_ENCRYPTION_KEY` to a strong random value
- [ ] Enable Stripe webhook signature verification
- [ ] Set up rate limiting on API endpoints
- [ ] Enable 2FA for admin accounts
- [ ] Configure CORS properly for production
- [ ] Use HTTPS only in production
- [ ] Implement proper KYC verification flow
- [ ] Set up monitoring and alerts
- [ ] Regular security audits

---

## Deployment

### Using Vercel

1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy

### Using Docker

```bash
# Build
docker build -t daur-finance .

# Run
docker run -p 3000:3000 \
  -e STRIPE_SECRET_KEY=... \
  -e WALLET_ENCRYPTION_KEY=... \
  daur-finance
```

---

## Testing

### Test Stripe Cards

Use Stripe test mode:
- Test card numbers: [Stripe Testing](https://stripe.com/docs/testing)
- Simulate authorizations in Stripe Dashboard

### Test Tron Transactions

Use Tron testnet (Nile):
- Get test TRX from [Nile Faucet](https://nileex.io/join/getJoinPage)
- Update API URL to `https://nile.trongrid.io`

---

## Support

For issues or questions:
- GitHub Issues: [daurfinance/Daur-MedIA](https://github.com/daurfinance/Daur-MedIA)
- Email: support@daurfinance.com

---

## License

MIT License - See LICENSE file for details

