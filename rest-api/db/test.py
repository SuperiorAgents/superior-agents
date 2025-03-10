from utils.utils import db_connection_decorator, delete_none


@db_connection_decorator
def insert_test_db(cursor, insert_dict):
    """Insert a new test record"""
    columns = ", ".join(insert_dict.keys())
    values = ", ".join([f"%s" for value in insert_dict.values()])
    query = f"INSERT INTO sup_test ({columns}) VALUES ({values})"
    cursor.execute(query, list(insert_dict.values()))
    return True


@db_connection_decorator
def update_test_db(cursor, set_dict, where_dict):
    """Update existing test records"""
    delete_none(set_dict)
    set_clause = ", ".join([f"{key} = %s" for key, value in set_dict.items()])
    where_clause = " AND ".join([f"{key} = %s" for key, value in where_dict.items()])
    query = f"UPDATE sup_test SET {set_clause} WHERE {where_clause}"
    cursor.execute(query, list(set_dict.values()) + list(where_dict.values()))
    return True


@db_connection_decorator
def get_all_test_db(
    cursor, result_columns: list, where_conditions: dict, pagination
) -> str:
    """Retrieve test records with pagination"""
    delete_none(where_conditions)
    select_clause = ", ".join(result_columns) if result_columns else "*"
    where_clause = " AND ".join(
        [f"{col} = %s" for col, val in where_conditions.items()]
    )
    order_by_clause = (
        f"ORDER BY sup_test.{pagination['sort_by']} ASC"
        if "sort_by" in pagination
        else ""
    )
    page = pagination.get("page", 1)
    page_size = pagination.get("page_size", 800)
    offset = (page - 1) * page_size
    limit_clause = f"LIMIT {offset}, {page_size}"
    # Get total count for pagination
    count_query = "SELECT COUNT(1) as sum FROM sup_test"
    query = f"SELECT {select_clause} FROM sup_test"
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
    count = cursor.fetchone()
    return count["sum"], result
