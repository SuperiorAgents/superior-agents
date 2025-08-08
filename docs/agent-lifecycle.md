# Agent Lifecycle - Superior Agents v2

## Agent State Machine

```mermaid
stateDiagram-v2
    [*] --> CREATED: Agent Initialization
    CREATED --> SLEEPING: Setup Complete
    SLEEPING --> RUNNING: Cron Trigger
    RUNNING --> COMPLETED: Success
    RUNNING --> ERROR: Failure
    RUNNING --> TIMEOUT: Execution Timeout
    COMPLETED --> SLEEPING: Cool Down
    ERROR --> SLEEPING: Error Handled (Prod)
    ERROR --> PAUSED: Manual Intervention (Dev)
    TIMEOUT --> PAUSED: Manual Review Required
    PAUSED --> SLEEPING: Manual Resume
    SLEEPING --> [*]: Agent Deleted
```

## Detailed State Descriptions

### CREATED
- **Initial State**: Agent just created with configuration
- **Duration**: Instantaneous
- **Actions**: 
  - Generate wallet and private keys
  - Store encrypted credentials
  - Initialize agent parameters
- **Next State**: SLEEPING

### SLEEPING
- **Purpose**: Agent waiting for next execution cycle
- **Duration**: Based on `sleepTimeSecond` parameter (configurable)
- **Conditions**: 
  - Time since last run >= sleep duration
  - Agent has valid configuration
  - No manual pause
- **Next State**: RUNNING (when triggered by cron)

### RUNNING
- **Purpose**: Active trading execution phase
- **Duration**: Variable (typically 5-30 minutes)
- **Activities**:
  - Market research and analysis
  - Strategy generation via LLM
  - Trade execution
  - Performance analysis
- **Possible Outcomes**: COMPLETED, ERROR, TIMEOUT

### COMPLETED
- **Purpose**: Successful execution cycle
- **Duration**: Instantaneous transition
- **Actions**:
  - Store execution results
  - Update performance metrics
  - Send success notification
- **Next State**: SLEEPING

### ERROR
- **Purpose**: Execution failed with recoverable error
- **Behavior**:
  - **Production**: Auto-retry → SLEEPING
  - **Development**: Manual review → PAUSED
- **Actions**:
  - Log error details
  - Send error notification
  - Determine retry strategy

### TIMEOUT
- **Purpose**: Execution exceeded time limit
- **Actions**:
  - Cancel ongoing operations
  - Log timeout event
  - Require manual intervention
- **Next State**: PAUSED (requires manual review)

### PAUSED
- **Purpose**: Manual intervention required
- **Duration**: Until manually resumed
- **Triggers**:
  - Development environment errors
  - Timeout conditions
  - Manual pause by user
- **Next State**: SLEEPING (manual resume)

## Agent Workflow Execution

```mermaid
flowchart TD
    START([Cron Job Triggers]) --> CHECK{Check Agent Status}
    CHECK -->|SLEEPING| READY{Ready to Run?}
    CHECK -->|OTHER| SKIP[Skip Execution]
    
    READY -->|Yes| RUN[Set Status: RUNNING]
    READY -->|No| WAIT[Wait for Sleep Timer]
    
    RUN --> NOTIFY1[Send Telegram: Starting]
    NOTIFY1 --> STRATEGY[Generate Trading Strategy]
    STRATEGY --> EXECUTE[Execute Trades]
    EXECUTE --> ANALYZE[Analyze Performance]
    
    ANALYZE --> SUCCESS{Execution Success?}
    SUCCESS -->|Yes| COMPLETE[Set Status: SLEEPING]
    SUCCESS -->|No| FAIL[Set Status: ERROR/TIMEOUT]
    
    COMPLETE --> NOTIFY2[Send Telegram: Success]
    FAIL --> NOTIFY3[Send Telegram: Error]
    
    NOTIFY2 --> END([Cycle Complete])
    NOTIFY3 --> END
    SKIP --> END
    WAIT --> END
```

## Sleep Timer Logic

```mermaid
flowchart LR
    subgraph "Sleep Calculation"
        LAST[Last Run Time]
        NOW[Current Time]
        PARAM[Sleep Parameter]
        
        LAST --> DIFF[Time Difference]
        NOW --> DIFF
        DIFF --> COMPARE{Diff >= Sleep Time?}
        PARAM --> COMPARE
        
        COMPARE -->|Yes| READY[Agent Ready]
        COMPARE -->|No| WAIT[Continue Sleeping]
    end
```

## Agent Configuration Flow

```mermaid
sequenceDiagram
    participant User
    participant Dashboard
    participant Convex
    participant Agent
    participant Params

    User->>Dashboard: Configure Agent
    Dashboard->>Convex: Update Agent Config
    
    Note over Convex: Persona, Model, Temperature
    
    User->>Dashboard: Set Trading Params
    Dashboard->>Params: Generate Parameters
    
    Note over Params: Sleep Timing, Risk Limits, Coins
    
    Params-->>Convex: Store Parameters
    Convex-->>Agent: Load New Config
    Agent-->>Dashboard: Config Updated
```

## Error Handling and Recovery

```mermaid
flowchart TD
    ERROR[Error Occurred] --> TYPE{Error Type}
    
    TYPE -->|Network| RETRY[Automatic Retry]
    TYPE -->|API Limit| BACKOFF[Exponential Backoff]
    TYPE -->|Logic Error| LOG[Log & Continue]
    TYPE -->|Critical| PAUSE[Pause Agent]
    
    RETRY --> SUCCESS1{Success?}
    BACKOFF --> SUCCESS2{Success?}
    LOG --> SLEEP1[Return to Sleep]
    PAUSE --> MANUAL[Manual Intervention]
    
    SUCCESS1 -->|Yes| SLEEP2[Return to Sleep]
    SUCCESS1 -->|No| PAUSE
    SUCCESS2 -->|Yes| SLEEP3[Return to Sleep]
    SUCCESS2 -->|No| PAUSE
    
    MANUAL --> RESUME[Resume Agent]
    RESUME --> SLEEP4[Return to Sleep]
```

## Performance Monitoring

```mermaid
graph TB
    subgraph "Metrics Collection"
        EXEC[Execution Time]
        PNL[P&L Tracking]
        TRADE[Trade Count]
        ERROR[Error Rate]
    end

    subgraph "Analysis"
        PERF[Performance Analysis]
        RISK[Risk Assessment]
        OPT[Strategy Optimization]
    end

    subgraph "Actions"
        ALERT[Performance Alerts]
        ADJUST[Parameter Adjustment]
        REPORT[Performance Reports]
    end

    EXEC --> PERF
    PNL --> PERF
    TRADE --> RISK
    ERROR --> RISK
    
    PERF --> ALERT
    RISK --> ADJUST
    OPT --> REPORT
```