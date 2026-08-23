from datetime import date
import pytest
from data_pipeline.cleaner import (
    clean_missing_value,
    clean_price,
    clean_stops,
    clean_duration,
    clean_date
)

def test_clean_missing_value():
    assert clean_missing_value("") is None
    assert clean_missing_value(" ") is None
    assert clean_missing_value("NA") is None
    assert clean_missing_value("N/A") is None
    assert clean_missing_value("null") is None
    assert clean_missing_value("None") is None
    assert clean_missing_value("-") is None
    assert clean_missing_value("unknown") is None
    assert clean_missing_value("SpiceJet") == "SpiceJet"
    assert clean_missing_value(123) == 123

def test_clean_price():
    assert clean_price("₹5,000") == 5000.0
    assert clean_price("₹ 5,000") == 5000.0
    assert clean_price("5,000") == 5000.0
    assert clean_price("5000") == 5000.0
    assert clean_price("INR 5,000") == 5000.0
    assert clean_price("5000.00") == 5000.0
    assert clean_price("-5000") == -5000.0  # Kept as float; Pydantic handles ge=0 validation
    assert clean_price("abc") is None
    assert clean_price("") is None

def test_clean_stops():
    assert clean_stops("non-stop") == 0
    assert clean_stops("Non Stop") == 0
    assert clean_stops("0") == 0
    assert clean_stops("zero stop") == 0
    assert clean_stops("one stop") == 1
    assert clean_stops("1 stop") == 1
    assert clean_stops("1") == 1
    assert clean_stops("two stops") == 2
    assert clean_stops("2 stops") == 2
    assert clean_stops("2") == 2
    assert clean_stops("3 stops") == 3
    assert clean_stops("unknown") is None

def test_clean_duration():
    # HH:MM format
    assert clean_duration("02:30") == 150.0
    assert clean_duration("2:30") == 150.0
    
    # Hours & Minutes text formats
    assert clean_duration("2h 30m") == 150.0
    assert clean_duration("2h") == 120.0
    assert clean_duration("150m") == 150.0
    assert clean_duration("2 hrs 30 mins") == 150.0
    assert clean_duration("2 hr") == 120.0
    
    # Decimal hours
    assert clean_duration(2.5) == 150.0
    assert clean_duration("2.5") == 150.0
    assert clean_duration(2.17) == 130.2
    
    # Raw minutes (values >= 24)
    assert clean_duration(150) == 150.0
    assert clean_duration("150") == 150.0
    
    # Invalid
    assert clean_duration("abc") is None
    assert clean_duration("") is None

def test_clean_date():
    expected = date(2026, 3, 24)
    assert clean_date("2026-03-24") == expected
    assert clean_date("24/03/2026") == expected
    assert clean_date("24-03-2026") == expected
    assert clean_date("24 Mar 2026") == expected
    assert clean_date("24 March 2026") == expected
    assert clean_date("Mar 24, 2026") == expected
    assert clean_date("24-Mar-26") == expected
    assert clean_date("24-03-26") == expected
    assert clean_date("24/03/26") == expected
    assert clean_date("invalid-date") is None
