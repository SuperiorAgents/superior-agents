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