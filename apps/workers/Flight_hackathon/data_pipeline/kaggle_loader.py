import logging
from pathlib import Path
from typing import Tuple, Dict, Any
import pandas as pd

from data_pipeline.dataset_loader import load_dataset

logger = logging.getLogger(__name__)

def load_kaggle_dataset(filepath: Path) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Loads and preprocesses Kaggle datasets, addressing specific formatting quirks
    (such as combining airline codes, assigning implicit classes, etc.).
    
    Args:
        filepath: Path to the CSV file.
        
    Returns:
        Tuple of (preprocessed_dataframe, load_report_dict)
    """
    # 1. Use the base dataset loader to read and perform initial column mapping
    df, report = load_dataset(filepath)
    file_name = filepath.name.lower()
    
    # 2. Specific handling for economy.csv and business.csv
    if "economy" in file_name or "business" in file_name:
        logger.info("Applying Kaggle raw economy/business transformations to %s", filepath.name)
        
        # Determine class from filename if class column is missing
        if "cabin_class" not in df.columns or df["cabin_class"].isna().all():
            inferred_class = "ECONOMY" if "economy" in file_name else "BUSINESS"
            df["cabin_class"] = inferred_class
            logger.info("Inferred cabin_class '%s' from filename.", inferred_class)
            
        # Combine ch_code and num_code into flight_number if they exist in the raw df
        # (even if they were not mapped to canonical fields, they might be in the DataFrame)
        ch_cols = [c for c in df.columns if str(c).strip().lower() in ("ch_code", "chcode", "carrier_code")]
        num_cols = [c for c in df.columns if str(c).strip().lower() in ("num_code", "numcode", "flight_num", "flight_number")]
        
        if ch_cols and num_cols:
            ch_col = ch_cols[0]
            num_col = num_cols[0]
            
            # Combine safely handling nulls, adding space separator
            combined = df[ch_col].fillna("").astype(str).str.strip() + " " + df[num_col].fillna("").astype(str).str.strip()
            df["flight_number"] = combined.str.strip().replace("", None)
            logger.info("Combined '%s' and '%s' columns into 'flight_number'", ch_col, num_col)
            
    elif "data_train" in file_name:
        logger.info("Applying Kaggle Data_Train transformations to %s", filepath.name)
        # Often Data_Train.csv does not have a cabin_class column, but it contains mostly economy class.
        # We can map its cabin class or let it be UNKNOWN (which is safer as we don't invent data).
        # We'll let the cleaner/normalizer parse it, but if it has no class column, we can default to UNKNOWN.
        if "cabin_class" not in df.columns:
            df["cabin_class"] = "UNKNOWN"
            
    elif "clean_dataset" in file_name:
        logger.info("Applying Kaggle Clean_Dataset transformations to %s", filepath.name)
        # Clean_Dataset.csv uses days_left for advance booking days.
        # This is already mapped to advance_days in COLUMN_ALIASES.
        pass
        
    return df, report
