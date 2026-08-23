import pandas as pd
from datetime import date
from data_pipeline.normalizer import normalize_and_validate_records

def test_normalize_and_validate_records_valid():
    # Valid dataframe with all core and optional columns
    df = pd.DataFrame([{
        "dataset_source": "test.csv",
        "source_row_number": 1,
        "airline": "Indigo",
        "price": "5,000",
        "origin": "Delhi",
        "destination": "Mumbai",
        "journey_date": "2026-03-24",
        "flight_number": "6E-502",
        "cabin_class": "Economy",
        "stops": "0",
        "duration_minutes": "150m",
        "advance_days": 10,
        "departure_time": "18:55",
        "arrival_time": "21:05",
        "advance_window": "T+7"
    }])
    
    accepted, rejected = normalize_and_validate_records(df)
    
    assert len(accepted) == 1
    assert len(rejected) == 0
    
    record = accepted.iloc[0]
    assert record["record_id"] is not None
    assert record["airline"] == "IndiGo"  # normalized
    assert record["price"] == 5000.0
    assert record["origin"] == "DEL"      # normalized
    assert record["destination"] == "BOM" # normalized
    assert record["route"] == "DEL-BOM"   # generated
    assert record["journey_date"] == date(2026, 3, 24)
    assert record["cabin_class"] == "ECONOMY"
    assert record["stops"] == 0
    assert record["duration_minutes"] == 150.0
    assert record["quality_status"] == "VALID"

def test_normalize_and_validate_records_warnings():
    # Missing optional fields (e.g. flight_number, stops, duration)
    df = pd.DataFrame([{
        "dataset_source": "test.csv",
        "source_row_number": 1,
        "airline": "Air India",
        "price": 6000,
        "origin": "BOM",
        "destination": "BLR",
        "journey_date": "2026-03-24",
        # no flight_number, stops, duration
    }])
    
    accepted, rejected = normalize_and_validate_records(df)
    
    assert len(accepted) == 1
    assert len(rejected) == 0
    
    record = accepted.iloc[0]
    assert record["quality_status"] == "VALID_WITH_WARNINGS"
    assert "Missing flight_number" in record["quality_notes"]
    assert "Missing stops" in record["quality_notes"]
    assert "Missing duration_minutes" in record["quality_notes"]

def test_normalize_and_validate_records_rejected():
    # Invalid dataset: missing price (required), invalid date, negative price
    df = pd.DataFrame([
        # Row 1: Missing price
        {
            "dataset_source": "test.csv",
            "source_row_number": 1,
            "airline": "Indigo",
            "origin": "DEL",
            "destination": "BOM",
            "journey_date": "2026-03-24",
            "price": None
        },
        # Row 2: Negative price
        {
            "dataset_source": "test.csv",
            "source_row_number": 2,
            "airline": "Indigo",
            "origin": "DEL",
            "destination": "BOM",
            "journey_date": "2026-03-24",
            "price": -100
        },
        # Row 3: Invalid airport
        {
            "dataset_source": "test.csv",
            "source_row_number": 3,
            "airline": "Indigo",
            "origin": "DELXXX",  # Invalid IATA code and not a known city
            "destination": "BOM",
            "journey_date": "2026-03-24",
            "price": 5000
        }
    ])
    
    accepted, rejected = normalize_and_validate_records(df)
    
    assert len(accepted) == 0
    assert len(rejected) == 3
    
    assert rejected.iloc[0]["source_row_number"] == 1
    assert "price" in rejected.iloc[0]["rejection_reason"]
    
    assert rejected.iloc[1]["source_row_number"] == 2
    assert "price" in rejected.iloc[1]["rejection_reason"]
    
    assert rejected.iloc[2]["source_row_number"] == 3
    assert "Route" in rejected.iloc[2]["rejection_reason"] or "origin" in rejected.iloc[2]["rejection_reason"]
