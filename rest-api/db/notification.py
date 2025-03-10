from utils.utils import db_connection_decorator, delete_none


@db_connection_decorator
def insert_notifications_prevent_duplicate_db(cursor, insert_dict) -> str:
    """Insert notification with duplicate prevention"""
    columns = ", ".join(insert_dict.keys())
    values = ", ".join([f"%s" for value in insert_dict.values()])

    try:
        # Check if the record exists with the same relative_to_scraper_id or long_desc
        check_query = "SELECT id FROM sup_notifications WHERE relative_to_scraper_id = %s OR long_desc = %s"
        cursor.execute(
            check_query,
            [insert_dict.get("relative_to_scraper_id"), insert_dict.get("long_desc")],
        )
        existing = cursor.fetchone()

        if not existing:
            # Insert new record
            query = f"INSERT INTO sup_notifications ({columns}) VALUES ({values})"
            cursor.execute(query, list(insert_dict.values()))
        return "success"
    except Exception as e:
        return str(e)


@db_connection_decorator
def insert_notifications_batch_prevent_duplicate_db(cursor, insert_dicts):
    """Process batch of notifications with duplicate prevention"""
    try:
        # Check if insert_dicts has the expected structure
        if not isinstance(insert_dicts, dict) or "notifications" not in insert_dicts:
            return "Invalid batch data format: expected dictionary with 'notifications' key"

        # Process each notification in the batch
        for insert_dict in insert_dicts["notifications"]:
            # Call the single insert function for each notification
            err = insert_notifications_prevent_duplicate_db(insert_dict)
            if err != "success":
                return err
        return "success"
    except Exception as e:
        return str(e)


@db_connection_decorator
def insert_notifications_db(cursor, insert_dict) -> str:
    """Simple insert notification"""
    try:
        columns = ", ".join(insert_dict.keys())
        values = ", ".join([f"%s" for value in insert_dict.values()])
        query = f"INSERT INTO sup_notifications ({columns}) VALUES ({values})"
        cursor.execute(query, list(insert_dict.values()))
        return "success"
    except Exception as e:
        return str(e)


@db_connection_decorator
def update_notifications_db(cursor, set_dict, where_dict) -> str:
    """Update notification records"""
    try:
        delete_none(set_dict)
        set_clause = ", ".join([f"{key} = %s" for key, value in set_dict.items()])
        where_clause = " AND ".join(
            [f"{key} = %s" for key, value in where_dict.items()]
        )
        query = f"UPDATE sup_notifications SET {set_clause} WHERE {where_clause}"
        cursor.execute(query, list(set_dict.values()) + list(where_dict.values()))
        return "success"
    except Exception as e:
        return str(e)


@db_connection_decorator
def get_all_notifications_db(
    cursor, result_columns: list, where_conditions: dict, pagination
) -> tuple:
    """Retrieve notifications with pagination"""
    try:
        delete_none(where_conditions)
        select_clause = ", ".join(result_columns) if result_columns else "*"
        where_clause = " AND ".join(
            [f"{col} = %s" for col, val in where_conditions.items()]
        )
        order_by_clause = f"ORDER BY sup_notifications.notification_date DESC"
        page = pagination.get("page", 1)
        page_size = pagination.get("page_size", 800)
        offset = (page - 1) * page_size
        limit_clause = f"LIMIT {offset}, {page_size}"
        count_query = "SELECT COUNT(1) as sum FROM sup_notifications"
        query = f"SELECT {select_clause} FROM sup_notifications"
        if where_clause:
            query += f" WHERE {where_clause}"
            count_query += f" WHERE {where_clause}"
        if order_by_clause:
            query += f" {order_by_clause}"
            count_query += f" {order_by_clause}"
        query += f" {limit_clause}"

        cursor.execute(query, list(where_conditions.values()))
        result = cursor.fetchall()
        cursor.execute(count_query, list(where_conditions.values()))
        count = cursor.fetchone()
        return ("success", count["sum"], result)
    except Exception as e:
        return (str(e), 0, [])


