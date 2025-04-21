-- Insert default agent
INSERT OR IGNORE INTO sup_agents (
    agent_id,
    user_id,
    name,
    configuration,
    wallet_address,
    metadata
) VALUES (
    'default_trading',
    'default_trading',
    'Default Trading Agent',
    '{}',
    NULL,
    NULL
);

-- Insert default agent session
INSERT OR IGNORE INTO sup_agent_sessions (
    session_id,
    agent_id,
    status,
    started_at,
    ended_at,
    fe_data,
    trades_count,
    cycle_count,
    session_interval,
    will_end_at,
    last_cycle,
    status_cycle,
    be_data,
    metadata,
    cron_trigger_id
) VALUES (
    'default_trading',
    'default_trading',
    'running',
    CURRENT_TIMESTAMP,
    NULL,
    '{"agent_name":"default_trading_name","type":"trading","model":"gemini","mode":"default","role":"terse, funny, curious, philosophical","network":"eth","research_tools":["CoinGecko", "DuckDuckGo"],"trading_instruments":["spot"],"metric_name":"wallet","notifications":"twitter"}',
    0,
    0,
    900,
    datetime('now', '+12 hours'),
    CURRENT_TIMESTAMP,
    'finished',
    NULL,
    NULL,
    NULL
);


-- Insert default agent
INSERT OR IGNORE INTO sup_agents (
    agent_id,
    user_id,
    name,
    configuration,
    wallet_address,
    metadata
) VALUES (
    'default_marketing',
    'default_marketing',
    'Default Marketing Agent',
    '{}',
    NULL,
    NULL
);

-- Insert default agent session
INSERT OR IGNORE INTO sup_agent_sessions (
    session_id,
    agent_id,
    status,
    started_at,
    ended_at,
    fe_data,
    trades_count,
    cycle_count,
    session_interval,
    will_end_at,
    last_cycle,
    status_cycle,
    be_data,
    metadata,
    cron_trigger_id
) VALUES (
    'default_marketing',
    'default_marketing',
    'running',
    CURRENT_TIMESTAMP,
    NULL,
    '{"type":"marketing","model":"gemini","mode":"default","role":"terse, funny, curious, philosophical","network":"eth", "time":"24h", "research_tools":["Twitter"],"trading_instruments":["spot"],"metric_name":"followers","notifications":"twitter", "twitter_access_token": "", "twitter_refresh_token": ""}',
    0,
    0,
    900,
    datetime('now', '+12 hours'),
    CURRENT_TIMESTAMP,
    'finished',
    NULL,
    NULL,
    NULL
);
