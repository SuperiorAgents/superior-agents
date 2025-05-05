from utils.utils import db_connection_decorator, delete_none

@db_connection_decorator
def insert_agent_sessions_db(cursor, insert_dict):
    """Insert a new agent session record"""
    columns = ", ".join(insert_dict.keys())
    values = ", ".join(["?" for _ in insert_dict.values()])
    query = f"INSERT INTO sup_agent_sessions ({columns}) VALUES ({values})"
    cursor.execute(query, list(insert_dict.values()))
    return True


@db_connection_decorator
def update_agent_sessions_db(cursor, set_dict, where_dict):
    """Update existing agent session records"""
    delete_none(set_dict)
    set_clause = ", ".join([f"{key} = ?" for key in set_dict.keys()])
    where_clause = " AND ".join([f"{key} = ?" for key in where_dict.keys()])
    query = f"UPDATE sup_agent_sessions SET {set_clause} WHERE {where_clause}"
    cursor.execute(query, list(set_dict.values()) + list(where_dict.values()))
    return True


@db_connection_decorator
def get_all_agent_sessions_db(cursor, result_columns: list, where_conditions: dict, pagination):
    """Retrieve agent sessions with pagination"""
    delete_none(where_conditions)
    select_clause = ", ".join(result_columns) if result_columns else "*"
    where_clause = " AND ".join([f"{col} = ?" for col in where_conditions.keys()])

    order_by_clause = (
        f"ORDER BY {pagination['sort_by']} ASC" if "sort_by" in pagination else ""
    )
    page = pagination.get("page", 1)
    page_size = pagination.get("page_size", 800)
    offset = (page - 1) * page_size

    # Get total count for pagination
    count_query = f"SELECT COUNT(1) as sum FROM sup_agent_sessions"
    query = f"SELECT {select_clause} FROM sup_agent_sessions"
    
    if where_clause:
        query += f" WHERE {where_clause}"
        count_query += f" WHERE {where_clause}"
    
    if order_by_clause:
        query += f" {order_by_clause}"
    
    query += f" LIMIT ? OFFSET ?"
    
    # Debugging
    print(query)

    # Execute main query
    cursor.execute(query, list(where_conditions.values()) + [page_size, offset])
    result = cursor.fetchall()

    # Execute count query
    cursor.execute(count_query, list(where_conditions.values()))
    count = cursor.fetchone()

    return count["sum"], result
