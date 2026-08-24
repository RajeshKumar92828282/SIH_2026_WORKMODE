import uuid
from datetime import datetime, timezone

from sqlalchemy import text

from database.connection import SessionLocal
from database.models import IndexResult


def calculate_weighted_index():
    db = SessionLocal()

    try:
        print("Starting weighting engine...", flush=True)

        # One UUID identifies this complete index calculation run.
        run_id = str(uuid.uuid4())

        # Use the timestamp of the newest live fare snapshot.
        snapshot_result = db.execute(
            text("""
                SELECT MAX(observed_at)
                FROM live_fares
            """)
        )

        snapshot_at = snapshot_result.scalar()

        if snapshot_at is None:
            print("No live fare snapshot available.")
            return

        # Use a timezone-safe UTC timestamp for the index result.
        observed_at = datetime.now(timezone.utc).replace(tzinfo=None)

        result = db.execute(
            text("""
                WITH latest_snapshot AS (
                    SELECT
                        MAX(observed_at) AS observed_at
                    FROM live_fares
                ),

                static_grouped AS (
                    SELECT
                        carrier,
                        flight_number,
                        flight_date,
                        origin,
                        destination,
                        flight_time,
                        cabin_class,
                        AVG(total_fare) AS static_fare
                    FROM static_fares
                    GROUP BY
                        carrier,
                        flight_number,
                        flight_date,
                        origin,
                        destination,
                        flight_time,
                        cabin_class
                ),

                live_grouped AS (
                    SELECT
                        lf.carrier,
                        lf.flight_number,
                        lf.flight_date,
                        lf.origin,
                        lf.destination,
                        lf.flight_time,
                        lf.cabin_class,
                        AVG(lf.total_fare) AS live_fare
                    FROM live_fares lf
                    INNER JOIN latest_snapshot ls
                        ON lf.observed_at = ls.observed_at
                    GROUP BY
                        lf.carrier,
                        lf.flight_number,
                        lf.flight_date,
                        lf.origin,
                        lf.destination,
                        lf.flight_time,
                        lf.cabin_class
                ),

                route_changes AS (
                    SELECT
                        s.origin,
                        s.destination,
                        s.cabin_class,
                        COUNT(*) AS observations,

                        AVG(
                            CASE
                                WHEN s.static_fare = 0 THEN 0
                                ELSE (
                                    (l.live_fare - s.static_fare)
                                    / s.static_fare
                                ) * 100
                            END
                        ) AS price_change_percent

                    FROM static_grouped s

                    INNER JOIN live_grouped l
                        ON s.carrier = l.carrier
                        AND s.flight_number = l.flight_number
                        AND s.flight_date = l.flight_date
                        AND s.origin = l.origin
                        AND s.destination = l.destination
                        AND s.flight_time = l.flight_time
                        AND s.cabin_class = l.cabin_class

                    GROUP BY
                        s.origin,
                        s.destination,
                        s.cabin_class
                ),

                totals AS (
                    SELECT
                        SUM(observations) AS total_observations
                    FROM route_changes
                )

                SELECT
                    r.origin,
                    r.destination,
                    r.cabin_class,
                    r.observations,

                    (
                        r.observations::numeric
                        / NULLIF(t.total_observations, 0)
                    ) AS weight,

                    r.price_change_percent,

                    (
                        r.price_change_percent *
                        (
                            r.observations::numeric
                            / NULLIF(t.total_observations, 0)
                        )
                    ) AS weighted_change

                FROM route_changes r

                CROSS JOIN totals t

                ORDER BY
                    r.origin,
                    r.destination,
                    r.cabin_class
            """)
        )

        rows = result.fetchall()

        if not rows:
            print("No data available for weighting.")
            return

        total_weighted_change = sum(
            float(row.weighted_change)
            for row in rows
        )

        index_value = 100 * (
            1 + total_weighted_change / 100
        )

        print()
        print("===================================")
        print("Weighted Route Index")
        print("===================================")
        print(f"Live snapshot: {snapshot_at}")
        print()

        for row in rows:
            print(
                f"{row.origin} -> {row.destination} | "
                f"Class: {row.cabin_class} | "
                f"Weight: {float(row.weight) * 100:.2f}% | "
                f"Change: {float(row.price_change_percent):.4f}%"
            )

            db.add(
                IndexResult(
                    origin=row.origin,
                    destination=row.destination,
                    advance_window=None,
                    cabin_class=row.cabin_class,
                    index_value=float(
                        100 * (
                            1 + float(row.price_change_percent) / 100
                        )
                    ),
                    observed_at=observed_at,
                    run_id=run_id,
                )
            )

        # Save the overall weighted index as a summary row
        db.add(
            IndexResult(
                origin="ALL",
                destination="ALL",
                advance_window=None,
                cabin_class="ALL",
                index_value=float(index_value),
                observed_at=observed_at,
                run_id=run_id,
            )
        )

        db.commit()

        print("-----------------------------------")
        print(
            f"Weighted price change: "
            f"{total_weighted_change:.4f}%"
        )
        print(f"Overall index value: {index_value:.4f}")
        print(f"Index results saved: {len(rows):,}")
        print(f"Run ID: {run_id}")
        print(f"Observed at: {observed_at}")
        print("===================================")

        return index_value

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    calculate_weighted_index()