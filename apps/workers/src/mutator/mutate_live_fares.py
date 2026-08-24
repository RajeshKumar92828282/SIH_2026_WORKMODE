from datetime import datetime, timezone

from sqlalchemy import text

from database.connection import SessionLocal


def prune_old_live_fares():
    db = SessionLocal()

    try:
        print("Starting live fare retention pruning...", flush=True)

        # Delete live fares older than 24 hours to prevent exponential growth
        prune_result = db.execute(
            text("""
                DELETE FROM live_fares
                WHERE observed_at < NOW() - INTERVAL '24 hours'
            """)
        )
        db.commit()

        if prune_result.rowcount > 0:
            print(
                f"Pruned {prune_result.rowcount:,} old live fare records (older than 24 hours).",
                flush=True,
            )
        else:
            print("No old live fare records to prune.", flush=True)

    except Exception as e:
        db.rollback()
        print(f"Warning: Failed to prune old live fares: {e}", flush=True)
    finally:
        db.close()


def mutate_live_fares():
    db = SessionLocal()

    try:
        print("Starting bulk live fare mutation...", flush=True)

        observed_at = datetime.now(timezone.utc).replace(tzinfo=None)

        result = db.execute(
            text("""
                INSERT INTO live_fares (
                    carrier,
                    flight_number,
                    flight_date,
                    origin,
                    destination,
                    flight_time,
                    cabin_class,
                    advance_window,
                    base_fare,
                    taxes,
                    total_fare,
                    observed_at
                )
                SELECT
                    carrier,
                    flight_number,
                    flight_date,
                    origin,
                    destination,
                    flight_time,
                    cabin_class,
                    advance_window,
                    base_fare,
                    taxes,

                    ROUND(
                        GREATEST(
                            total_fare * (
                                1 + (RANDOM() * 0.10 - 0.05)
                            ),
                            1
                        )::numeric,
                        2
                    ),

                    :observed_at

                FROM static_fares
            """),
            {
                "observed_at": observed_at,
            },
        )

        db.commit()

        print(
            f"Bulk mutation completed. "
            f"Rows inserted: {result.rowcount:,}",
            flush=True,
        )

        print(
            f"Snapshot timestamp: {observed_at}",
            flush=True,
        )
        return observed_at

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    mutate_live_fares()