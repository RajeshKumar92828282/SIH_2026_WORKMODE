from datetime import datetime, timezone

from sqlalchemy import text

try:
    from database.connection import SessionLocal
except ModuleNotFoundError:
    from src.database.connection import SessionLocal


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

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    mutate_live_fares()