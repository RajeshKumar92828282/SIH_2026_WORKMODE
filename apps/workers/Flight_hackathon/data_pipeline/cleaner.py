import re
import math
import logging
from datetime import date, datetime
from typing import Any, Optional, Union
import numpy as np
import pandas as pd

from config.settings import MISSING_VALUE_MARKERS

logger = logging.getLogger(__name__)

def clean_missing_value(val: Any) -> Any:
    """
    Standardizes typical missing value representations to None.
    
    Args:
        val: Input value of any type.
        
    Returns:
        None if the value matches a missing marker, otherwise the cleaned value.
    """
    if val is None:
        return None
        
    # Check for pandas/numpy null types
    if pd.isna(val):
        return None
        
    if isinstance(val, str):
        cleaned = val.strip()
        if cleaned.lower() in MISSING_VALUE_MARKERS or not cleaned:
            return None
        return cleaned
        
    return val

def clean_price(val: Any) -> Optional[float]:
    """
    Cleans and converts price strings containing currency symbols, commas, etc., to float.
    
    Args:
        val: Price value as string or numeric.
        
    Returns:
        Float representation of price, or None if invalid or missing.
    """
    cleaned_val = clean_missing_value(val)
    if cleaned_val is None:
        return None
        
    if isinstance(cleaned_val, (int, float)):
        return float(cleaned_val)
        
    # Standardize string: remove currency symbols, commas, and extra spaces
    price_str = str(cleaned_val).strip()
    price_str = re.sub(r"[₹,]|INR|\s", "", price_str, flags=re.IGNORECASE)
    
    try:
        price_num = float(price_str)
        return price_num
    except ValueError:
        logger.warning("Failed to parse price string: '%s'", val)
        return None

def clean_stops(val: Any) -> Optional[int]:
    """
    Normalizes flight stops representations to an integer.
    
    Args:
        val: Stops representation (e.g. 'non-stop', '1 stop', '2 stops', 1, 'zero stop').
        
    Returns:
        Integer number of stops, or None if unknown/missing.
    """
    cleaned_val = clean_missing_value(val)
    if cleaned_val is None:
        return None
        
    if isinstance(cleaned_val, int):
        return cleaned_val
        
    if isinstance(cleaned_val, float):
        return int(cleaned_val)
        
    stops_str = str(cleaned_val).strip().lower()
    
    # Check common text mappings
    if stops_str in ("non-stop", "non stop", "0", "zero", "zero stop", "zero stops", "direct"):
        return 0
    elif stops_str in ("one stop", "1 stop", "1", "one"):
        return 1
    elif stops_str in ("two stops", "2 stops", "2", "two"):
        return 2
    
    # Try regex matching to extract digit
    match = re.search(r"(\d+)\s*stop", stops_str)
    if match:
        return int(match.group(1))
        
    # Fallback to direct digit conversion if possible
    try:
        return int(stops_str)
    except ValueError:
        logger.warning("Failed to normalize stops: '%s'", val)
        return None

def clean_duration(val: Any) -> Optional[float]:
    """
    Converts various duration formats (e.g. "2h 30m", "150m", "02:30", float hours)
    to duration in minutes.
    
    Args:
        val: Duration input.
        
    Returns:
        Duration in minutes (float/int) or None if ambiguous/missing.
    """
    cleaned_val = clean_missing_value(val)
    if cleaned_val is None:
        return None
        
    # If float/int, check if it represents hours or minutes
    if isinstance(cleaned_val, (int, float)):
        # E.g. 2.17 hours. If it's less than 24, we assume it's hours and convert.
        # Otherwise, assume it's already in minutes.
        val_float = float(cleaned_val)
        if val_float < 24:
            return round(val_float * 60.0, 2)
        return val_float
        
    dur_str = str(cleaned_val).strip()
    
    # Check if string is a raw number (e.g., "150" or "2.5")
    try:
        val_float = float(dur_str)
        if val_float < 24:
            return round(val_float * 60.0, 2)
        return val_float
    except ValueError:
        pass
        
    dur_str_lower = dur_str.lower()
    
    # Handle "HH:MM" format (e.g. "02:30" or "12:45")
    match_hm_colon = re.match(r"^(\d{1,2}):(\d{2})$", dur_str)
    if match_hm_colon:
        hours = int(match_hm_colon.group(1))
        minutes = int(match_hm_colon.group(2))
        return float(hours * 60 + minutes)
        
    # Parse formats like: "2h 30m", "2h", "150m", "2 hrs 30 mins", "2 hr"
    hours = 0.0
    minutes = 0.0
    found_any = False
    
    # Try parsing hours
    hours_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:h|hr|hour|hrs|hours)", dur_str_lower)
    if hours_match:
        hours = float(hours_match.group(1))
        found_any = True
        
    # Try parsing minutes
    minutes_match = re.search(r"(\d+)\s*(?:m|min|minute|mins|minutes)", dur_str_lower)
    if minutes_match:
        minutes = float(minutes_match.group(1))
        found_any = True
        
    if found_any:
        return float(hours * 60 + minutes)
        
    # If no match but has characters, it might be ambiguous
    logger.warning("Unrecognized duration format: '%s'", val)
    return None

def clean_date(val: Any) -> Optional[date]:
    """
    Parses dates in multiple common formats to datetime.date.
    
    Args:
        val: Raw date representation (string, datetime, or date object).
        
    Returns:
        date object, or None if parsing fails.
    """
    cleaned_val = clean_missing_value(val)
    if cleaned_val is None:
        return None
        
    if isinstance(cleaned_val, date):
        if isinstance(cleaned_val, datetime):
            return cleaned_val.date()
        return cleaned_val
        
    date_str = str(cleaned_val).strip()
    
    # Common date formats in Indian flight datasets
    formats = [
        "%Y-%m-%d",      # 2026-03-01
        "%d/%m/%Y",      # 01/03/2026
        "%d-%m-%Y",      # 01-03-2026
        "%Y/%m/%d",      # 2026/03/01
        "%d %b %Y",      # 01 Mar 2026
        "%d %B %Y",      # 01 March 2026
        "%b %d, %Y",     # Mar 01, 2026
        "%d-%b-%y",      # 01-Mar-26 or 1-Mar-26
        "%d-%m-%y",      # 01-03-26
        "%d/%m/%y",      # 01/03/26
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
            
    logger.warning("Failed to parse date string: '%s'", val)
    return None
