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
npm install
npm run start:dev
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

## TODO

- [ ] Integrate with vault signer