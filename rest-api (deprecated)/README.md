# Superior Agent API Documentation

## Overview
This documentation describes the REST API endpoints for the Superior Agent platform. All endpoints require API key authentication and are organized around the main resources: Agent Sessions, Agents, Chat History, Strategies, Users, Wallet Snapshots, and Notifications.

## Authentication
All API endpoints require an API key passed in the request header:
```http
X-Api-Key: your_api_key_here
```

## Base URL
```
/api_v1
```

## Endpoints

### Agent Sessions

#### Create Session
```http
POST /agent_sessions/create
```
Creates a new agent session with the provided parameters.
```typescript
{
  session_id: string
  agent_id: string
  started_at: string
  ended_at: string
  status: string
}
```

#### Update Session
```http
POST /agent_sessions/update
```
Updates an existing agent session's details.
```typescript
{
  session_id: string
  agent_id: string
  started_at: string
  ended_at: string
  status: string
}
```

#### Get Session
```http
POST /agent_sessions/get
```
Retrieves agent session information.
```typescript
{
  session_id: string
  agent_id: string
  started_at: string
  ended_at: string
  status: string
}
```

### Agents

#### Create Agent
```http
POST /agent/create
```
Creates a new agent with the specified configuration.
```typescript
{
  user_id: string,
  name: string,
  configuration: string
}
```

#### Update Agent
```http
POST /agent/update
```
Updates an existing agent's details.
```typescript
{
  agent_id: string,
  user_id: string,
  name: string,
  configuration: string
}
```

#### Get Agent
```http
POST /agent/get
```
Retrieves agent information.
```typescript
{
  agent_id: string,
  user_id: string,
  name: string,
  configuration: string
}
```

### Chat History

#### Create Chat History
```http
POST /chat_history/create
```
Records a new chat history entry.
```typescript
{
  session_id: string,
  message_type: string,
  content: string,
  timestamp: string
}
```

#### Update Chat History
```http
POST /chat_history/update
```
Updates an existing chat history entry.
```typescript
{
  history_id: string,
  session_id: string,
  message_type: string,
  content: string,
  timestamp: string
}
```

#### Get Chat History
```http
POST /chat_history/get
```
Retrieves chat history records.
```typescript
{
  history_id: string,
  session_id: string,
  message_type: string,
  content: string,
  timestamp: string
}
```

### Strategies

#### Create Strategy
```http
POST /strategies/create
```
Creates a new trading strategy.
```typescript
{
  agent_id: string,
  summarized_desc: string,
  full_desc: string,
  parameters: string,
  strategy_result: string
}
```

#### Update Strategy
```http
POST /strategies/update
```
Updates an existing strategy.
```typescript
{
  agent_id: string,
  summarized_desc: string,
  full_desc: string,
  parameters: string,
  strategy_result: string
}
```

#### Get Strategy
```http
POST /strategies/get
```
Retrieves strategy information.
```typescript
{
  strategy_id: string,
  agent_id: string,
  summarized_desc: string,
  full_desc: string,
  parameters: string,
  strategy_result: string
}
```

### Users

#### Create User
```http
POST /user/create
```
Creates a new user account.
```typescript
{
  username: string,
  email: string,
  wallet_address: string
}
```

#### Update User
```http
POST /user/update
```
Updates an existing user's information.
```typescript
{
  user_id: string,
  username: string,
  email: string,
  wallet_address: string
}
```

#### Get User
```http
POST /user/get
```
Retrieves user information.
```typescript
{
  user_id: string,
  username: string,
  email: string,
  wallet_address: string
}
```

### Wallet Snapshots

#### Create Wallet Snapshot
```http
POST /wallet_snapshots/create
```
Creates a new wallet snapshot.
```typescript
{
  agent_id: string,
  total_value_usd: 0,
  assets: string
}
```

#### Update Wallet Snapshot
```http
POST /wallet_snapshots/update
```
Updates an existing wallet snapshot.
```typescript
{
  snapshot_id: string,
  agent_id: string,
  total_value_usd: 0,
  assets: string
}
```

#### Get Wallet Snapshot
```http
POST /wallet_snapshots/get
```
Retrieves wallet snapshot information.
```typescript
{
  snapshot_id: string,
  agent_id: string,
  total_value_usd: 0,
  assets: string
}
```

### Notifications

#### Create Notification
```http
POST /notification/create
```
Creates a new notification.
```typescript
{
  relative_to_scraper_id: string,
  source: string,
  short_desc: string,
  long_desc: string,
  notification_date: string
}
```

#### Update Notification
```http
POST /notification/update
```
Updates an existing notification.
```typescript
{
  notification_id: string,
  relative_to_scraper_id: string,
  source: string,
  short_desc: string,
  long_desc: string,
  notification_date: string
}
```

#### Get Notification
```http
POST /notification/get
```
Retrieves notification information.
```typescript
{
  notification_id: string,
  relative_to_scraper_id: string,
  source: string,
  short_desc: string,
  long_desc: string,
  notification_date: string
}
```

## Error Handling

### Validation Error Response
```json
{
  "detail": [
    {
      "loc": ["field_name"],
      "msg": "error message",
      "type": "error_type"
    }
  ]
}
```

## Response Codes
- 200: Successful operation
- 422: Validation error