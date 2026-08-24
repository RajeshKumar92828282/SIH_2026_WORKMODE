from datetime import datetime, timezone

from sqlalchemy import text

from database.connection import SessionLocal


def mutate_live_fares():
    db = SessionLocal()

    try:
        print("Starting bulk live fare upsert...", flush=True)

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
                ON CONFLICT (carrier, flight_number, flight_date, origin, destination, flight_time, cabin_class, advance_window)
                DO UPDATE SET
                    total_fare = EXCLUDED.total_fare,
                    base_fare = EXCLUDED.base_fare,
                    taxes = EXCLUDED.taxes,
                    observed_at = EXCLUDED.observed_at
            """),
            {
                "observed_at": observed_at,
            },
        )

        db.commit()

        print(
            f"Bulk upsert completed. "
            f"Rows affected: {result.rowcount:,}",
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