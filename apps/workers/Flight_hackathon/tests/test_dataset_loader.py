from pathlib import Path
import pandas as pd
import pytest

from data_pipeline.dataset_loader import (
    normalize_column_name,
    map_dataframe_columns,
    load_dataset,
    detect_and_load_csv
)

def test_normalize_column_name():
    assert normalize_column_name("Airline Name") == "airline_name"
    assert normalize_column_name("airline_name") == "airline_name"
    assert normalize_column_name("  Airline-Name ") == "airline_name"
    assert normalize_column_name("Class") == "class"
    assert normalize_column_name("date_of_journey") == "date_of_journey"
    assert normalize_column_name("Dep.Time") == "dep_time"
    assert normalize_column_name("flight-no__code") == "flight_no_code"

def test_map_dataframe_columns():
    df_raw = pd.DataFrame(columns=[
        "Airline Name", "ticket_price", "Source City", "class", "Date of Journey"
    ])
    mapped_df, mapping_stats = map_dataframe_columns(df_raw)
    
    # Expected mappings based on COLUMN_ALIASES
    expected_cols = ["airline", "price", "origin", "cabin_class", "journey_date"]
    assert list(mapped_df.columns) == expected_cols
    assert mapping_stats["unmapped_columns"] == []
    
    # Test with unrecognized columns
    df_unrecognized = pd.DataFrame(columns=["some_random_column", "Price"])
    mapped_df2, mapping_stats2 = map_dataframe_columns(df_unrecognized)
    assert "price" in mapped_df2.columns
    assert "some_random_column" in mapped_df2.columns
    assert "some_random_column" in mapping_stats2["unmapped_columns"]

def test_load_dataset_with_temp_csv(tmp_path):
    csv_file = tmp_path / "test_flight_data.csv"
    df_data = pd.DataFrame({
        "Airline": ["Indigo", "SpiceJet"],
        "price": [5000, 6000],
        "Source": ["Delhi", "Mumbai"]
    })
    df_data.to_csv(csv_file, index=False)
    
    mapped_df, report = load_dataset(csv_file)
    
    assert report["file_name"] == "test_flight_data.csv"
    assert report["total_rows_loaded"] == 2
    assert "airline" in mapped_df.columns
    assert "price" in mapped_df.columns
    assert "origin" in mapped_df.columns
    assert "dataset_source" in mapped_df.columns
    assert "source_row_number" in mapped_df.columns
    assert list(mapped_df["dataset_source"]) == ["test_flight_data.csv", "test_flight_data.csv"]
    assert list(mapped_df["source_row_number"]) == [1, 2]

def test_detect_and_load_csv_missing_file():
    with pytest.raises(FileNotFoundError):
        detect_and_load_csv(Path("non_existent_file.csv"))
