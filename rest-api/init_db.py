import sqlite3

DB_FILE = "database.db"  # SQLite database file name

# Define the schema
SCHEMA = """
-- sup_agent_sessions definition

CREATE TABLE sup_agent_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE,
  agent_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('running', 'stopped', 'stopping')) NOT NULL DEFAULT 'running',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP DEFAULT NULL,
  fe_data TEXT,
  trades_count INTEGER DEFAULT NULL,
  cycle_count INTEGER DEFAULT NULL,
  session_interval INTEGER DEFAULT 900,  -- seconds
  will_end_at TIMESTAMP DEFAULT (datetime('now', '+12 hours')),
  last_cycle TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_cycle TEXT CHECK(status_cycle IN ('running', 'finished')) DEFAULT 'finished'
);

CREATE INDEX idx_agent_started ON sup_agent_sessions (agent_id, started_at);

-- sup_agents definition

CREATE TABLE sup_agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT UNIQUE,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  configuration TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  wallet_address TEXT,
  UNIQUE(agent_id)
);

CREATE INDEX idx_user_id ON sup_agents (user_id);

-- sup_chat_history definition

CREATE TABLE sup_chat_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  history_id TEXT,
  session_id TEXT NOT NULL,
  message_type TEXT NOT NULL,
  content TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_time ON sup_chat_history (session_id, timestamp);

-- sup_notifications definition

CREATE TABLE sup_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notification_id TEXT,
  bot_username TEXT,
  relative_to_scraper_id TEXT,
  source TEXT,
  short_desc TEXT,
  long_desc TEXT,
  notification_date DATETIME,
  created DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- sup_strategies definition

CREATE TABLE sup_strategies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strategy_id TEXT,
  agent_id TEXT NOT NULL,
  summarized_desc TEXT,
  full_desc TEXT,
  strategy_result TEXT,
  parameters TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_created ON sup_strategies (agent_id, created_at);

-- sup_users definition

CREATE TABLE sup_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  wallet_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- sup_wallet_snapshots definition

CREATE TABLE sup_wallet_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_id TEXT,
  agent_id TEXT NOT NULL,
  total_value_usd DECIMAL(20,8),
  assets TEXT,
  snapshot_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_time ON sup_wallet_snapshots (agent_id, snapshot_time);
INSERT INTO sup_agents (agent_id, user_id, name, configuration) 
VALUES ('agent_007', 'user_123', 'Agent Alpha', '{"setting": "default"}');

INSERT INTO sup_agents (agent_id, user_id, name, configuration) 
VALUES ('agent_002', 'user_456', 'Agent Beta', '{"mode": "advanced"}');
"""

def initialize_db():
    """Create the database and tables if they don't exist."""
    conn = sqlite3.connect(DB_FILE)  # Connect to SQLite DB (creates if not exists)
    cursor = conn.cursor()
    
    cursor.executescript(SCHEMA)  # Execute schema
    conn.commit()  # Save changes
    conn.close()  # Close connection
    print("Database initialized successfully.")

if __name__ == "__main__":
    initialize_db()