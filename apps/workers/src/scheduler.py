import sys
import time
import argparse
import logging
from pathlib import Path

# Add project root and src directory to python system path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))
sys.path.append(str(PROJECT_ROOT / "src"))

from mutator.mutate_live_fares import mutate_live_fares
from index_engine.weighting import calculate_weighted_index
from database.connection import SessionLocal
from database.models import IndexResult, Alert

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def run_simulation_cycle(cycle_number: int):
    logger.info("=" * 50)
    logger.info(f"STARTING SIMULATION CYCLE #{cycle_number} at {time.strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 50)
    
    try:
        # Step 1: Mutate live fares (simulates price changes)
        mutate_live_fares()
        
        # Step 2: Calculate weighting index based on mutated live fares and static fares
        calculate_weighted_index()
        
        # Step 3: Generate alerts for fare spikes
        generate_alerts()
        
        logger.info("-" * 50)
        logger.info(f"CYCLE #{cycle_number} completed successfully.")
        logger.info("=" * 50 + "\n")
        return True
    except Exception as e:
        logger.error(f"Error in cycle #{cycle_number}: {e}", exc_info=True)
        logger.info("=" * 50 + "\n")
        return False

def generate_alerts():
    """Generate alerts for significant fare changes (>15% from baseline)"""
    db = SessionLocal()
    try:
        # Get latest index results
        latest_result = db.query(IndexResult).order_by(IndexResult.observed_at.desc()).first()
        if not latest_result:
            return
        
        latest_rows = db.query(IndexResult).filter(
            IndexResult.observed_at == latest_result.observed_at
        ).all()
        
        # Check for spikes > 15% (index_value > 115 or < 85)
        for row in latest_rows:
            if row.index_value > 115:
                alert = Alert(
                    type='FARE_SPIKE',
                    route_id=f"{row.origin}-{row.destination}",
                    message=f"Fare spike detected on {row.origin}-{row.destination}: {row.index_value:.1f} (baseline=100)"
                )
                db.add(alert)
            elif row.index_value < 85:
                alert = Alert(
                    type='FARE_SPIKE',
                    route_id=f"{row.origin}-{row.destination}",
                    message=f"Fare drop detected on {row.origin}-{row.destination}: {row.index_value:.1f} (baseline=100)"
                )
                db.add(alert)
        
        db.commit()
        logger.info(f"Alert check completed for cycle")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to generate alerts: {e}")
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description="1-minute Simulation Scheduler for APIx")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument("--cycles", type=int, default=0, help="Number of cycles to run (0 for infinite)")
    parser.add_argument("--interval", type=int, default=60, help="Interval between cycles in seconds")
    args = parser.parse_args()
    
    logger.info("Initializing APIx Dynamic Pricing Simulation Scheduler...")
    logger.info(f"Interval configuration: {args.interval} seconds")
    
    if args.once:
        run_simulation_cycle(1)
        logger.info("Scheduler executed once and exiting.")
        return
        
    cycle = 1
    consecutive_failures = 0
    max_backoff = 300  # 5 minutes max backoff
    
    while True:
        success = run_simulation_cycle(cycle)
        
        if success:
            consecutive_failures = 0
        else:
            consecutive_failures += 1
            # Exponential backoff: 60s, 120s, 240s, 300s (capped)
            backoff = min(args.interval * (2 ** (consecutive_failures - 1)), max_backoff)
            logger.warning(f"Cycle failed. Backing off for {backoff} seconds (failure #{consecutive_failures})")
            time.sleep(backoff)
            continue
        
        if args.cycles > 0 and cycle >= args.cycles:
            logger.info(f"Reached configured limit of {args.cycles} cycles. Exiting.")
            break
            
        logger.info(f"Sleeping for {args.interval} seconds until next cycle...")
        time.sleep(args.interval)
        cycle += 1

if __name__ == "__main__":
    main()