@db_connection_decorator
def get_all_notifications_old_db(
    cursor, result_columns: list, where_conditions: dict, pagination
) -> str:
    """NOTE: Legacy notification retrieval with IN clause support"""
    delete_none(where_conditions)
    select_clause = ", ".join(result_columns) if result_columns else "*"
    where_clauses = []
    where_values = []
    for col, val in where_conditions.items():
        if isinstance(val, list):
            placeholders = ", ".join(["%s"] * len(val))
            where_clauses.append(f"{col} IN ({placeholders})")
            where_values.extend(val)
        else:
            where_clauses.append(f"{col} = %s")
            where_values.append(val)
    where_clause = " AND ".join(where_clauses)
    order_by_clause = f"ORDER BY sup_notifications.notification_date DESC"
    page = pagination.get("page", 1)
    page_size = pagination.get("page_size", 800)
    offset = (page - 1) * page_size
    limit_clause = f"LIMIT {offset}, {page_size}"
    count_query = "SELECT COUNT(1) as sum FROM sup_notifications"
    query = f"SELECT {select_clause} FROM sup_notifications"

    if where_clause:
        query += f" WHERE {where_clause}"
        count_query += f" WHERE {where_clause}"
    if order_by_clause:
        query += f" {order_by_clause}"
        count_query += f" {order_by_clause}"

    query += f" {limit_clause}"
    print(query)
    cursor.execute(query, list(where_values))
    result = cursor.fetchall()
    cursor.execute(count_query, list(where_values))
    count = cursor.fetchone()
    return count["sum"], result


@db_connection_decorator
def get_notifications_alfath(cursor, result_columns, sources, page_size) -> str:
    """Get latest notifications per source"""
    placeholders = ", ".join(["%s"] * len(sources))
    where_clause = f"source IN ({placeholders})"
    query = f"""
    SELECT *
    FROM (
        SELECT 
            sup_notifications.*,
            ROW_NUMBER() OVER (PARTITION BY source ORDER BY notification_date DESC) AS row_num
        FROM sup_notifications
        WHERE {where_clause}
    ) ranked
    WHERE row_num <= {page_size}
    """
    print(query, sources)
    cursor.execute(query, sources)
    result = cursor.fetchall()
    return 0, result


@db_connection_decorator
def get_notification_sources(cursor) -> tuple:
    """Get unique sources that exactly end with _news or start with twitter from sup_notifications table"""
    try:
        query = """
        SELECT DISTINCT 
            CASE
                -- Handle base categories
                WHEN source IN ('animals_news', 'business_news', 'entertainment_news', 
                              'politics_news', 'science_news', 'sports_news', 
                              'technology_news', 'twitter_feed', 'twitter_mentions',
                              'world_news_news')
                THEN source
                -- Handle specific sources by mapping to base category
                WHEN source LIKE 'business_news_%' THEN 'business_news'
                WHEN source LIKE 'crypto_news_%' THEN 'crypto_news'
                WHEN source LIKE 'politics_news_%' THEN 'politics_news'
                WHEN source LIKE 'sports_news_%' THEN 'sports_news'
                WHEN source LIKE 'technology_news_%' THEN 'technology_news'
                WHEN source LIKE 'health_news_%' THEN 'health_news'
                WHEN source LIKE 'general_news_%' THEN 'general_news'
                ELSE source
            END as source,
            CASE
                WHEN source = 'world_news_news' THEN 'World News'
                WHEN source LIKE '%_news%' THEN 
                    REPLACE(
                        SUBSTRING_INDEX(source, '_news', 1),
                        '_', ' '
                    )
                ELSE source
            END as display_name
        FROM sup_notifications 
        WHERE source IS NOT NULL 
        AND (
            source LIKE '%_news%'
            OR source LIKE 'twitter%'
        )
        ORDER BY source ASC
        """
        cursor.execute(query)
        results = cursor.fetchall()
        # Transform results into required format
        sources = [
            {
                "value": row["source"],
                "label": row["display_name"].replace("_", " ").title(),
            }
            for row in results
        ]
        return ("success", len(sources), sources)
    except Exception as e:
        return (str(e), 0, [])

