from datetime import date
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from database.models import StaticFare, LiveFare, IndexResult


class FareRepository:

    # ============================================================
    # STATIC FARES
    # ============================================================

    @staticmethod
    def add_static_fare(
        db: Session,
        carrier: str,
        flight_number: str,
        flight_date: date,
        origin: str,
        destination: str,
        flight_time: str,
        cabin_class: str,
        total_fare: float,
        advance_window: Optional[str] = None,
        base_fare: Optional[float] = None,
        taxes: Optional[float] = None,
    ):
        fare = StaticFare(
            carrier=carrier,
            flight_number=flight_number,
            flight_date=flight_date,
            origin=origin,
            destination=destination,
            flight_time=flight_time,
            cabin_class=cabin_class,
            advance_window=advance_window,
            base_fare=base_fare,
            taxes=taxes,
            total_fare=total_fare,
        )

        db.add(fare)
        db.commit()
        db.refresh(fare)

        return fare

    @staticmethod
    def get_static_fares(db: Session):
        return db.scalars(
            select(StaticFare)
        ).all()

    # ============================================================
    # LIVE FARES
    # ============================================================

    @staticmethod
    def add_live_fare(
        db: Session,
        carrier: str,
        flight_number: str,
        flight_date: date,
        origin: str,
        destination: str,
        flight_time: str,
        cabin_class: str,
        total_fare: float,
        advance_window: Optional[str] = None,
        base_fare: Optional[float] = None,
        taxes: Optional[float] = None,
    ):
        fare = LiveFare(
            carrier=carrier,
            flight_number=flight_number,
            flight_date=flight_date,
            origin=origin,
            destination=destination,
            flight_time=flight_time,
            cabin_class=cabin_class,
            advance_window=advance_window,
            base_fare=base_fare,
            taxes=taxes,
            total_fare=total_fare,
        )

        db.add(fare)
        db.commit()
        db.refresh(fare)

        return fare

    @staticmethod
    def get_live_fares(db: Session):
        return db.scalars(
            select(LiveFare)
        ).all()



    @staticmethod
    def add_index_result(
        db: Session,
        origin: str,
        destination: str,
        index_value: float,
        advance_window: Optional[str] = None,
        cabin_class: Optional[str] = None,
    ):
        result = IndexResult(
            origin=origin,
            destination=destination,
            advance_window=advance_window,
            cabin_class=cabin_class,
            index_value=index_value,
        )

        db.add(result)
        db.commit()
        db.refresh(result)

        return result

    @staticmethod
    def get_index_results(db: Session):
        return db.scalars(
            select(IndexResult)
        ).all()