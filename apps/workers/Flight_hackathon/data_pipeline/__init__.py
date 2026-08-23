import json
import logging
from datetime import datetime, timezone
from typing import Tuple, Dict, Any, List
import pandas as pd

from config.settings import (
    CLEANED_OUTPUT_PATH,
    REJECTED_OUTPUT_PATH,
    PIPELINE_REPORT_PATH,
    LOG_LEVEL,
    LOG_FORMAT
)

# Configure logging
logging.basicConfig(level=LOG_LEVEL, format=LOG_FORMAT)
logger = logging.getLogger(__name__)

from data_pipeline.dataset_loader import discover_datasets
from data_pipeline.kaggle_loader import load_kaggle_dataset
from data_pipeline.advance_window import process_advance_booking
from data_pipeline.normalizer import normalize_and_validate_records
from data_pipeline.deduplicator import deduplicate_records
from data_pipeline.outlier_detection import detect_outliers

# Canonical list of output columns in correct order as requested by integration contract
CANONICAL_OUTPUT_COLUMNS = [
    "record_id",
    "dataset_source",
    "observation_date",
    "journey_date",
    "origin",
    "destination",
    "route",
    "airline",
    "flight_number",
    "cabin_class",
    "departure_time",
    "arrival_time",
    "stops",
    "duration_minutes",
    "advance_days",
    "advance_window",
    "base_fare",
    "taxes",
    "fees",
    "total_fare",
    "price",
    "is_outlier",
    "quality_status",
    "quality_notes",
    "source_row_number",
    "created_at"
]

def run_etl_pipeline() -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """
    Executes the end-to-end ETL dataset pipeline.
    
    Returns:
        Tuple of (cleaned_observations_df, rejected_records_df, pipeline_report_dict)
    """
    start_time = datetime.now(timezone.utc).replace(tzinfo=None)
    logger.info("Initializing APIx Airfare ETL Pipeline run...")
    
    # 1. Discover datasets
    discovered_files = discover_datasets()
    
    all_accepted: List[pd.DataFrame] = []
    all_rejected: List[pd.DataFrame] = []
    
    dataset_stats: Dict[str, Dict[str, Any]] = {}
    total_rows_loaded = 0
    
    # Process each discovered file
    for filepath in discovered_files:
        try:
            logger.info("Processing dataset: %s", filepath.name)
            
            # 2. Load dataset with appropriate mappings & custom transformations
            df_raw, load_report = load_kaggle_dataset(filepath)
            rows_loaded = len(df_raw)
            total_rows_loaded += rows_loaded
            
            # 3. Calculate advance days and booking windows where possible
            df_with_booking = process_advance_booking(df_raw)
            
            # 4. Clean, normalize canonical fields and validate using Pydantic
            df_accepted, df_rejected = normalize_and_validate_records(df_with_booking)
            
            if not df_accepted.empty:
                all_accepted.append(df_accepted)
            if not df_rejected.empty:
                all_rejected.append(df_rejected)
                
            dataset_stats[filepath.name] = {
                "rows_loaded": rows_loaded,
                "accepted_before_deduplication": len(df_accepted),
                "rejected": len(df_rejected),
                "mapped_columns": load_report.get("mapped_columns", []),
                "unmapped_columns": load_report.get("unmapped_columns", [])
            }
            
        except Exception as e:
            logger.exception("Skipping dataset '%s' due to critical load error.", filepath.name)
            dataset_stats[filepath.name] = {
                "rows_loaded": 0,
                "accepted_before_deduplication": 0,
                "rejected": 0,
                "error": str(e)
            }
            
    # Concatenate all datasets
    if all_accepted:
        df_accepted_merged = pd.concat(all_accepted, ignore_index=True)
    else:
        df_accepted_merged = pd.DataFrame(columns=CANONICAL_OUTPUT_COLUMNS)
        
    if all_rejected:
        df_rejected_merged = pd.concat(all_rejected, ignore_index=True)
    else:
        df_rejected_merged = pd.DataFrame(columns=["dataset_source", "source_row_number", "rejection_reason"])
        
    # 5. Deduplicate across all accepted observations
    duplicates_removed = 0
    if not df_accepted_merged.empty:
        df_accepted_merged, duplicates_removed = deduplicate_records(df_accepted_merged)
        
    # 6. Run subgroup-based outlier detection on deduplicated accepted records
    outliers_flagged = 0
    if not df_accepted_merged.empty:
        df_accepted_merged, outliers_flagged = detect_outliers(df_accepted_merged)
        
    # Ensure all canonical output columns exist in correct order
    # Fill missing columns with None
    for col in CANONICAL_OUTPUT_COLUMNS:
        if col not in df_accepted_merged.columns:
            df_accepted_merged[col] = None
            
    # Format and select columns
    final_accepted = df_accepted_merged[CANONICAL_OUTPUT_COLUMNS].copy()
    
    # 7. Write accepted, rejected, and report outputs (ensure directory exists)
    CLEANED_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    logger.info("Writing cleaned observations to %s", CLEANED_OUTPUT_PATH)
    final_accepted.to_csv(CLEANED_OUTPUT_PATH, index=False)
    
    logger.info("Writing rejected records to %s", REJECTED_OUTPUT_PATH)
    df_rejected_merged.to_csv(REJECTED_OUTPUT_PATH, index=False)
    
    end_time = datetime.now(timezone.utc).replace(tzinfo=None)
    duration_secs = (end_time - start_time).total_seconds()
    
    pipeline_report = {
        "pipeline_run_timestamp": start_time.isoformat() + "Z",
        "duration_seconds": duration_secs,
        "datasets_processed": len(discovered_files),
        "total_rows_loaded": total_rows_loaded,
        "duplicates_removed": duplicates_removed,
        "outliers_flagged": outliers_flagged,
        "accepted_records": len(final_accepted),
        "rejected_records": len(df_rejected_merged),
        "dataset_statistics": dataset_stats
    }
    
    logger.info("Writing pipeline report to %s", PIPELINE_REPORT_PATH)
    with open(PIPELINE_REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(pipeline_report, f, indent=2)
        
    logger.info(
        "ETL Pipeline run finished. Accepted: %d, Rejected: %d, Outliers: %d",
        len(final_accepted), len(df_rejected_merged), outliers_flagged
    )
    
    return final_accepted, df_rejected_merged, pipeline_report
