import uuid
from datetime import datetime
from utils.utils import db_connection_decorator, delete_none


@db_connection_decorator
def insert_payments(cursor, insert_dict):
    """
    Insert a new payment record into sup_payments table (SQLite version)

    Args:
        cursor: SQLite database cursor
        insert_dict (dict): Dictionary containing payment data with keys:
            - user_id: ID of the user making payment
            - agent_id: ID of the agent being paid for
            - amount: Payment amount
            - transaction_id (optional): Unique transaction ID, auto-generated if not provided
            - created_at (optional): Timestamp of payment, defaults to current time

    Returns:
        bool: True if insertion successful

    Example:
        payment_data = {
            'user_id': 'user123',
            'agent_id': 'agent456',
            'amount': 1
        }
        success = insert_payments(cursor, payment_data)
    """
    # Add default values if not provided
    if "transaction_id" not in insert_dict:
        insert_dict["transaction_id"] = str(uuid.uuid4())
    if "created_at" not in insert_dict:
        insert_dict["created_at"] = datetime.now().isoformat()

    # Remove any None values from the dictionary
    delete_none(insert_dict)

    # Prepare SQL query dynamically from dictionary keys and values
    columns = ", ".join(insert_dict.keys())
    values = ", ".join(["?" for _ in insert_dict.values()])  # SQLite uses ? placeholders
    query = f"INSERT INTO sup_payments ({columns}) VALUES ({values})"
    cursor.execute(query, list(insert_dict.values()))

    return True
