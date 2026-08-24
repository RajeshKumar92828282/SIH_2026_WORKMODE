import sys
from pathlib import Path

# Add project root and src directory to python system path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(PROJECT_ROOT))
sys.path.append(str(PROJECT_ROOT / "src"))

from database.connection import engine
from sqlalchemy import text

def apply_indexes():
    print("Applying indexes to the Neon PostgreSQL database...")
    queries = [
        # 1. Composite index for static_fares join columns
        """
        CREATE INDEX IF NOT EXISTS ix_static_fares_join_keys
        ON static_fares (origin, destination, cabin_class, carrier, flight_number, flight_date, flight_time);
        """,
        # 2. Composite index for live_fares join columns
        """
        CREATE INDEX IF NOT EXISTS ix_live_fares_join_keys
        ON live_fares (origin, destination, cabin_class, carrier, flight_number, flight_date, flight_time);
        """,
        # 3. Single column index on live_fares.observed_at for quick latest snapshot discovery
        """
        CREATE INDEX IF NOT EXISTS ix_live_fares_observed_at
        ON live_fares (observed_at);
        """
    ]
    
    with engine.begin() as conn:
        for idx, query in enumerate(queries, 1):
            print(f"Executing index creation query #{idx}...")
            conn.execute(text(query))
            
    print("All indexes applied successfully!")

if __name__ == "__main__":
    apply_indexes()
