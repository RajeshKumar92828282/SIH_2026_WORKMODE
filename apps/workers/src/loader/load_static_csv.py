import csv
from datetime import datetime
from pathlib import Path

from sqlalchemy import insert

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

    inserted = 0
    skipped = 0
    batch = []

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
                "Flight Name",
                "Flight Number",
                "Flight Date",
                "From",
                "Destination",
                "Flight Time",
                "Flight Class",
                "Price",
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

                    carrier = row["Flight Name"]
                    flight_number = row["Flight Number"]
                    origin = row["From"]
                    destination = row["Destination"]
                    flight_time = row["Flight Time"]
                    cabin_class = row["Flight Class"]

                    flight_date = datetime.strptime(
                        row["Flight Date"],
                        "%Y-%m-%d",
                    ).date()

                    total_fare = float(row["Price"])

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

                    batch.append(
                        {
                            "carrier": carrier,
                            "flight_number": flight_number,
                            "flight_date": flight_date,
                            "origin": origin,
                            "destination": destination,
                            "flight_time": flight_time,
                            "cabin_class": cabin_class,
                            "advance_window": None,
                            "base_fare": None,
                            "taxes": None,
                            "total_fare": total_fare,
                        }
                    )

                    if len(batch) >= BATCH_SIZE:
                        db.execute(
                            insert(StaticFare),
                            batch,
                        )

                        db.commit()

                        inserted += len(batch)
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
                db.execute(
                    insert(StaticFare),
                    batch,
                )

                db.commit()

                inserted += len(batch)
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