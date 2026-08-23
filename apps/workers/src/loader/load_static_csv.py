import csv
from datetime import datetime
from pathlib import Path

from sqlalchemy import insert, text

from database.connection import SessionLocal
from database.models import StaticFare


CSV_FILE = Path("data/processed/cleaned_observations.csv")
BATCH_SIZE = 1000


def load_static_fares():
    if not CSV_FILE.exists():
        raise FileNotFoundError(
            f"CSV file not found: {CSV_FILE}"
        )

    db = SessionLocal()

    # Make import idempotent by truncating static_fares first
    try:
        db.execute(text("TRUNCATE TABLE static_fares RESTART IDENTITY CASCADE"))
        db.commit()
        print("Truncated table static_fares successfully.")
    except Exception as e:
        print(f"Warning: could not truncate table static_fares: {e}")
        db.rollback()

    inserted = 0
    skipped = 0
    batch = []

    def _save_batch(batch_list):
        try:
            db.execute(insert(StaticFare), batch_list)
            db.commit()
            return len(batch_list), 0
        except Exception as batch_error:
            db.rollback()
            print(f"Error inserting batch: {batch_error}. Retrying row-by-row...")
            row_success = 0
            row_fail = 0
            for item in batch_list:
                try:
                    db.execute(insert(StaticFare), [item])
                    db.commit()
                    row_success += 1
                except Exception as row_error:
                    db.rollback()
                    row_fail += 1
                    if row_fail <= 5:
                        print(f"Failed row insert: {row_error}")
            return row_success, row_fail

    try:
        with CSV_FILE.open(
            "r",
            newline="",
            encoding="utf-8-sig",
        ) as file:

            reader = csv.DictReader(file)

            # Normalize CSV headers
            reader.fieldnames = [
                header.strip()
                for header in (reader.fieldnames or [])
            ]

            required_columns = {
                "airline",
                "flight_number",
                "journey_date",
                "origin",
                "destination",
                "departure_time",
                "cabin_class",
                "price",
            }

            actual_columns = set(reader.fieldnames or [])

            missing = required_columns - actual_columns

            if missing:
                raise ValueError(
                    f"Missing CSV columns: {sorted(missing)}"
                )

            for row_number, row in enumerate(reader, start=2):

                try:
                    # Normalize values
                    row = {
                        key.strip(): (
                            value.strip()
                            if value is not None
                            else ""
                        )
                        for key, value in row.items()
                    }

                    # Filter out outliers and invalid status rows
                    is_outlier_str = row.get("is_outlier", "False").strip().lower()
                    if is_outlier_str in ("true", "1", "yes"):
                        skipped += 1
                        continue

                    quality_status = row.get("quality_status", "VALID").strip().upper()
                    if quality_status == "REJECTED":
                        skipped += 1
                        continue

                    carrier = row["airline"]
                    flight_number = row["flight_number"]
                    origin = row["origin"]
                    destination = row["destination"]
                    flight_time = row["departure_time"]
                    cabin_class = row["cabin_class"]

                    flight_date = datetime.strptime(
                        row["journey_date"],
                        "%Y-%m-%d",
                    ).date()

                    total_fare = float(row["price"])

                    if not carrier:
                        raise ValueError("Empty carrier")

                    if not flight_number:
                        raise ValueError(
                            "Empty flight number"
                        )

                    if not origin:
                        raise ValueError("Empty origin")

                    if not destination:
                        raise ValueError(
                            "Empty destination"
                        )

                    if total_fare <= 0:
                        raise ValueError(
                            "Price must be greater than 0"
                        )

                    # Extract nullable base_fare, taxes, advance_window
                    advance_window = row.get("advance_window") or None
                    
                    base_fare_str = row.get("base_fare", "")
                    base_fare = float(base_fare_str) if base_fare_str else None
                    
                    taxes_str = row.get("taxes", "")
                    taxes = float(taxes_str) if taxes_str else None

                    batch.append(
                        {
                            "carrier": carrier,
                            "flight_number": flight_number,
                            "flight_date": flight_date,
                            "origin": origin,
                            "destination": destination,
                            "flight_time": flight_time,
                            "cabin_class": cabin_class,
                            "advance_window": advance_window,
                            "base_fare": base_fare,
                            "taxes": taxes,
                            "total_fare": total_fare,
                        }
                    )

                    if len(batch) >= BATCH_SIZE:
                        success_cnt, fail_cnt = _save_batch(batch)
                        inserted += success_cnt
                        skipped += fail_cnt
                        batch.clear()

                        print(
                            f"Inserted {inserted:,} rows...",
                            flush=True,
                        )

                except Exception as error:
                    skipped += 1

                    if skipped <= 10:
                        print(
                            f"Skipping row {row_number}: {error}",
                            flush=True,
                        )

            # Remaining rows
            if batch:
                success_cnt, fail_cnt = _save_batch(batch)
                inserted += success_cnt
                skipped += fail_cnt
                batch.clear()

        print()
        print("===================================")
        print("Static fare loading completed!")
        print(f"Rows inserted : {inserted:,}")
        print(f"Rows skipped  : {skipped:,}")
        print("===================================")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    load_static_fares()