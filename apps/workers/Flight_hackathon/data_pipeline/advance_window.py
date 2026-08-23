import logging
from datetime import date
from typing import Optional, Union
import pandas as pd

from config.settings import ADVANCE_WINDOW_RANGES

logger = logging.getLogger(__name__)

def calculate_advance_days(obs_date: Optional[date], jrny_date: Optional[date]) -> Optional[int]:
    """
    Calculates the advance days between the booking/observation date and the journey date.
    
    Args:
        obs_date: Date the price was observed/booked.
        jrny_date: Date of the journey.
        
    Returns:
        Integer number of days, or None if either date is missing.
    """
    if obs_date is None or jrny_date is None:
        return None
        
    delta = jrny_date - obs_date
    days = delta.days
    
    if days < 0:
        logger.warning(
            "Negative booking window detected: journey_date (%s) is before observation_date (%s)",
            jrny_date, obs_date
        )
        # We still return the negative number. It will fail Pydantic validation if it's invalid,
        # which is correct, or we can let the validator catch it.
        
    return days

def assign_advance_window_bucket(days: Optional[Union[int, float]]) -> Optional[str]:
    """
    Maps the advance days to one of the configured window buckets (e.g. T+1, T+7, etc.).
    
    Args:
        days: The number of advance booking days.
        
    Returns:
        Standardized bucket string (e.g., 'T+1', 'T+7'), or None if days is missing/negative.
    """
    if days is None or pd.isna(days):
        return None
        
    days_val = int(days)
    if days_val < 0:
        return None  # Negative days don't belong to advance booking buckets
        
    for min_d, max_d, bucket in ADVANCE_WINDOW_RANGES:
        if min_d <= days_val <= max_d:
            return bucket
            
    return None

def process_advance_booking(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculates advance_days and advance_window for a pandas DataFrame if the necessary columns are present.
    If advance_days already exists, it is preserved and used to fill advance_window if missing.
    
    Args:
        df: Input DataFrame.
        
    Returns:
        DataFrame with calculated/assigned advance days and windows.
    """
    df = df.copy()
    
    # Initialize target columns if not present
    if "advance_days" not in df.columns:
        df["advance_days"] = None
    if "advance_window" not in df.columns:
        df["advance_window"] = None
        
    # Cast existing advance_days to numeric
    if not df["advance_days"].isna().all():
        df["advance_days"] = pd.to_numeric(df["advance_days"], errors="coerce")
        
    for idx, row in df.iterrows():
        obs_d = row.get("observation_date")
        jrny_d = row.get("journey_date")
        adv_d = row.get("advance_days")
        adv_w = row.get("advance_window")
        
        # Scenario A: We can calculate advance_days from observation and journey dates
        if pd.notna(obs_d) and pd.notna(jrny_d):
            calculated_days = calculate_advance_days(obs_d, jrny_d)
            if calculated_days is not None:
                df.at[idx, "advance_days"] = calculated_days
                df.at[idx, "advance_window"] = assign_advance_window_bucket(calculated_days)
                continue
                
        # Scenario B: observation/journey date is missing, but advance_days is already present
        if pd.notna(adv_d):
            df.at[idx, "advance_window"] = assign_advance_window_bucket(adv_d)
            
    return df
