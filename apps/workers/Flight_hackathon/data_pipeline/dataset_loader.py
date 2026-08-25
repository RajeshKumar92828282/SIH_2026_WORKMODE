import logging
import re
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
import pandas as pd

from config.settings import CSV_ENCODINGS, RAW_DATA_DIR, HISTORICAL_DATA_DIR, PROJECT_ROOT

logger = logging.getLogger(__name__)

# Standard canonical column mappings
COLUMN_ALIASES: Dict[str, List[str]] = {
    "price": ["price", "ticket_price", "fare", "total_fare", "base_fare", "amount"],
    "origin": ["origin", "source", "from", "source_city", "origin_city", "from_city", "dep_airport", "departure_airport"],
    "destination": ["destination", "to", "destination_city", "to_city", "arr_airport", "arrival_airport"],
    "airline": ["airline", "carrier", "airline_name", "airline_code", "operator", "flight_name"],
    "flight_number": ["flight", "flight_number", "flight_no", "flight_code", "num_code", "flight_id"],
    "journey_date": ["journey_date", "date_of_journey", "date", "flight_date", "travel_date", "dep_date", "departure_date"],
    "observation_date": ["observation_date", "date_of_observation", "obs_date", "booking_date", "date_of_booking", "search_date"],
    "cabin_class": ["cabin_class", "class", "travel_class", "cabin", "seat_class", "flight_class"],
    "departure_time": ["departure_time", "dep_time", "departure", "deptime", "flight_time"],
    "arrival_time": ["arrival_time", "arr_time", "arrival", "arrtime"],
    "stops": ["stops", "total_stops", "stop", "number_of_stops", "no_of_stops"],
    "duration_minutes": ["duration", "duration_minutes", "duration_mins", "time_taken", "flight_duration", "duration_hours"],
    "advance_days": ["advance_days", "days_left", "days_to_departure", "booking_window_days", "lead_time"],
    "route": ["route", "flight_route", "routes"],
}

def discover_datasets() -> List[Path]:
    """
    Scans PROJECT_ROOT (non-recursively) and RAW_DATA_DIR / HISTORICAL_DATA_DIR for CSV files.
    Returns a sorted list of unique file Paths for reproducibility.
    """
    csv_files: List[Path] = []
    
    # 1. Scan PROJECT_ROOT (non-recursively)
    if PROJECT_ROOT.exists() and PROJECT_ROOT.is_dir():
        root_csvs = list(PROJECT_ROOT.glob("*.csv"))
        csv_files.extend(root_csvs)
        
    # 2. Scan configure directories
    for directory in [RAW_DATA_DIR, HISTORICAL_DATA_DIR]:
        if directory.exists() and directory.is_dir():
            found_files = list(directory.glob("**/*.csv"))
            csv_files.extend(found_files)
            
    # Ensure uniqueness of paths
    unique_paths = list(set(csv_files))
    
    # Filter out output files to avoid re-ingestion loop
    ignored_filenames = {"cleaned_observations.csv", "rejected_records.csv"}
    unique_paths = [p for p in unique_paths if p.name not in ignored_filenames]
    
    # Sort files by name/path to maintain deterministic processing order
    unique_paths.sort(key=lambda p: p.name)
    logger.info("Discovered %d CSV datasets: %s", len(unique_paths), [f.name for f in unique_paths])
    return unique_paths

def normalize_column_name(col_name: str) -> str:
    """
    Normalizes raw column header names to standard format: lowercase, alphanumeric and underscores.
    """
    if not isinstance(col_name, str):
        col_name = str(col_name)
        
    cleaned = col_name.strip().lower()
    # Replace spaces, hyphens, and dots with underscores
    cleaned = re.sub(r"[\s\-\.]+", "_", cleaned)
    # Remove all non-alphanumeric/underscore characters
    cleaned = re.sub(r"[^a-z0-9_]", "", cleaned)
    # Collapse multiple underscores
    cleaned = re.sub(r"_+", "_", cleaned)
    return cleaned.strip("_")

def detect_and_load_csv(filepath: Path) -> pd.DataFrame:
    """
    Loads a CSV file trying multiple encodings. Raises exception if all fail.
    
    Args:
        filepath: Path of the CSV file.
        
    Returns:
        Loaded pandas DataFrame.
    """
    if not filepath.exists():
        raise FileNotFoundError(f"File not found: {filepath}")
        
    last_error: Optional[Exception] = None
    for encoding in CSV_ENCODINGS:
        try:
            logger.info("Attempting to load %s with encoding '%s'", filepath.name, encoding)
            df = pd.read_csv(filepath, encoding=encoding)
            logger.info("Successfully loaded %s (%d rows)", filepath.name, len(df))
            return df
        except (UnicodeDecodeError, LookupError) as e:
            last_error = e
            continue
            
    # If all configured encodings fail, raise the last encountered error
    logger.error("Failed to load %s with any configured encoding.", filepath.name)
    raise last_error or RuntimeError(f"Could not read CSV file {filepath}")

def map_dataframe_columns(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Maps DataFrame columns to canonical schema headers based on aliases.
    
    Args:
        df: Input pandas DataFrame.
        
    Returns:
        Tuple of (renamed_dataframe, mapping_statistics_dictionary)
    """
    raw_columns = list(df.columns)
    normalized_cols = {col: normalize_column_name(col) for col in raw_columns}
    
    rename_mapping: Dict[str, str] = {}
    mapped_canonical: List[str] = []
    unmapped_raw: List[str] = []
    
    # Identify mappings based on normalized aliases
    for raw_col, norm_col in normalized_cols.items():
        matched = False
        for canonical, aliases in COLUMN_ALIASES.items():
            # Check for matches in canonical or its aliases list
            if norm_col == canonical or norm_col in [normalize_column_name(a) for a in aliases]:
                if canonical not in rename_mapping.values():  # Avoid duplicate mapping
                    rename_mapping[raw_col] = canonical
                    mapped_canonical.append(canonical)
                    matched = True
                    break
        if not matched:
            unmapped_raw.append(raw_col)
            
    # Rename DataFrame columns
    renamed_df = df.rename(columns=rename_mapping)
    
    mapping_stats = {
        "detected_columns": raw_columns,
        "mapped_columns": rename_mapping,
        "unmapped_columns": unmapped_raw
    }
    
    return renamed_df, mapping_stats

def load_dataset(filepath: Path) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Loads a dataset from CSV, injects source metadata, and normalizes columns.
    
    Args:
        filepath: Path to the dataset CSV file.
        
    Returns:
        Tuple of (canonical_mapped_dataframe, load_report_dict)
    """
    df = detect_and_load_csv(filepath)
    total_rows = len(df)
    
    # Normalize and map columns
    mapped_df, mapping_stats = map_dataframe_columns(df)
    
    # Inject dataset provenance metadata
    mapped_df["dataset_source"] = filepath.name
    # 1-indexed source row number
    mapped_df["source_row_number"] = range(1, total_rows + 1)
    
    report = {
        "file_name": filepath.name,
        "total_rows_loaded": total_rows,
        "detected_columns": mapping_stats["detected_columns"],
        "mapped_columns": list(mapping_stats["mapped_columns"].values()),
        "unmapped_columns": mapping_stats["unmapped_columns"],
        "status": "SUCCESS"
    }
    
    return mapped_df, report
