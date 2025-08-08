# Data Flow - Superior Agents v2

## Agent Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant Dashboard
    participant Convex
    participant Agent
    participant Hyperliquid

    User->>Dashboard: Create Agent Request
    Dashboard->>Convex: createAgentWithParams()
    Convex->>Convex: Generate Wallet & Keys
    Convex->>Convex: Store Agent Config
    Convex->>Agent: Initialize Agent
    Agent->>Hyperliquid: Setup Trading Account
    Hyperliquid-->>Agent: Account Ready
    Agent-->>Convex: Agent Status: SLEEPING
    Convex-->>Dashboard: Real-time Update
    Dashboard-->>User: Agent Created
```

## Trading Execution Flow

```mermaid
sequenceDiagram
    participant Cron
    participant Workflow
    participant Agent
    participant LLM
    participant Hyperliquid
    participant Telegram

    Cron->>Workflow: Trigger Agent Run
    Workflow->>Agent: Check Agent Status
    Agent-->>Workflow: Status: SLEEPING
    Workflow->>Workflow: Update Status: RUNNING
    Workflow->>Telegram: Notify Start
    
    Workflow->>LLM: Generate Trading Strategy
    LLM-->>Workflow: Strategy & Trades
    
    Workflow->>Hyperliquid: Execute Trades
    Hyperliquid-->>Workflow: Trade Results
    
    Workflow->>Agent: Analyze Performance
    Agent-->>Workflow: Analysis Complete
    
    Workflow->>Workflow: Update Status: SLEEPING
    Workflow->>Telegram: Notify Completion
```

## Real-time Data Synchronization

```mermaid
graph LR
    subgraph "Data Sources"
        HYP[Hyperliquid API]
        LLM[LLM Responses]
        USER[User Actions]
    end

    subgraph "Convex Backend"
        DB[(Database)]
        SUB[Subscriptions]
        MUT[Mutations]
    end

    subgraph "Frontend"
        HOOK[useQuery Hooks]
        UI[React Components]
        STATE[Client State]
    end

    HYP -->|Portfolio Data| MUT
    LLM -->|Agent Logs| MUT
    USER -->|UI Actions| MUT
    
    MUT --> DB
    DB --> SUB
    SUB -->|WebSocket| HOOK
    HOOK --> STATE
    STATE --> UI
```

## Portfolio Data Flow

```mermaid
flowchart TD
    A[Agent Workflow] -->|Request Portfolio| B[Hyperliquid Info API]
    B -->|Raw Portfolio Data| C[Portfolio Processing]
    C -->|Structured Data| D[P&L Calculation]
    D -->|Weekly P&L| E[Database Storage]
    E -->|Real-time Sync| F[Dashboard Display]
    
    G[Trading Execution] -->|Trade Results| H[Position Updates]
    H -->|Updated Positions| B
    
    I[Risk Management] -->|Stop Loss/Take Profit| J[Order Management]
    J -->|Order Status| K[Portfolio Impact]
    K --> C
```

## Agent Communication Flow

```mermaid
graph TB
    subgraph "Agent Management"
        AM[Agent Manager]
        AS[Agent Status]
        AC[Agent Config]
    end

    subgraph "Workflow Orchestration"
        WM[Workflow Manager]
        WS[Workflow State]
        WR[Workflow Results]
    end

    subgraph "External Communication"
        TG[Telegram Bot]
        LOG[Logging System]
        ALERT[Alert System]
    end

    AM --> WM
    AS --> WS
    AC --> WM
    
    WM --> TG
    WS --> LOG
    WR --> ALERT
    
    TG -->|Status Updates| AM
    LOG -->|Error Tracking| AS
    ALERT -->|Performance Alerts| WM
```

## LLM Integration Flow

```mermaid
sequenceDiagram
    participant Agent
    participant LLMProvider
    participant Database
    participant Analyzer

    Agent->>LLMProvider: Strategy Generation Request
    Note over LLMProvider: OpenRouter/Anthropic
    LLMProvider-->>Agent: Trading Strategy
    
    Agent->>Database: Store LLM Logs
    Note over Database: Text, Tool Calls, Usage
    
    Agent->>LLMProvider: Trade Execution Request
    LLMProvider-->>Agent: Trade Commands
    
    Agent->>Database: Store Execution Logs
    Agent->>Analyzer: Analyze Performance
    
    Analyzer->>Database: Store Analysis Results
    Note over Database: Risk Assessment, Actions, P&L
```