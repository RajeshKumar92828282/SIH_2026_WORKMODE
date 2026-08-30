from sqlalchemy import text

from database.connection import SessionLocal


EXPECTED_RESULTS_PER_RUN = 60


def run_backtest():
    db = SessionLocal()

    try:
        print("Starting index backtesting...", flush=True)

        # ---------------------------------------------------------
        # 1. Basic run statistics
        # ---------------------------------------------------------
        result = db.execute(
            text("""
                WITH run_summary AS (
                    SELECT
                        run_id,
                        MIN(observed_at) AS observed_at,
                        AVG(index_value) AS index_value,
                        COUNT(*) AS result_count,
                        COUNT(*) FILTER (
                            WHERE index_value IS NULL
                        ) AS null_index_count
                    FROM index_results
                    GROUP BY run_id
                )

                SELECT
                    COUNT(*) AS total_runs,

                    COUNT(*) FILTER (
                        WHERE result_count = :expected
                    ) AS complete_runs,

                    COUNT(*) FILTER (
                        WHERE result_count <> :expected
                    ) AS incomplete_runs,

                    COUNT(*) FILTER (
                        WHERE null_index_count > 0
                    ) AS runs_with_null_index,

                    MIN(result_count) AS minimum_results,
                    MAX(result_count) AS maximum_results

                FROM run_summary
            """),
            {
                "expected": EXPECTED_RESULTS_PER_RUN
            },
        )

        validation = result.one()

        # ---------------------------------------------------------
        # 2. Duplicate run_id check
        # ---------------------------------------------------------
        duplicate_runs = db.execute(
            text("""
                SELECT COUNT(*)
                FROM (
                    SELECT run_id
                    FROM index_results
                    GROUP BY run_id
                    HAVING COUNT(*) > :expected
                ) duplicates
            """),
            {
                "expected": EXPECTED_RESULTS_PER_RUN
            },
        ).scalar_one()

        # ---------------------------------------------------------
        # 3. Weight validation
        # ---------------------------------------------------------
        weight_check = db.execute(
            text("""
                SELECT
                    COUNT(*) AS invalid_weights
                FROM (
                    SELECT
                        run_id,
                        SUM(
                            CASE
                                WHEN index_value IS NULL
                                THEN 0
                                ELSE 1
                            END
                        ) AS valid_results
                    FROM index_results
                    GROUP BY run_id
                ) x
                WHERE valid_results <> :expected
            """),
            {
                "expected": EXPECTED_RESULTS_PER_RUN
            },
        ).scalar_one()

        # ---------------------------------------------------------
        # 4. Backtest calculation
        # ---------------------------------------------------------
        result = db.execute(
            text("""
                WITH run_summary AS (
                    SELECT
                        run_id,
                        MIN(observed_at) AS observed_at,
                        AVG(index_value) AS index_value
                    FROM index_results
                    GROUP BY run_id
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

        # ---------------------------------------------------------
        # 5. Validation output
        # ---------------------------------------------------------
        print()
        print("===================================")
        print("Index Validation")
        print("===================================")

        print(
            f"Total runs             : "
            f"{validation.total_runs:,}"
        )

        print(
            f"Complete runs          : "
            f"{validation.complete_runs:,}"
        )

        print(
            f"Incomplete runs        : "
            f"{validation.incomplete_runs:,}"
        )

        print(
            f"NULL index runs        : "
            f"{validation.runs_with_null_index:,}"
        )

        print(
            f"Minimum results/run    : "
            f"{validation.minimum_results:,}"
        )

        print(
            f"Maximum results/run    : "
            f"{validation.maximum_results:,}"
        )

        print(
            f"Invalid result groups  : "
            f"{weight_check:,}"
        )

        print(
            f"Duplicate/inconsistent : "
            f"{duplicate_runs:,}"
        )

        # ---------------------------------------------------------
        # 6. Validation status
        # ---------------------------------------------------------
        validation_passed = (
            validation.total_runs > 0
            and validation.incomplete_runs == 0
            and validation.runs_with_null_index == 0
            and weight_check == 0
            and duplicate_runs == 0
        )

        print("-----------------------------------")

        if validation_passed:
            print("Validation status      : PASS")
        else:
            print("Validation status      : FAIL")

        print("===================================")

        # ---------------------------------------------------------
        # 7. Backtest output
        # ---------------------------------------------------------
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