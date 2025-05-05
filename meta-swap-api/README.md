# Meta Swap API

NestJS-based API service supporting multiple aggregators for optimal swap execution.

## Supported Aggregators

- eth
    + 1inch
    + kyber
    + openfinance
- solana
    + okx
    + raydium

## Getting started

```bash
cd meta-swap-api
cp .env.example .env
docker compose up --build
```

## Project Structure

```
├── src/
│   ├── app.module.ts          # Main application module
│   ├── main.ts                # Application entry point
│   ├── exception.filter.ts    # Global exception handler
│   ├── logger.instance.ts     # Logger configuration
│   ├── blockchain/           # Blockchain interaction logic
│   ├── errors/               # Custom error definitions
│   ├── signers/              # Transaction signing utilities
│   ├── swap/                 # Core swap functionality
│   ├── swap-providers/       # Different swap provider implementations
│   └── token-info/           # Token information and metadata
├── dist/                     # Compiled output
├── node_modules/             # Dependencies
├── .env                      # Environment variables
├── .env.example             # Environment variables template
├── package.json             # Project metadata and dependencies
├── package-lock.json        # Locked dependencies
└── tsconfig.json           # TypeScript configuration
```

## Key Components

- **app.module.ts**: Root module that ties together all feature modules
- **main.ts**: Bootstrap file that initializes the NestJS application
- **blockchain/**: Contains blockchain interaction logic
- **errors/**: Custom error definitions for better error handling
- **signers/**: Handles transaction signing and key management
- **swap/**: Core swap logic implementation
- **swap-providers/**: Different DEX and swap provider integrations
- **token-info/**: Token metadata and information management

## Environment Variable

Make sure to include these variables to .env file in meta-swap-api's directory
```env
PORT=9009

# Solana Configuration
SOLANA_RPC_URL=
SOLANA_PRIVATE_KEY=
# Ethereum Configuration
ETH_RPC_URL=
ETH_PRIVATE_KEY=

# 1inch API Configuration
ONEINCH_API_KEY="api key 1,api key 2"

OKX_API_KEY=
OKX_SECRET_KEY=
OKX_API_PASSPHRASE=
OKX_PROJECT_ID=
```

## Quickstart

1. Navigate to the notification directory:

```bash
cd meta-swap-api
```

2. Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

3. Start the notification worker:

```bash
docker compose up --build
```