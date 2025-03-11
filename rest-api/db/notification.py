from utils.utils import db_connection_decorator, delete_none


@db_connection_decorator
def insert_notifications_prevent_duplicate_db(cursor, insert_dict) -> str:
    """Insert notification with duplicate prevention"""
    columns = ", ".join(insert_dict.keys())
    values = ", ".join(["?" for _ in insert_dict.values()])

    try:
        # Check if the record exists with the same relative_to_scraper_id or long_desc
        check_query = "SELECT id FROM sup_notifications WHERE relative_to_scraper_id = ? OR long_desc = ?"
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
        if not isinstance(insert_dicts, dict) or "notifications" not in insert_dicts:
            return "Invalid batch data format: expected dictionary with 'notifications' key"

        for insert_dict in insert_dicts["notifications"]:
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
        values = ", ".join(["?" for _ in insert_dict.values()])
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
        set_clause = ", ".join([f"{key} = ?" for key in set_dict.keys()])
        where_clause = " AND ".join([f"{key} = ?" for key in where_dict.keys()])
        query = f"UPDATE sup_notifications SET {set_clause} WHERE {where_clause}"
        cursor.execute(query, list(set_dict.values()) + list(where_dict.values()))
        return "success"
    except Exception as e:
        return str(e)


@db_connection_decorator
def get_all_notifications_db(cursor, result_columns: list, where_conditions: dict, pagination) -> tuple:
    """Retrieve notifications with pagination"""
    try:
        delete_none(where_conditions)
        select_clause = ", ".join(result_columns) if result_columns else "*"
        where_clause = " AND ".join([f"{col} = ?" for col in where_conditions.keys()])
        order_by_clause = "ORDER BY notification_date DESC"
        page = pagination.get("page", 1)
        page_size = pagination.get("page_size", 800)
        offset = (page - 1) * page_size

        # Get total count for pagination
        count_query = "SELECT COUNT(1) as sum FROM sup_notifications"
        query = f"SELECT {select_clause} FROM sup_notifications"
        if where_clause:
            query += f" WHERE {where_clause}"
            count_query += f" WHERE {where_clause}"
        if order_by_clause:
            query += f" {order_by_clause}"
            count_query += f" {order_by_clause}"
        query += f" LIMIT ? OFFSET ?"

        cursor.execute(query, list(where_conditions.values()) + [page_size, offset])
        result = cursor.fetchall()
        cursor.execute(count_query, list(where_conditions.values()))
        count = cursor.fetchone()
        return ("success", count["sum"], result)
    except Exception as e:
        return (str(e), 0, [])


@db_connection_decorator
def get_all_notifications_old_db(cursor, result_columns: list, where_conditions: dict, pagination) -> tuple:
    """Legacy notification retrieval with IN clause support"""
    delete_none(where_conditions)
    select_clause = ", ".join(result_columns) if result_columns else "*"
    where_clauses = []
    where_values = []
    for col, val in where_conditions.items():
        if isinstance(val, list):
            placeholders = ", ".join(["?"] * len(val))
            where_clauses.append(f"{col} IN ({placeholders})")
            where_values.extend(val)
        else:
            where_clauses.append(f"{col} = ?")
            where_values.append(val)

    where_clause = " AND ".join(where_clauses)
    order_by_clause = "ORDER BY notification_date DESC"
    page = pagination.get("page", 1)
    page_size = pagination.get("page_size", 800)
    offset = (page - 1) * page_size
    count_query = "SELECT COUNT(1) as sum FROM sup_notifications"
    query = f"SELECT {select_clause} FROM sup_notifications"

    if where_clause:
        query += f" WHERE {where_clause}"
        count_query += f" WHERE {where_clause}"
    if order_by_clause:
        query += f" {order_by_clause}"
        count_query += f" {order_by_clause}"
    query += f" LIMIT ? OFFSET ?"

    cursor.execute(query, where_values + [page_size, offset])
    result = cursor.fetchall()
    cursor.execute(count_query, where_values)
    count = cursor.fetchone()
    return count["sum"], result


@db_connection_decorator
def get_notifications_alfath(cursor, result_columns, sources, page_size) -> tuple:
    """Get latest notifications per source"""
    placeholders = ", ".join(["?"] * len(sources))
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
    WHERE row_num <= ?
    """
    cursor.execute(query, sources + [page_size])
    result = cursor.fetchall()
    return 0, result


@db_connection_decorator
def get_notification_sources(cursor) -> tuple:
    """Get unique sources from sup_notifications"""
    try:
        query = """
        SELECT DISTINCT 
            source,
            CASE
                WHEN source LIKE '%_news%' THEN REPLACE(source, '_', ' ')
                WHEN source LIKE 'twitter%' THEN source
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

