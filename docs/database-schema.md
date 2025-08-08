# Database Schema - Superior Agents v2

## Convex Database Structure

```mermaid
erDiagram
    agents ||--o{ llmLogs : generates
    agents ||--o{ exportedFiles : creates
    agents ||--o{ params : configured_by
    
    agents {
        string _id PK
        number _creationTime
        string name UK "Unique agent name"
        string persona "Agent personality/behavior"
        string endpoint "LLM API endpoint"
        string model "AI model (claude, gpt-4, etc)"
        number temperature "LLM temperature setting"
        object secret "Encrypted trading keys"
        object status "Current agent state"
    }
    
    llmLogs {
        string _id PK
        string runId "Execution run identifier"
        string agentName FK "Reference to agent"
        string text "LLM response text"
        array toolCalls "Function calls made"
        array toolResults "Function call results"
        string finishReason "Completion reason"
        object usage "Token usage stats"
        string threadId "Conversation thread"
        object analysis "Trade analysis results"
    }
    
    exportedFiles {
        string _id PK
        string agentName FK "Reference to agent"
        string coin "Trading pair/coin"
        string startTime "Export start time"
        string endTime "Export end time"
        string fileName "Exported file name"
        string storageId "Convex file storage ID"
    }
    
    params {
        string _id PK
        string agentName FK "Reference to agent"
        object params "Trading parameters"
    }
```

## Agent Schema Details

### Agent Status Object Structure
```mermaid
graph TB
    subgraph "Agent Status"
        STATE[state: enum]
        LAST[lastRunAt: timestamp]
        MSG[message: string]
    end
    
    subgraph "State Values"
        CREATED[CREATED]
        PAUSED[PAUSED]
        ERROR[ERROR]
        SLEEPING[SLEEPING]
        RUNNING[RUNNING]
        TIMEOUT[TIMEOUT]
    end
    
    STATE --> CREATED
    STATE --> PAUSED
    STATE --> ERROR
    STATE --> SLEEPING
    STATE --> RUNNING
    STATE --> TIMEOUT
```

### Secret Object Structure
```mermaid
graph LR
    subgraph "Secret Storage"
        HYPER[hyperliquid: string]
        TEST[hyperliquid_testnet: string]
        OTHER[other_exchanges: string]
    end
    
    subgraph "Key Format"
        FORMAT["publicKey:privateKey"]
        ENCRYPT[AES Encrypted]
        SECURE[Secure Storage]
    end
    
    HYPER --> FORMAT
    TEST --> FORMAT
    OTHER --> FORMAT
    
    FORMAT --> ENCRYPT
    ENCRYPT --> SECURE
```

## LLM Logs Schema Details

### Analysis Object Structure
```mermaid
graph TB
    subgraph "Trade Analysis"
        RISK[riskAssessment: string]
        MARKET[marketContext: string]
        POSITION[positionDetails: string]
        TOOL[toolResultsAnalysis: string]
        ISSUES[executionIssues: string]
        ACTIONS[actions: array]
        TRADE[hasTradeExecuted: boolean]
        COIN[coinTraded: array]
        REASON[keyReasoning: string]
        DECISION[tradeDecision: string]
    end
    
    subgraph "Action Object"
        ACTION[action: string]
        COINS[coin: array]
        REASONING[reasoning: string]
        SUCCESS[isSucceeded: boolean]
    end
    
    ACTIONS --> ACTION
    ACTIONS --> COINS
    ACTIONS --> REASONING
    ACTIONS --> SUCCESS
```

### Usage Object Structure
```mermaid
graph LR
    subgraph "Token Usage"
        PROMPT[promptTokens: number]
        COMPLETION[completionTokens: number]
        TOTAL[totalTokens: number]
    end
    
    PROMPT --> TOTAL
    COMPLETION --> TOTAL
```

## Database Indexes

