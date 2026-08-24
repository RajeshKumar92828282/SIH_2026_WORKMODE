from sqlalchemy import text

from database.connection import SessionLocal


def compare_fares():
    db = SessionLocal()

    try:
        print("Starting fare comparison...", flush=True)

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
                        AVG(total_fare) AS static_fare,
                        COUNT(*) AS static_observations
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
                        AVG(lf.total_fare) AS live_fare,
                        COUNT(*) AS live_observations
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
                )

                SELECT
                    s.origin,
                    s.destination,

                    COUNT(*) AS observation_count,

                    AVG(s.static_fare) AS static_avg,

                    AVG(l.live_fare) AS live_avg,

                    AVG(
                        CASE
                            WHEN s.static_fare = 0 THEN 0
                            ELSE (
                                (l.live_fare - s.static_fare)
                                / s.static_fare
                            ) * 100
                        END
                    ) AS average_change_percent,

                    MIN(
                        CASE
                            WHEN s.static_fare = 0 THEN 0
                            ELSE (
                                (l.live_fare - s.static_fare)
                                / s.static_fare
                            ) * 100
                        END
                    ) AS minimum_change_percent,

                    MAX(
                        CASE
                            WHEN s.static_fare = 0 THEN 0
                            ELSE (
                                (l.live_fare - s.static_fare)
                                / s.static_fare
                            ) * 100
                        END
                    ) AS maximum_change_percent

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
                    s.destination

                ORDER BY
                    s.origin,
                    s.destination
            """)
        )

        rows = result.fetchall()

        if not rows:
            print("No matching fare observations found.")
            return

        print()
        print("===================================")
        print("Route Fare Comparison")
        print("===================================")

        total_observations = 0

        for row in rows:
            total_observations += row.observation_count

            print(
                f"{row.origin} → {row.destination} | "
                f"Records: {row.observation_count:,} | "
                f"Static Avg: ₹{row.static_avg:.2f} | "
                f"Live Avg: ₹{row.live_avg:.2f} | "
                f"Change: {row.average_change_percent:.2f}%"
            )

        print("-----------------------------------")
        print(f"Routes: {len(rows):,}")
        print(f"Matched observations: {total_observations:,}")
        print("===================================")

    finally:
        db.close()


if __name__ == "__main__":
    compare_fares()