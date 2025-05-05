import sqlite3
from typing            import Annotated
from pathlib           import Path
from functools         import wraps
from fastapi           import Header, HTTPException, Depends
from fastapi.responses import JSONResponse

from config import MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, API_KEY

db_config = {
    "host":     MYSQL_HOST,
    "user":     MYSQL_USER,
    "password": MYSQL_PASSWORD,
    "database": MYSQL_DATABASE,
}

def db_connection_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Define SQLite database file path
        connection = sqlite3.connect("database.db")
        connection.row_factory = sqlite3.Row  # Enables dictionary-like row access
        
        try:
            cursor = connection.cursor()
            result = func(cursor, *args, **kwargs)
            connection.commit()  # Commit changes if successful
        except Exception as e:
            connection.rollback()  # Rollback in case of error
            print(f"An error occurred: {e}")
            raise
        finally:
            cursor.close()
            connection.close()  # Ensure connection is closed
        
        return result
    
    return wrapper


def delete_none(data):
    """Removes all keys with None values from a dictionary."""
    save_key = []
    for key in data:
        if data[key] is None:
            save_key.append(key)
    for key in save_key:
        del data[key]


def validate_header(f):
    """
    Wraps endpoint functions to authenticate requests
    by checking if the x-api-key header matches the expected API_KEY.
    - If valid, the original function is called.
    - If not, a 401 error is returned.
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        # print(args,kwargs)

        request = kwargs["request"]
        api_key = request.headers.get("x-api-key")

        if api_key == API_KEY:
            return f(*args, **kwargs)
        else:
            return JSONResponse(status_code=401, content={"detail": "Wrong API key"})

    return decorated


def api_key_header_dependency(x_api_key: str = Header(alias="x-api-key")):
    if x_api_key == API_KEY:
        return
    else:
        return HTTPException(status_code=401, detail="Wrong API key")


X_API_KEY_DEPS = Annotated[str, Depends(api_key_header_dependency)]
