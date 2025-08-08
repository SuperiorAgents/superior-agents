# System Architecture - Superior Agents v2

## High-Level Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Next.js Dashboard]
        Auth[Clerk Authentication]
        Components[shadcn/ui Components]
    end

    subgraph "Backend Layer - Convex"
        DB[(Convex Database)]
        WF[Workflow Engine]
        RT[Real-time Sync]
        API[Convex Functions]
    end

    subgraph "AI Layer"
        LLM[LLM Providers]
        AGT[AI Agents]
        ANA[Trade Analyzer]
    end

    subgraph "Trading Layer"
        HYP[Hyperliquid Exchange]
        PORT[Portfolio Manager]
        RISK[Risk Management]
    end

    subgraph "External Services"
        TEL[Telegram Bot]
        PRICE[Price Feeds]
        NEWS[Market Data]
    end

    UI --> Auth
    UI --> Components
    UI --> RT
    
    Auth --> API
    Components --> API
    RT --> DB
    
    API --> WF
    API --> DB
    WF --> AGT
    
    AGT --> LLM
    AGT --> ANA
    AGT --> PORT
    
    PORT --> HYP
    PORT --> RISK
    
    WF --> TEL
    AGT --> PRICE
    AGT --> NEWS
    
    HYP --> PORT
    ANA --> DB
```

## Component Details

### Frontend Layer
- **Next.js Dashboard**: Modern React 19 application with App Router
- **Clerk Authentication**: Secure user authentication with dark theme
- **shadcn/ui Components**: Consistent UI components built on Radix primitives

### Backend Layer (Convex)
- **Convex Database**: Real-time database with automatic synchronization
- **Workflow Engine**: Orchestrates complex trading operations with retry logic
- **Real-time Sync**: WebSocket connections for instant UI updates
- **Convex Functions**: Server-side logic for queries, mutations, and actions

### AI Layer
- **LLM Providers**: OpenRouter, Anthropic Claude for strategy generation
- **AI Agents**: Autonomous agents with configurable personas and models
- **Trade Analyzer**: Post-trade analysis and performance assessment

### Trading Layer
- **Hyperliquid Exchange**: Primary trading venue for perpetuals and spot
- **Portfolio Manager**: Real-time P&L tracking and position management
- **Risk Management**: Stop-loss, take-profit, and leverage controls

### External Services
- **Telegram Bot**: Real-time notifications and status updates
- **Price Feeds**: Market data from various sources
- **Market Data**: News and sentiment analysis for trading decisions

## Technology Stack

```mermaid
graph LR
    subgraph "Frontend"
        A[Next.js 15]
        B[React 19]
        C[TailwindCSS]
        D[TypeScript]
    end

    subgraph "Backend"
        E[Convex]
        F[Node.js]
        G[Workflow Engine]
        H[Real-time DB]
    end

    subgraph "AI/ML"
        I[OpenRouter]
        J[Anthropic]
        K[Claude Sonnet]
        L[Strategy Generation]
    end

    subgraph "Trading"
        M[Hyperliquid SDK]
        N[Ethers.js]
        O[Portfolio APIs]
        P[Risk Engine]
    end
```

## Security Architecture

```mermaid
graph TB
    subgraph "Authentication"
        CLERK[Clerk Auth]
        JWT[JWT Tokens]
        RBAC[Role-Based Access]
    end

    subgraph "Key Management"
        ENCRYPT[Encrypted Storage]
        PRIV[Private Keys]
        WALLET[Wallet Generation]
    end

    subgraph "API Security"
        HTTPS[HTTPS/TLS]
        CORS[CORS Policy]
        RATE[Rate Limiting]
    end

    subgraph "Trading Security"
        SIGN[Transaction Signing]
        MULTI[Multi-sig Support]
        AUDIT[Audit Logging]
    end

    CLERK --> JWT
    JWT --> RBAC
    
    ENCRYPT --> PRIV
    PRIV --> WALLET
    
    HTTPS --> CORS
    CORS --> RATE
    
    SIGN --> MULTI
    MULTI --> AUDIT
```