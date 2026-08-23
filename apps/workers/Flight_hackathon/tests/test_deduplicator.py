import pandas as pd
from data_pipeline.deduplicator import deduplicate_records

def test_deduplicate_records():
    df = pd.DataFrame([
        # Row 1: Original flight
        {
            "dataset_source": "test.csv",
            "journey_date": "2026-03-24",
            "origin": "DEL",
            "destination": "BOM",
            "airline": "Indigo",
            "flight_number": "6E-502",
            "departure_time": "18:55",
            "cabin_class": "ECONOMY",
            "advance_days": 10,
            "price": 5000.0,
            "extra_field": "first_item"
        },
        # Row 2: Exact duplicate of Row 1 (different extra_field)
        {
            "dataset_source": "test.csv",
            "journey_date": "2026-03-24",
            "origin": "DEL",
            "destination": "BOM",
            "airline": "Indigo",
            "flight_number": "6E-502",
            "departure_time": "18:55",
            "cabin_class": "ECONOMY",
            "advance_days": 10,
            "price": 5000.0,
            "extra_field": "second_item"
        },
        # Row 3: Legitimate flight with same price but different flight_number
        {
            "dataset_source": "test.csv",
            "journey_date": "2026-03-24",
            "origin": "DEL",
            "destination": "BOM",
            "airline": "Indigo",
            "flight_number": "6E-999",  # different flight_number
            "departure_time": "18:55",
            "cabin_class": "ECONOMY",
            "advance_days": 10,
            "price": 5000.0,
            "extra_field": "different_flight"
        },
        # Row 4: Legitimate flight with same price but different route
        {
            "dataset_source": "test.csv",
            "journey_date": "2026-03-24",
            "origin": "DEL",
            "destination": "BLR",      # different destination
            "airline": "Indigo",
            "flight_number": "6E-502",
            "departure_time": "18:55",
            "cabin_class": "ECONOMY",
            "advance_days": 10,
            "price": 5000.0,
            "extra_field": "different_route"
        }
    ])
    
    deduped_df, removed_count = deduplicate_records(df)
    
    # 4 initial records, 1 duplicate removed -> 3 remaining
    assert len(deduped_df) == 3
    assert removed_count == 1
    
    # Verify we kept the first occurrence (extra_field = "first_item")
    match_row = deduped_df[deduped_df["flight_number"] == "6E-502"]
    assert len(match_row) == 2  # UK-502 to BOM and UK-502 to BLR
    
    first_flight_to_bom = match_row[match_row["destination"] == "BOM"]
    assert len(first_flight_to_bom) == 1
    assert first_flight_to_bom.iloc[0]["extra_field"] == "first_item"
    
    # Verify record_hash was generated
    assert "record_hash" in deduped_df.columns
