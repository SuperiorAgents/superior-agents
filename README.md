# Superior Agents v2

An autonomous trading and marketing agent platform built with Next.js, Convex, and advanced AI capabilities.

## Overview

Superior Agents v2 represents the next evolution of autonomous cryptocurrency trading agents. This platform combines intelligent market analysis, autonomous trade execution, and real-time portfolio management in a modern web interface.

## Features

### Core Agent Capabilities
- **Market Research** – Analyze market trends, tokenomics, and narratives using AI
- **Strategy Formulation** – Generate intelligent, data-backed investment decisions
- **Autonomous Trading** – Execute trades automatically via Hyperliquid integration
- **Performance Assessment** – Real-time P&L tracking and portfolio analysis
- **Adaptive Learning** – Continuously improve strategies based on market feedback

### Platform Features
- **Real-time Dashboard** – Monitor multiple agents and their performance
- **Agent Management** – Create, configure, and manage trading agents
- **Research Viewer** – Access comprehensive market analysis and insights
- **Workflow Orchestration** – Automated trading pipelines with error handling
- **Live Notifications** – Telegram integration for real-time updates

## Architecture

### Frontend (v2)
- **Next.js 15** with App Router and React 19
- **TailwindCSS** + shadcn/ui components for modern UI
- **Clerk** authentication with dark theme
- **Real-time updates** via Convex subscriptions

### Backend
- **Convex** for database, real-time sync, and workflow orchestration
- **Hyperliquid** integration for trading execution and portfolio data
- **OpenRouter/Anthropic** LLM providers for agent reasoning
- **Encrypted key management** for secure trading operations

### Legacy System (v1)
The `superior-agent-v1/` directory contains the original Python-based framework with:
- FastAPI web server
- Meta Swap API (NestJS) for multi-aggregator swaps
- Notification service for data collection
- RAG API for enhanced research capabilities

## Quick Start

**📚 For detailed setup instructions with account creation, see [Quick Start Guide](docs/quickstart.md)**

### Prerequisites
- Node.js 18-19
- Convex account and project
- Clerk authentication setup
- Hyperliquid trading account (for live trading)

### Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create `.env.local` with required environment variables:
   ```env
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   # Additional keys for trading and notifications
   ```

3. **Start Development**:
   ```bash
   npm run dev
   ```

4. **Deploy Convex Functions**:
   ```bash
   npx convex dev
   ```

### Creating Your First Agent

1. Access the dashboard at `http://localhost:3000`
2. Sign in with Clerk authentication
3. Navigate to "Create Agent" 
4. Configure agent parameters (persona, model, trading pairs)
5. The agent will automatically generate trading strategies and execute trades

## Agent Lifecycle

1. **Creation** → Agent is initialized with persona and trading parameters
2. **Sleeping** → Agent waits for the next trading cycle based on sleep timing
3. **Running** → Agent analyzes markets, generates strategies, and executes trades
4. **Completed/Error** → Agent completes the cycle or handles errors gracefully
5. **Analysis** → Performance is analyzed and strategies are refined

## Supported Exchanges

Superior Agents supports trading across multiple centralized and decentralized exchanges:

### V2 System (Current)

#### Centralized Exchanges (DEX)
- **Hyperliquid** - Primary perpetuals and spot trading platform
  - Perpetuals: BTC-PERP, ETH-PERP, SOL-PERP, and 50+ other pairs
  - Spot trading: BTC-SPOT, ETH-SPOT, SOL-SPOT, and more
  - Advanced order types: Market, limit, stop-loss, take-profit, trigger orders
  - Real-time portfolio tracking and P&L analysis
  - Leverage management and position sizing

### V1 System (Legacy Meta-Swap-API)

#### DEX Protocols & Aggregators
- **1inch v6** - Multi-chain DEX aggregator (Ethereum)
- **OKX DEX** - CEX's DEX aggregation service (Ethereum, Solana)
- **Uniswap v3** - Leading Ethereum DEX with optimal routing
- **KyberSwap** - Multi-chain DEX aggregator (Ethereum)
- **OpenOcean** - Cross-DEX liquidity aggregation (Ethereum)
- **Raydium** - Solana-native DEX and AMM

#### Price Feed Providers
- **Binance** - Real-time price data via public API
- **Kraken** - Price feeds for market analysis

### Trading Capabilities

- **Spot Trading**: Token-to-token swaps across all supported DEX protocols
- **Perpetuals**: Full derivatives trading on Hyperliquid
- **Cross-Chain**: Ethereum and Solana ecosystem support
- **Multi-DEX Routing**: Intelligent liquidity aggregation for optimal execution
- **Risk Management**: Built-in stop-loss, take-profit, and position management

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Legacy v1 System

For the original Python-based system, see `superior-agent-v1/README.md`. The v1 system includes:

- Full Docker-based deployment
- Python trading agents with FastAPI
- Multi-service architecture (swap API, notifications, RAG)
- Comprehensive setup via `bootstrap.sh`

## Documentation

- **Architecture Diagrams**: See `docs/` directory for detailed system architecture
- **Framework Documentation**: [superioragents.github.io](https://superioragents.github.io/superioragents-docs/)
- **v1 System Setup**: See `superior-agent-v1/README.md`
- **Development Guide**: See `CLAUDE.md` for technical details

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the [Apache License 2.0](LICENSE).

---

**⚠️ Disclaimer**: This software is for educational and research purposes. Cryptocurrency trading involves substantial risk. Always do your own research and trade responsibly.