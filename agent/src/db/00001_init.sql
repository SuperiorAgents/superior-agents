create table if not exists sup_agent_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id varchar(100) unique,
    agent_id char(36) not null,
    status text not null check (status in ('running', 'stopped', 'stopping')) default 'running',
    started_at datetime default CURRENT_TIMESTAMP,
    ended_at datetime,
    fe_data text,
    trades_count integer,
    cycle_count integer,
    session_interval integer default 900, -- seconds
    will_end_at datetime default (datetime('now', '+12 hours')),
    last_cycle datetime default CURRENT_TIMESTAMP,
    status_cycle text check (status_cycle in ('running', 'finished')) default 'finished',
    be_data text,
    metadata text,
    cron_trigger_id text
);

create index if not exists idx_agent_started on sup_agent_sessions (agent_id, started_at);

create table if not exists sup_agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id varchar(100) unique,
    user_id char(36) not null,
    name varchar(255) not null,
    configuration text,
    created_at datetime default CURRENT_TIMESTAMP,
    updated_at datetime default CURRENT_TIMESTAMP,
    wallet_address varchar(100),
    profile_image text,
    wallet_configuration text,
    metadata text
);

create index if not exists idx_user_id on sup_agents (user_id);

create table if not exists sup_chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    history_id varchar(100),
    session_id char(36) not null,
    message_type varchar(50) not null,
    content text,
    timestamp datetime default CURRENT_TIMESTAMP
);

create index if not exists idx_session_time on sup_chat_history (session_id, timestamp);

create table if not exists sup_master_settings (
    data_id INTEGER PRIMARY KEY AUTOINCREMENT,
    key varchar(255),
    value text,
    metadata text
);

create table if not exists sup_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notification_id TEXT,
    bot_username TEXT,
    relative_to_scraper_id TEXT,
    source TEXT,
    short_desc TEXT,
    long_desc TEXT,
    notification_date DATETIME,
    unique_hash TEXT UNIQUE,
    created DATETIME DEFAULT CURRENT_TIMESTAMP
);

create index if not exists sup_notifications_source_IDX on sup_notifications (source);

create table if not exists sup_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id varchar(100),
    amount integer,
    transaction_id varchar(255),
    created_at datetime default CURRENT_TIMESTAMP,
    updated_at datetime default CURRENT_TIMESTAMP
);

create table if not exists sup_session_cycles (
    data_id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id varchar(100),
    cycle_id varchar(100),
    metadata text,
    created datetime default CURRENT_TIMESTAMP
);

create table if not exists sup_strategies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy_id varchar(100),
    agent_id char(36) not null,
    summarized_desc text,
    full_desc text,
    strategy_result text,
    parameters json,
    created_at datetime default CURRENT_TIMESTAMP,
    updated_at datetime default CURRENT_TIMESTAMP
);

create index if not exists idx_agent_created on sup_strategies (agent_id, created_at);

create table if not exists sup_strategies_bak (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy_id varchar(100),
    agent_id char(36) not null,
    summarized_desc text,
    full_desc text,
    strategy_result text,
    parameters json,
    created_at datetime default CURRENT_TIMESTAMP,
    updated_at datetime default CURRENT_TIMESTAMP
);

create index if not exists idx_agent_created_bak on sup_strategies_bak (agent_id, created_at);

create table if not exists sup_twitter_token (
    data_id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id varchar(100) unique,
    last_refreshed_at datetime,
    access_token varchar(200),
    refresh_token varchar(200)
);

create table if not exists sup_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id varchar(100),
    username varchar(255),
    email varchar(255) not null,
    wallet_address varchar(100),
    created_at datetime default CURRENT_TIMESTAMP,
    updated_at datetime default CURRENT_TIMESTAMP
);

create table if not exists sup_wallet_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_id varchar(100),
    agent_id char(36) not null,
    total_value_usd real,
    assets json,
    snapshot_time datetime default CURRENT_TIMESTAMP
);

create index if not exists idx_agent_time on sup_wallet_snapshots (agent_id, snapshot_time);

create table if not exists sup_token_price (
  data_id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_addr TEXT NOT NULL,
  symbol TEXT,
  price REAL,
  last_updated_at DATETIME NOT NULL,
  metadata TEXT,
  UNIQUE(token_addr)
);

