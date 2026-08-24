import sys
import time
import argparse
from pathlib import Path
from sqlalchemy import text

# Add project root and src directory to python system path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))
sys.path.append(str(PROJECT_ROOT / "src"))

from database.connection import SessionLocal
from mutator.mutate_live_fares import mutate_live_fares, prune_old_live_fares
from index_engine.weighting import calculate_weighted_index

def run_simulation_cycle(cycle_number: int):
    print("\n" + "=" * 50)
    print(f"STARTING SIMULATION CYCLE #{cycle_number} at {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    
    try:
        # Step 1: Mutate live fares (simulates price changes)
        mutate_live_fares()
        
        # Step 2: Calculate weighting index based on mutated live fares and static fares
        calculate_weighted_index()
        
        # Step 3: Prune old live fares to prevent database growth
        prune_old_live_fares()
        
        print("-" * 50)
        print(f"CYCLE #{cycle_number} completed successfully.")
        print("=" * 50 + "\n")
    except Exception as e:
        print(f"Error in cycle #{cycle_number}: {e}", file=sys.stderr)
        print("=" * 50 + "\n")

def main():
    parser = argparse.ArgumentParser(description="1-minute Simulation Scheduler for APIx")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument("--cycles", type=int, default=0, help="Number of cycles to run (0 for infinite)")
    args = parser.parse_args()
    
    print("Initializing APIx Dynamic Pricing Simulation Scheduler...")
    print("Interval configuration: 1 minute (60 seconds)")
    
    # Establish connection and acquire advisory lock to prevent multiple instances from running concurrently
    lock_session = SessionLocal()
    try:
        # 123456789 is a unique key for the APIx scheduler lock
        lock_result = lock_session.execute(text("SELECT pg_try_advisory_lock(123456789)"))
        has_lock = lock_result.scalar()
        if not has_lock:
            print("CRITICAL ERROR: Another scheduler instance is already running. Exiting.", file=sys.stderr)
            lock_session.close()
            sys.exit(1)
        print("Acquired database advisory lock successfully. Only this instance will run.")
    except Exception as e:
        print(f"Failed to verify/acquire advisory lock: {e}", file=sys.stderr)
        lock_session.close()
        sys.exit(1)

    try:
        if args.once:
            run_simulation_cycle(1)
            print("Scheduler executed once and exiting.")
            return
            
        cycle = 1
        while True:
            run_simulation_cycle(cycle)
            
            if args.cycles > 0 and cycle >= args.cycles:
                print(f"Reached configured limit of {args.cycles} cycles. Exiting.")
                break
                
            print("Sleeping for 60 seconds until next cycle...", flush=True)
            time.sleep(60)
            cycle += 1
    finally:
        # Release the lock by closing the session
        lock_session.close()
        print("Advisory lock released.")

if __name__ == "__main__":
    main()
