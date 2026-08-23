import logging
import hashlib
from typing import Tuple, List
import pandas as pd

logger = logging.getLogger(__name__)

# Key fields to determine duplicate flights
DEDUPLICATION_FIELDS = [
    "dataset_source",
    "journey_date",
    "origin",
    "destination",
    "airline",
    "flight_number",
    "departure_time",
    "cabin_class",
    "advance_days",
    "price"
]

def generate_record_hash(row: pd.Series, fields: List[str]) -> str:
    """
    Generates a deterministic SHA-256 hash for a record based on key fields.
    Useful for verification or explainable record tracking.
    """
    # Join key field values into a single string. Handle null values consistently.
    vals = [str(row.get(field)) if pd.notna(row.get(field)) else "NULL" for field in fields]
    joined_str = "|".join(vals)
    return hashlib.sha256(joined_str.encode("utf-8")).hexdigest()

def deduplicate_records(df: pd.DataFrame) -> Tuple[pd.DataFrame, int]:
    """
    Deduplicates a DataFrame based on standard flight attributes.
    Keeps the first occurrence and returns the cleaned DataFrame and the duplicate count.
    
    Args:
        df: Input DataFrame.
        
    Returns:
        Tuple of (deduplicated_dataframe, duplicate_count)
    """
    if df.empty:
        return df, 0
        
    initial_rows = len(df)
    
    # Intersect requested deduplication fields with columns present in the DataFrame
    subset = [col for col in DEDUPLICATION_FIELDS if col in df.columns]
    
    if not subset:
        logger.warning("No deduplication fields found in DataFrame columns. Skipping deduplication.")
        return df, 0
        
    logger.info("Deduplicating records using fields: %s", subset)
    
    # Drop duplicates keeping the first occurrence
    # Using keep='first' satisfies "keep the first valid occurrence"
    deduped_df = df.drop_duplicates(subset=subset, keep="first").copy()
    duplicates_removed = initial_rows - len(deduped_df)
    
    # Generate record hash internally for validation
    deduped_df["record_hash"] = deduped_df.apply(
        lambda r: generate_record_hash(r, subset), axis=1
    )
    
    logger.info("Deduplication complete. Removed %d duplicate rows.", duplicates_removed)
    return deduped_df, duplicates_removed
