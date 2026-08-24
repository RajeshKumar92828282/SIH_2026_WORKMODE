import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone
from sqlalchemy import text
import pytest

# Add project root and src directory to python system path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))
sys.path.append(str(PROJECT_ROOT / "src"))

from database.connection import SessionLocal, engine
from mutator.mutate_live_fares import mutate_live_fares
from index_engine.weighting import calculate_weighted_index

def test_database_connection():
    """Verify that we can successfully connect to the Neon database."""
    with engine.connect() as conn:
        res = conn.execute(text("SELECT 1")).scalar()
        assert res == 1

def test_tables_exist():
    """Verify that all the required tables exist in the PostgreSQL schema."""
    with engine.connect() as conn:
        res = conn.execute(text(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        )).fetchall()
        tables = [row[0] for row in res]
        assert "static_fares" in tables
        assert "live_fares" in tables
        assert "index_results" in tables

def test_e2e_database_and_index_flow():
    """
    Triggers one dynamic pricing and index calculation cycle, verifies
    successful database updates, and cleans up the test records.
    """
    db = SessionLocal()
    
    # Store initial counts
    static_count = db.execute(text("SELECT COUNT(*) FROM static_fares")).scalar()
    # If static fares are empty, run the loader first
    if static_count == 0:
        from loader.load_static_csv import load_static_fares
        load_static_fares()
        static_count = db.execute(text("SELECT COUNT(*) FROM static_fares")).scalar()
        
    assert static_count > 0
    
    # Store counts before mutation
    live_count_before = db.execute(text("SELECT COUNT(*) FROM live_fares")).scalar()
    index_count_before = db.execute(text("SELECT COUNT(*) FROM index_results")).scalar()
    
    # Record current timestamp for cleanup tracking
    test_start_time = datetime.now(timezone.utc).replace(tzinfo=None)
    
    try:
        # 1. Run dynamic price mutation
        test_observed_at = mutate_live_fares()
        
        # 2. Run weighted route index calculation
        index_val = calculate_weighted_index()
        
        # 3. Verify assertions
        # Live fares count should increase by the number of static fares
        live_count_after = db.execute(text("SELECT COUNT(*) FROM live_fares")).scalar()
        assert live_count_after == live_count_before + static_count
        
        # Index results should contain new rows (one per active route+cabin_class)
        index_count_after = db.execute(text("SELECT COUNT(*) FROM index_results")).scalar()
        assert index_count_after > index_count_before
        assert index_val > 0
        
    finally:
        # 4. Clean up: Delete only the records created by this test run
        print("\nCleaning up integration test database records...")
        try:
            if 'test_observed_at' in locals() and test_observed_at:
                db.execute(
                    text("DELETE FROM live_fares WHERE observed_at = :t"),
                    {"t": test_observed_at}
                )
            
            # Fetch specific run_ids created during this integration test run
            run_ids = db.execute(
                text("SELECT DISTINCT run_id FROM index_results WHERE observed_at >= :t"),
                {"t": test_start_time}
            ).fetchall()
            for r in run_ids:
                db.execute(
                    text("DELETE FROM index_results WHERE run_id = :run_id"),
                    {"run_id": r[0]}
                )
            db.commit()
        except Exception as cleanup_err:
            print(f"Error cleaning up test database records: {cleanup_err}")
            db.rollback()
        finally:
            db.close()
