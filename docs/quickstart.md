# Quick Start Guide - Superior Agents v2

This guide will walk you through setting up Superior Agents v2 from scratch, including creating necessary accounts and configuring the development environment.

## Prerequisites

- **Node.js 18-19**: [Download from nodejs.org](https://nodejs.org/)
- **Git**: For cloning the repository
- **Code Editor**: VS Code recommended
- **Hyperliquid Account**: For live trading (optional for development)

## Step 1: Clone and Setup Repository

```bash
# Clone the repository
git clone https://github.com/your-org/sa-opensource.git
cd sa-opensource

# Install dependencies
npm install
```

## Step 2: Create Convex Account and Project

Convex provides the real-time backend for Superior Agents.

### 2.1 Sign Up for Convex

1. Visit [convex.dev](https://convex.dev)
2. Click **"Sign Up"** and create an account using GitHub, Google, or email
3. Verify your email if required

### 2.2 Create a New Convex Project

1. From the Convex dashboard, click **"Create a project"**
2. Choose **"Empty project"** template
3. Name your project (e.g., `superior-agents-v2`)
4. Select your preferred region (closest to your location)
5. Click **"Create project"**

### 2.3 Install Convex CLI and Initialize

```bash
# Install Convex CLI globally
npm install -g convex

# Initialize Convex in your project
npx convex dev

# Follow the prompts:
# 1. Login to your Convex account (opens browser)
# 2. Select your project from the list
# 3. Choose "TypeScript" when asked about language preference
```

This will create:
- `convex/_generated/` directory with TypeScript types
- `.env.local` file with `CONVEX_URL`
- `convex.json` configuration file

### 2.4 Deploy Convex Functions

```bash
# Deploy your Convex functions
npx convex deploy

# Keep the dev server running for real-time updates
npx convex dev
```

## Step 3: Create Clerk Account and Setup Authentication

Clerk provides secure user authentication with built-in wallet connectivity.

### 3.1 Sign Up for Clerk

1. Visit [clerk.com](https://clerk.com)
2. Click **"Start building for free"**
3. Sign up using GitHub, Google, or email
4. Complete account verification

### 3.2 Create a New Clerk Application

1. From the Clerk dashboard, click **"Add application"**
2. Choose **"React"** as your framework
3. Name your application (e.g., `Superior Agents v2`)
4. Select authentication providers:
   - **Wallet**: Enable for crypto wallet login
   - **Email**: Enable for email/password login
   - **OAuth**: Add GitHub, Google as needed
5. Click **"Create application"**

### 3.3 Configure Clerk for Web3

1. In your Clerk application dashboard, go to **"User & Authentication"** → **"Web3"**
2. Enable **"Web3 authentication"**
3. Configure supported wallets:
   - MetaMask
   - WalletConnect
   - Coinbase Wallet
   - Add any other preferred wallets
4. Set up **"Sign-in URL"**: `http://localhost:3000/sign-in`
5. Set up **"Home URL"**: `http://localhost:3000`

### 3.4 Get Clerk Keys

1. Go to **"API Keys"** in your Clerk dashboard
2. Copy the **"Publishable key"** and **"Secret key"**
3. Add them to your `.env.local` file:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 4: Configure Environment Variables

Create or update your `.env.local` file with all required environment variables:

```env
# Convex (Auto-generated)
CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Hyperliquid (for live trading)
HYPERLIQUID_PRIVATE_KEY=your_private_key_here

# Optional: LLM Providers
OPENROUTER_API_KEY=your_openrouter_key
ANTHROPIC_API_KEY=your_anthropic_key

# Optional: Telegram Notifications
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

## Step 5: Initialize Database Schema

Deploy the Convex schema to set up your database:

```bash
# Ensure Convex dev server is running
npx convex dev

# The schema will be automatically deployed from convex/schema.js
# Check the Convex dashboard to verify tables are created:
# - agents
# - llmLogs
# - exportedFiles
```

## Step 6: Start Development Server

```bash
# Start the Next.js development server
npm run dev

# Your app should now be running at http://localhost:3000
```

## Step 7: Test Your Setup

### 7.1 Verify Authentication

1. Open `http://localhost:3000` in your browser
2. You should see the Superior Agents dashboard
3. Click authentication (wallet or email login)
4. Successful login means Clerk is working correctly

### 7.2 Verify Real-time Database

1. After logging in, the dashboard should load
2. Open browser developer tools → Network tab
3. Look for WebSocket connections to Convex
4. Real-time data sync means Convex is working correctly

### 7.3 Create Your First Agent (Optional)

1. Navigate to "Create Agent" in the dashboard
2. Configure agent parameters:
   - **Name**: Test Agent
   - **Persona**: Conservative trader
   - **Model**: Claude or GPT-4
   - **Trading Pairs**: BTC, ETH
3. Save the agent configuration

## Step 8: Optional Integrations

### 8.1 Hyperliquid Trading Setup

For live trading capabilities:

1. Create a [Hyperliquid](https://hyperliquid.xyz) account
2. Generate API keys or use private key
3. Add credentials to `.env.local`
4. **⚠️ Warning**: Start with testnet for development

### 8.2 Telegram Notifications

For real-time trading notifications:

1. Create a Telegram bot via [@BotFather](https://t.me/botfather)
2. Get your bot token
3. Create a Telegram group/channel
4. Add bot to group and get chat ID
5. Add credentials to `.env.local`

## Troubleshooting

### Common Issues

**Convex Connection Error**
```bash
# Ensure Convex dev server is running
npx convex dev

# Check if CONVEX_URL is correct in .env.local
```

**Clerk Authentication Error**
```bash
# Verify Clerk keys in .env.local
# Check allowed origins in Clerk dashboard
# Ensure localhost:3000 is whitelisted
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Database Schema Issues**
```bash
# Redeploy Convex functions
npx convex deploy

# Check Convex dashboard for deployment status
```

## Next Steps

✅ **Development Environment**: Ready for coding
✅ **Authentication**: Users can sign in securely  
✅ **Database**: Real-time data sync operational
✅ **Trading Ready**: Connect Hyperliquid for live trading

**Continue to:**
- [Architecture Documentation](./README.md) - Understand the system design
- [Agent Configuration](../superior-agent-v1/README.md) - Set up trading agents
- [API Documentation](https://docs.convex.dev) - Learn Convex patterns

## Support

- **Convex Documentation**: [docs.convex.dev](https://docs.convex.dev)
- **Clerk Documentation**: [clerk.com/docs](https://clerk.com/docs)
- **Hyperliquid API**: [hyperliquid.gitbook.io](https://hyperliquid.gitbook.io)
- **Superior Agents**: [superioragents.github.io](https://superioragents.github.io/superioragents-docs/)

---

**🎉 Congratulations!** Your Superior Agents v2 development environment is ready. You can now create AI trading agents and start building autonomous trading strategies.