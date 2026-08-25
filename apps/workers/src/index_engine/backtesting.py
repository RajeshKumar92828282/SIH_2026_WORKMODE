from sqlalchemy import text

from database.connection import SessionLocal


def run_backtest():
    db = SessionLocal()

    try:
        print("Starting index backtesting...", flush=True)

        result = db.execute(
            text("""
                WITH run_summary AS (
                    SELECT
                        run_id,
                        observed_at,
                        index_value
                    FROM index_results
                    WHERE origin = 'ALL'
                      AND destination = 'ALL'
                      AND cabin_class = 'ALL'
                ),

                ordered_runs AS (
                    SELECT
                        run_id,
                        observed_at,
                        index_value,
                        LAG(index_value) OVER (
                            ORDER BY observed_at
                        ) AS previous_index
                    FROM run_summary
                ),

                changes AS (
                    SELECT
                        run_id,
                        observed_at,
                        index_value,
                        previous_index,

                        CASE
                            WHEN previous_index IS NULL
                                OR previous_index = 0
                            THEN NULL
                            ELSE
                                (
                                    (index_value - previous_index)
                                    / previous_index
                                ) * 100
                        END AS change_percent

                    FROM ordered_runs
                )

                SELECT
                    COUNT(*) FILTER (
                        WHERE change_percent IS NOT NULL
                    ) AS observations,

                    AVG(change_percent) AS average_change,

                    MIN(change_percent) AS minimum_change,

                    MAX(change_percent) AS maximum_change,

                    STDDEV_POP(change_percent) AS volatility,

                    COUNT(DISTINCT run_id) AS runs

                FROM changes
            """)
        )

        row = result.one()

        print()
        print("===================================")
        print("Index Backtest")
        print("===================================")
        print(f"Runs         : {row.runs:,}")
        print(f"Observations : {row.observations:,}")

        if row.average_change is None:
            print("Average      : N/A")
            print("Minimum      : N/A")
            print("Maximum      : N/A")
            print("Volatility   : N/A")
        else:
            print(
                f"Average      : "
                f"{float(row.average_change):.6f}%"
            )

            print(
                f"Minimum      : "
                f"{float(row.minimum_change):.6f}%"
            )

            print(
                f"Maximum      : "
                f"{float(row.maximum_change):.6f}%"
            )

            print(
                f"Volatility   : "
                f"{float(row.volatility):.6f}%"
            )

        print("===================================")

    finally:
        db.close()


if __name__ == "__main__":
    run_backtest()