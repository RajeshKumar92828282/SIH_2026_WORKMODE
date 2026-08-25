import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in .env")

# Handle driver selection gracefully for Windows Python environments
db_url = DATABASE_URL
if db_url.startswith("postgresql://") or db_url.startswith("postgres://"):
    try:
        import psycopg2
    except ImportError:
        try:
            import psycopg
            db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)
            db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
        except ImportError:
            try:
                import pg8000
                db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)
                db_url = db_url.replace("postgres://", "postgresql+pg8000://", 1)
            except ImportError:
                print("[PYTHON WORKER WARNING] Neither psycopg2, psycopg, nor pg8000 found.")

engine_args = {"pool_pre_ping": True}
if "sqlite" not in db_url:
    engine_args["pool_size"] = 10
    engine_args["max_overflow"] = 5

engine = create_engine(db_url, **engine_args)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)

class Base(DeclarativeBase):
    pass