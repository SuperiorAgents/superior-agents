# Superior Agents - Uptime & Single Agent Management

## Agents Overview

### Agent 1 (Branch: `main`)
- **Live Agent URL:** [Agent 1](https://dev-kip-agent-creator-129631784552.asia-southeast1.run.app/live-agents/agent-1)
- **Running on:** `a180` user under `superior-individual/...`
- **Prompts Endpoint:** [http://34.87.43.255:5030/prompts](http://34.87.43.255:5030/prompts) *(Different port due to different `.env`)*
- **Transaction Endpoint:** `tee_txn` (Port `9010`)
- **Attach to tmux:** `tmux attach -t 0`

### Agent 2 (Branch: `dev`)
- **Live Agent URL:** [Agent 2](https://dev-kip-agent-creator-129631784552.asia-southeast1.run.app/live-agents/agent-2)
- **Running on:** `single-agent-x` user under `superior-individual/...`
- **Prompts Endpoint:** [http://34.2.24.98:4999/prompts](http://34.2.24.98:4999/prompts)
- **Transaction Endpoint:** `tee_txn` (Port `9010`)
- **Attach to tmux:** `tmux attach -t 0` or `tmux attach -t 1`

---

## New Endpoints in `server.ts`
| Endpoint               | Purpose                                     |
|------------------------|---------------------------------------------|
| `/push_token`         | For streaming                              |
| `/backup_log`        | For uptime checker                          |
| `/filesize`          | For uptime checker                          |
| `/single_agent_session` | For uptime checker & creating Single Agent manually |
| `/continue_session`   | **Deprecated** (Can be removed)             |
| `/delete_session`    | Barely used but might be useful             |

**Note:**
- These endpoints do **not** use the Redis session manager as it was not implemented.
- If needed, Redis session management should be added.

---

## Creating a Single Agent
1. Call `/single_agent_session` with the appropriate payload.
   - This creates an entry in `sup_agent_sessions` but **not** in `sup_agent`.
2. Manually update (or insert if it doesn't exist) a new agent in the `sup_agent` table.
   - Input the necessary name/configuration manually.

---

## Uptime Checker

We use **two separate uptime monitoring systems**:

### 1. API Uptime Monitoring
- **URL:** [Uptime Checker](https://uptime-checker-kuma.fly.dev/status/d0c1f3e0-214b-41c4-9db2-3e9898653d25)
- **Purpose:** Checks if the API is reachable.

### 2. Auto-Restarting Agents
- **App:** [Fly.io Uptime Checker](https://fly.io/apps/single-agent-uptime-checker)
- **Purpose:** Automatically restarts single agents if they run out of memory or crash.
- **Configuration:** See the worker config file: [`worker.conf`](https://github.com/KIP-Protocol-Contracts/superior-agents/blob/dev/single-agent-uptime-checker/worker/worker.conf)
- **Log Monitoring Details:** [`README.md`](https://github.com/KIP-Protocol-Contracts/superior-agents/blob/dev/single-agent-uptime-checker/README.md#log-monitoring)

### Adding More Agents for Uptime Checking
- Modify [`live_agents_input.py`](https://github.com/KIP-Protocol-Contracts/superior-agents/blob/dev/single-agent-uptime-checker/live_agents_input.py) to add new agents.
- **Deployment Status:**
  - This system is **not deployed yet**.
  - Currently running in a **tmux session** (hardcoded inputs).
  - It is **recommended to use a Docker container** instead of the current setup.

---

## Recommended Actions
- **Migrate uptime checker** from tmux to a Docker container.
- **Implement Redis session management** for the new endpoints if necessary.
- **Remove deprecated endpoints** (`/continue_session`) if no longer needed.

