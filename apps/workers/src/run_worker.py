import os
import sys
import time
import signal
import logging
from datetime import datetime, timezone

# Add current directory (src) to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from mutator.mutate_live_fares import mutate_live_fares
from index_engine.weighting import calculate_weighted_index

# Configure production logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [APIx-Worker] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("apix-worker")

running = True

def handle_shutdown(signum, frame):
    global running
    logger.info("Received termination signal (%s). Initiating graceful worker shutdown...", signum)
    running = False

def main():
    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)

    tick_interval = int(os.getenv("TICK_INTERVAL_SECONDS", "15"))
    logger.info("Starting APIx Production Worker Engine Daemon")
    logger.info("Configured tick interval: %d seconds", tick_interval)

    tick_count = 0

    while running:
        tick_count += 1
        start_time = time.time()
        logger.info("=== TICK #%d START: %s ===", tick_count, datetime.now(timezone.utc).isoformat())

        try:
            # Step 1: Mutate / scrape live fare observations
            logger.info("Executing intraday live fare mutation...")
            mutate_live_fares()

            # Step 2: Compute DGCA traffic-weighted CPI index
            logger.info("Calculating weighted CPI airfare price index...")
            index_val = calculate_weighted_index()
            logger.info("Computed Index Value: %s", f"{index_val:.4f}" if index_val else "N/A")

            elapsed = time.time() - start_time
            logger.info("=== TICK #%d SUCCESS (Duration: %.2fs) ===", tick_count, elapsed)

        except Exception as e:
            logger.error("Error encountered during worker tick #%d: %s", tick_count, str(e), exc_info=True)

        # Sleep for configured interval checking for shutdown signals
        sleep_steps = tick_interval * 2
        for _ in range(sleep_steps):
          if not running:
            break
          time.sleep(0.5)

    logger.info("APIx Worker Engine Daemon stopped cleanly.")

if __name__ == "__main__":
    main()