```mermaid
graph TB
    subgraph "LLM Logs Indexes"
        IDX1[by_agent: agentName]
        IDX2[by_agent_run: agentName, runId]
        IDX3[by_agent_with_trade_analyzed: agentName, hasTradeExecuted, coinTraded]
    end
    
    subgraph "Exported Files Indexes"
        IDX4[by_agent: agentName]
        IDX5[by_agent_coin: agentName, coin]
    end
    
    subgraph "Query Optimization"
        FAST1[Fast Agent Lookup]
        FAST2[Run-based Queries]
        FAST3[Trade Analysis Queries]
        FAST4[File Management]
    end
    
    IDX1 --> FAST1
    IDX2 --> FAST2
    IDX3 --> FAST3
    IDX4 --> FAST4
    IDX5 --> FAST4
```

## Data Flow Through Database

```mermaid
sequenceDiagram
    participant Agent
    participant DB
    participant Workflow
    participant Analysis
    participant UI

    Note over Agent,UI: Agent Creation Flow
    Agent->>DB: Insert Agent Record
    DB->>DB: Generate Keys & Encrypt
    DB-->>Agent: Agent Created
    
    Note over Agent,UI: Trading Execution Flow
    Workflow->>DB: Update Agent Status (RUNNING)
    Workflow->>DB: Insert LLM Log (Strategy)
    Workflow->>DB: Insert LLM Log (Execution)
    
    Note over Agent,UI: Analysis Flow
    Analysis->>DB: Query LLM Logs
    Analysis->>DB: Update Analysis Results
    DB->>UI: Real-time Sync
    
    Note over Agent,UI: Performance Query
    UI->>DB: Query Agent with P&L
    DB->>DB: Calculate Performance Metrics
    DB-->>UI: Agent List with Stats
```

## Storage Patterns

### Real-time Data
```mermaid
graph LR
    subgraph "Live Data"
        AGENT_STATUS[Agent Status]
        PORTFOLIO[Portfolio P&L]
        TRADES[Active Trades]
    end
    
    subgraph "Storage Pattern"
        REALTIME[Real-time Updates]
        SUBSCRIBE[Subscription Based]
        WEBSOCKET[WebSocket Sync]
    end
    
    AGENT_STATUS --> REALTIME
    PORTFOLIO --> SUBSCRIBE
    TRADES --> WEBSOCKET
```

### Historical Data
```mermaid
graph LR
    subgraph "Historical Records"
        LOGS[LLM Execution Logs]
        ANALYSIS[Trade Analysis]
        FILES[Exported Data]
    end
    
    subgraph "Storage Pattern"
        APPEND[Append Only]
        INDEXED[Indexed Queries]
        ARCHIVE[Long-term Storage]
    end
    
    LOGS --> APPEND
    ANALYSIS --> INDEXED
    FILES --> ARCHIVE
```

## Query Patterns

### Common Queries
```mermaid
flowchart TD
    subgraph "Agent Queries"
        Q1[Get All Agents]
        Q2[Get Agent by Name]
        Q3[Get Agents with P&L]
        Q4[Update Agent Status]
    end
    
    subgraph "Log Queries"
        Q5[Get Logs by Agent]
        Q6[Get Logs by Run ID]
        Q7[Get Trade Analysis]
        Q8[Insert LLM Log]
    end
    
    subgraph "Performance Queries"
        Q9[Calculate Weekly P&L]
        Q10[Get Trade History]
        Q11[Performance Metrics]
        Q12[Risk Analysis]
    end
    
    Q1 --> Q9
    Q2 --> Q5
    Q3 --> Q10
    Q4 --> Q8
```

## Data Consistency

```mermaid
graph TB
    subgraph "ACID Properties"
        ATOMIC[Atomicity]
        CONSISTENT[Consistency]
        ISOLATED[Isolation]
        DURABLE[Durability]
    end
    
    subgraph "Convex Guarantees"
        REALTIME[Real-time Sync]
        TRANSACTION[Transactional]
        OPTIMISTIC[Optimistic Updates]
        REACTIVE[Reactive Queries]
    end
    
    ATOMIC --> TRANSACTION
    CONSISTENT --> REALTIME
    ISOLATED --> OPTIMISTIC
    DURABLE --> REACTIVE
```