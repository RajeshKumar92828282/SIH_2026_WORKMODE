import logging
import hashlib
from datetime import datetime, timezone
from typing import Tuple, List, Dict, Any
import pandas as pd
from pydantic import ValidationError

from schemas.airfare import AirfareObservation
from data_pipeline.cleaner import (
    clean_missing_value,
    clean_price,
    clean_stops,
    clean_duration,
    clean_date
)

logger = logging.getLogger(__name__)

# List of optional fields to check for warnings if they are missing
OPTIONAL_FIELDS_FOR_WARNING = [
    "flight_number",
    "departure_time",
    "arrival_time",
    "stops",
    "duration_minutes",
    "advance_days",
    "advance_window",
]

def generate_deterministic_id(source: str, row_num: int) -> str:
    """
    Generates a unique, deterministic ID for a record.
    """
    token = f"{source}_{row_num}"
    return hashlib.sha256(token.encode("utf-8")).hexdigest()[:16]

def normalize_row(row: dict) -> Dict[str, Any]:
    """
    Cleans individual fields of a row before passing to the validator.
    """
    cleaned: Dict[str, Any] = {}
    
    # 1. Source and metadata
    cleaned["dataset_source"] = str(row.get("dataset_source", "UNKNOWN"))
    cleaned["source_row_number"] = int(row.get("source_row_number", 0))
    cleaned["record_id"] = generate_deterministic_id(
        cleaned["dataset_source"], cleaned["source_row_number"]
    )
    
    for field in ["origin", "destination", "route", "airline", "flight_number", 
                  "cabin_class", "departure_time", "arrival_time", "advance_window", "quality_notes"]:
        val = row.get(field)
        cleaned_val = clean_missing_value(val)
        if cleaned_val is not None and not isinstance(cleaned_val, str):
            cleaned_val = str(cleaned_val)
        cleaned[field] = cleaned_val
        
    # 3. Date fields
    cleaned["observation_date"] = clean_date(row.get("observation_date"))
    cleaned["journey_date"] = clean_date(row.get("journey_date"))
    
    # 4. Numeric fields
    cleaned["stops"] = clean_stops(row.get("stops"))
    cleaned["duration_minutes"] = clean_duration(row.get("duration_minutes"))
    cleaned["advance_days"] = row.get("advance_days")
    if cleaned["advance_days"] is not None:
        try:
            cleaned["advance_days"] = int(float(cleaned["advance_days"]))
        except (ValueError, TypeError):
            cleaned["advance_days"] = None
            
    # 5. Price fields
    cleaned["price"] = clean_price(row.get("price"))
    cleaned["base_fare"] = clean_price(row.get("base_fare"))
    cleaned["taxes"] = clean_price(row.get("taxes"))
    cleaned["fees"] = clean_price(row.get("fees"))
    cleaned["total_fare"] = clean_price(row.get("total_fare"))
    
    # Keep is_outlier if already flagged (usually false at this stage)
    cleaned["is_outlier"] = bool(row.get("is_outlier", False))
    
    # Timestamp
    cleaned["created_at"] = datetime.now(timezone.utc).replace(tzinfo=None)
    
    return cleaned

def normalize_and_validate_records(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Iterates through rows, cleans and validates using Pydantic schema, and splits into accepted and rejected dfs.
    
    Args:
        df: Input DataFrame with mapped columns.
        
    Returns:
        Tuple of (accepted_dataframe, rejected_dataframe)
    """
    accepted_records: List[Dict[str, Any]] = []
    rejected_records: List[Dict[str, Any]] = []
    
    if df.empty:
        return pd.DataFrame(), pd.DataFrame()
        
    logger.info("Starting normalization and validation for %d rows...", len(df))
    
    for raw_row in df.to_dict('records'):
        # Clean the row fields first
        row_dict = normalize_row(raw_row)
        
        try:
            # Run Pydantic validation
            obs = AirfareObservation(**row_dict)
            
            # Post-validation checks: determine if VALID or VALID_WITH_WARNINGS
            warnings = []
            
            # Check if core query fields are missing (e.g. airline, route)
            # Route and dates are important
            if not obs.origin or not obs.destination or not obs.journey_date or not obs.airline:
                warnings.append("Missing core fields (origin/destination/journey_date/airline)")
                
            # Check other optional fields
            for opt_field in OPTIONAL_FIELDS_FOR_WARNING:
                val = getattr(obs, opt_field, None)
                if val is None or val == "UNKNOWN":
                    warnings.append(f"Missing {opt_field}")
                    
            validated_dict = obs.model_dump()
            
            if warnings:
                validated_dict["quality_status"] = "VALID_WITH_WARNINGS"
                note = "; ".join(warnings)
                validated_dict["quality_notes"] = (
                    f"{validated_dict['quality_notes']}; {note}" 
                    if validated_dict.get("quality_notes") 
                    else note
                )
            else:
                validated_dict["quality_status"] = "VALID"
                
            accepted_records.append(validated_dict)
            
        except ValidationError as ve:
            # Capture rejection details
            rejection_reason = "; ".join([f"{'.'.join(str(loc) for loc in err['loc'])}: {err['msg']}" for err in ve.errors()])
            
            # Build a rejected record dictionary
            rejected_item = {
                "dataset_source": row_dict["dataset_source"],
                "source_row_number": row_dict["source_row_number"],
                "rejection_reason": rejection_reason,
                "record_id": row_dict["record_id"],
                "quality_status": "REJECTED",
                # Include raw fields for debugging
                "raw_price": raw_row.get("price"),
                "raw_origin": raw_row.get("origin"),
                "raw_destination": raw_row.get("destination"),
                "raw_journey_date": raw_row.get("journey_date"),
                "raw_airline": raw_row.get("airline"),
                "raw_flight_number": raw_row.get("flight_number")
            }
            rejected_records.append(rejected_item)
            
        except Exception as e:
            # Capture any other unexpected errors during row processing
            rejected_item = {
                "dataset_source": row_dict.get("dataset_source", "UNKNOWN"),
                "source_row_number": row_dict.get("source_row_number", 0),
                "rejection_reason": f"Unexpected error: {str(e)}",
                "record_id": row_dict.get("record_id", ""),
                "quality_status": "REJECTED",
                "raw_price": raw_row.get("price")
            }
            rejected_records.append(rejected_item)
            
    # Convert lists to DataFrames
    accepted_df = pd.DataFrame(accepted_records)
    rejected_df = pd.DataFrame(rejected_records)
    
    logger.info(
        "Validation complete. Accepted: %d, Rejected: %d", 
        len(accepted_df), len(rejected_df)
    )
    
    return accepted_df, rejected_df
