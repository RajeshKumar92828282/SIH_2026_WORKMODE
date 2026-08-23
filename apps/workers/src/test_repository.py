from datetime import date

from database.connection import SessionLocal
from database.repository import FareRepository


def main():
    db = SessionLocal()

    try:
        static_fare = FareRepository.add_static_fare(
            db=db,
            carrier="IndiGo",
            flight_number="6E-5001",
            flight_date=date(2026, 8, 21),
            origin="Delhi",
            destination="Mumbai",
            flight_time="Morning",
            cabin_class="Economy",
            total_fare=5400,
            advance_window="T+7",
        )

        live_fare = FareRepository.add_live_fare(
            db=db,
            carrier="IndiGo",
            flight_number="6E-5001",
            flight_date=date(2026, 8, 21),
            origin="Delhi",
            destination="Mumbai",
            flight_time="Morning",
            cabin_class="Economy",
            total_fare=5650,
            advance_window="T+7",
        )

        index_result = FareRepository.add_index_result(
            db=db,
            origin="Delhi",
            destination="Mumbai",
            advance_window="T+7",
            cabin_class="Economy",
            index_value=104.63,
        )

        print("Repository test successful!")
        print("Static fare ID:", static_fare.id)
        print("Live fare ID:", live_fare.id)
        print("Index result ID:", index_result.id)

    finally:
        db.close()


if __name__ == "__main__":
    main()