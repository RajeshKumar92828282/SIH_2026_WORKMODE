from sqlalchemy import text

from database.connection import engine

print("Testing database connection...")

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("Database connection successful!")
        print("Result:", result.scalar())

except Exception as error:
    print("Database connection failed!")
    print(type(error).__name__)
    print(error)