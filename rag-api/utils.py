import os
import re

import pymysql
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")

def clean_text(text: str):
    return re.sub(r"[\n\s]+", " ", text).strip()

def db_connection_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Define your database connection parameters
        # print((Path(__file__).parent.parent / "ca.pem").resolve())
        connection = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            db=MYSQL_DATABASE,
            ssl_ca='ca.pem',
            cursorclass=pymysql.cursors.DictCursor
        )
        try:
            # Pass the connection to the decorated function
            cursor = connection.cursor()
            result = func(cursor, *args, **kwargs)
        except Exception as e:
            connection.rollback()  # Rollback in case of error
            print(f"An error occurred: {e}")
            raise
        else:
            connection.commit()  # Commit changes if successful
        finally:
            cursor.close()
            connection.close()  # Ensure connection is closed
        return result

    return wrapper