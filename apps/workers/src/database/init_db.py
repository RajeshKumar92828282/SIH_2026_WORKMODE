import os
import sys
from database.connection import Base, engine
from database.models import StaticFare, LiveFare, IndexResult


def init_db():
    database_url = os.getenv("DATABASE_URL", "")
    is_prod = os.getenv("ENV") == "production" or "prod" in database_url.lower()

    if is_prod:
        if "--force" not in sys.argv:
            print("CRITICAL ERROR: Database reset blocked on PRODUCTION environment!")
            print("To bypass this safeguard, run this script with the '--force' flag: python init_db.py --force")
            sys.exit(1)

    print("Resetting database tables...")

    Base.metadata.drop_all(bind=engine)

    print("Creating database tables...")

    Base.metadata.create_all(bind=engine)

    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()