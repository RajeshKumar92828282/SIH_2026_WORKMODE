from datetime import date, datetime, timezone
import uuid

from sqlalchemy import Date, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database.connection import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class StaticFare(Base):
    __tablename__ = "static_fares"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # Airline / flight information
    carrier: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    flight_number: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    flight_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    # Route
    origin: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    destination: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    # Flight characteristics
    flight_time: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    cabin_class: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    # Booking-window information
    advance_window: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    # Fare information
    base_fare: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    taxes: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    total_fare: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    # When this observation entered our system
    observed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=utc_now,
        nullable=False,
    )


class LiveFare(Base):
    __tablename__ = "live_fares"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    carrier: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    flight_number: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    flight_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    origin: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    destination: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    flight_time: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    cabin_class: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    # Booking-window information
    advance_window: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    # Fare information
    base_fare: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    taxes: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    total_fare: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    observed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=utc_now,
        nullable=False,
    )


class IndexResult(Base):
    __tablename__ = "index_results"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    origin: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    destination: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    advance_window: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    cabin_class: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    index_value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    observed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=utc_now,
        nullable=False,
    )

    # Identifies one complete index calculation run
    run_id: Mapped[str] = mapped_column(
        String(36),
        nullable=False,
        index=True,
        default=lambda: str(uuid.uuid4()),
    )