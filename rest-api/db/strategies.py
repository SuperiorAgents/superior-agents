from utils.utils import db_connection_decorator, delete_none


@db_connection_decorator
def insert_strategies_db(cursor, insert_dict):
    """Insert a new strategies record (SQLite version)"""
    columns = ", ".join(insert_dict.keys())
    values = ", ".join(["?" for _ in insert_dict.values()])  # SQLite uses ? placeholders
    query = f"INSERT INTO sup_strategies ({columns}) VALUES ({values})"
    cursor.execute(query, list(insert_dict.values()))
    return True


@db_connection_decorator
def update_strategies_db(cursor, set_dict, where_dict):
    """Update existing strategies records (SQLite version)"""
    delete_none(set_dict)
    set_clause = ", ".join([f"{key} = ?" for key in set_dict.keys()])
    where_clause = " AND ".join([f"{key} = ?" for key in where_dict.keys()])
    query = f"UPDATE sup_strategies SET {set_clause} WHERE {where_clause}"
    cursor.execute(query, list(set_dict.values()) + list(where_dict.values()))
    return True


@db_connection_decorator
def get_all_strategies_db(
    cursor, result_columns: list, where_conditions: dict, pagination
):
    """Retrieve all strategies with pagination (SQLite version)"""
    delete_none(where_conditions)
    select_clause = ", ".join(result_columns) if result_columns else "*"
    where_clause = " AND ".join([f"{col} = ?" for col in where_conditions.keys()])
    order_by_clause = (
        f"ORDER BY sup_strategies.{pagination['sort_by']} ASC"
        if "sort_by" in pagination
        else ""
    )
    page = pagination.get("page", 1)
    page_size = pagination.get("page_size", 800)
    offset = (page - 1) * page_size
    limit_clause = f"LIMIT {page_size} OFFSET {offset}"

    # Get total count for pagination
    count_query = "SELECT COUNT(1) as sum FROM sup_strategies"
    query = f"SELECT {select_clause} FROM sup_strategies"
    if where_clause:
        query += f" WHERE {where_clause}"
        count_query += f" WHERE {where_clause}"
    if order_by_clause:
        query += f" {order_by_clause}"
        count_query += f" {order_by_clause}"
    query += f" {limit_clause}"

    print(query)
    cursor.execute(query, list(where_conditions.values()))
    result = cursor.fetchall()
    cursor.execute(count_query, list(where_conditions.values()))
    count = cursor.fetchone()["sum"]
    return count, result


@db_connection_decorator
def get_all_strategies_db_2(
    cursor, result_columns: list, where_conditions: dict, pagination
):
    """Retrieve strategies with pagination and fixed sorting (SQLite version)"""
    delete_none(where_conditions)
    select_clause = ", ".join(result_columns) if result_columns else "*"
    where_clause = " AND ".join([f"{col} = ?" for col in where_conditions.keys()])
    order_by_clause = "ORDER BY sup_strategies.created_at DESC"
    page = pagination.get("page", 1)
    page_size = pagination.get("page_size", 800)
    offset = (page - 1) * page_size
    limit_clause = f"LIMIT {page_size} OFFSET {offset}"

    count_query = "SELECT COUNT(1) as sum FROM sup_strategies"
    query = f"SELECT {select_clause} FROM sup_strategies"
    if where_clause:
        query += f" WHERE {where_clause}"
        count_query += f" WHERE {where_clause}"
    if order_by_clause:
        query += f" {order_by_clause}"
        count_query += f" {order_by_clause}"
    query += f" {limit_clause}"

    print(query)
    cursor.execute(query, list(where_conditions.values()))
    result = cursor.fetchall()
    cursor.execute(count_query, list(where_conditions.values()))
    count = cursor.fetchone()["sum"]
    return count, result
