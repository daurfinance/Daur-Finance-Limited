# Daur Finance Limited

![Daur Finance](https://img.shields.io/badge/Daur%20Finance-Web3%20Banking-blue?style=for-the-badge)
![Tron](https://img.shields.io/badge/Blockchain-Tron-red?style=for-the-badge)
![Stripe](https://img.shields.io/badge/Cards-Stripe%20Issuing-purple?style=for-the-badge)

**Daur Finance Limited** is a modern Web3 fintech banking solution built as a Telegram Mini App. It combines the power of blockchain technology with traditional banking features to provide a seamless financial experience.

---

## 🌟 Features

### 💰 USDT Wallet (Tron TRC20)
- **Create Wallet** - Automatically generate secure Tron wallets
- **Send USDT** - Transfer USDT to any Tron address
- **Receive USDT** - Get your unique address and QR code
- **Real-time Balance** - Live balance updates from blockchain

### 💳 Virtual & Physical Cards (Stripe Issuing)
- **Instant Issuance** - Create virtual cards in seconds
- **Physical Cards** - Order physical cards for worldwide use
- **Spending Controls** - Set monthly limits and freeze cards
- **Real-time Authorizations** - Instant transaction notifications

### 📊 Transaction History
- **Complete History** - View all wallet and card transactions
- **Blockchain Explorer** - Direct links to Tronscan
- **Status Tracking** - Monitor pending, completed, and failed transactions

### 🔐 Security & Compliance
- **KYC Verification** - Built-in identity verification flow
- **Encrypted Keys** - AES-256 encryption for private keys
- **Secure Authentication** - OAuth-based login system
- **Role-based Access** - Admin and user roles

### 🎨 White Label Ready
- **Customizable Branding** - Change logo, colors, and name
- **Modular Architecture** - Easy to add or remove features
- **Multi-language Support** - Ready for internationalization

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- MySQL/TiDB database
- Stripe account (for card features)
- Telegram Bot (for Mini App)

### Installation

```bash
# Clone the repository
git clone https://github.com/daurfinance/daur-finance.git
cd daur-finance

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

---

## 📱 Telegram Mini App Integration

1. Create a bot via [@BotFather](https://t.me/botfather)
2. Set up Mini App with your deployment URL
3. Configure webhook for authentication
4. Test in Telegram

See [SETUP.md](./SETUP.md) for detailed instructions.

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19 + TypeScript
- Tailwind CSS 4
- shadcn/ui components
- tRPC for type-safe API calls
- Wouter for routing

**Backend:**
- Express 4
- tRPC 11
- Drizzle ORM
- MySQL/TiDB database

**Integrations:**
- Stripe Issuing API
- Tron blockchain (TronGrid)
- Manus OAuth

### Project Structure

```
daur-finance/
├── client/              # Frontend React app
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable UI components
│   │   └── lib/         # tRPC client
├── server/              # Backend Express app
│   ├── routers.ts       # tRPC routers
│   ├── db.ts            # Database helpers
│   ├── stripe.ts        # Stripe integration
│   └── tron.ts          # Tron blockchain
├── drizzle/             # Database schema
└── shared/              # Shared types
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=mysql://user:pass@host:port/db

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Wallet Security
WALLET_ENCRYPTION_KEY=your-secure-key

# Tron (optional)
TRON_API_KEY=your-api-key

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
```

See [SETUP.md](./SETUP.md) for complete configuration guide.

---

## 📖 API Documentation

### tRPC Routers

#### Wallet
- `wallet.get` - Get user's wallet
- `wallet.create` - Create new wallet
- `wallet.getBalance` - Get USDT and TRX balance
- `wallet.send` - Send USDT transaction

#### Cards
- `cards.list` - List user's cards
- `cards.create` - Issue new card
- `cards.get` - Get card details
- `cards.cancel` - Cancel a card

#### Transactions
- `transactions.list` - List transactions
- `transactions.get` - Get transaction details

#### KYC
- `kyc.submit` - Submit KYC documents
- `kyc.getStatus` - Get verification status

---

## 🎨 Customization

### Branding

Update in `.env`:
```bash
VITE_APP_TITLE="Your Bank Name"
VITE_APP_LOGO="https://your-logo.com/logo.png"
```

### Colors

Edit `client/src/index.css`:
```css
:root {
  --primary: oklch(0.55 0.25 260);
  --accent: oklch(0.65 0.20 200);
}
```

### Features

- Add new pages in `client/src/pages/`
- Create new routers in `server/routers.ts`
- Update database schema in `drizzle/schema.ts`

---

## 🧪 Testing

```bash
# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t daur-finance .

# Run container
docker run -p 3000:3000 daur-finance
```

---

## 🔒 Security

- **Private Key Encryption** - All wallet keys encrypted with AES-256
- **Secure Sessions** - JWT-based authentication
- **HTTPS Only** - Enforce secure connections in production
- **Rate Limiting** - Protect against abuse
- **Input Validation** - Zod schema validation on all inputs

**Important:** Always use strong encryption keys and enable all security features in production.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Support

- **GitHub Issues:** [Report bugs](https://github.com/daurfinance/daur-finance/issues)
- **Email:** support@daurfinance.com
- **Telegram:** [@daurfinance](https://t.me/daurfinance)

---

## 🙏 Acknowledgments

- **Tron Foundation** - Blockchain infrastructure
- **Stripe** - Payment and card issuing
- **Manus** - Development platform
- **shadcn/ui** - UI components

---

**Built with ❤️ by Daur Finance Team**

