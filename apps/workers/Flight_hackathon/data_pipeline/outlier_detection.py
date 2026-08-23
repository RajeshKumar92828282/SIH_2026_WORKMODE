import logging
from typing import Tuple, List
import pandas as pd
import numpy as np

from config.settings import IQR_MULTIPLIER, MIN_GROUP_SIZE

logger = logging.getLogger(__name__)

# Outlier grouping hierarchy
HIERARCHY = [
    ["route", "cabin_class", "advance_window"],
    ["route", "advance_window"],
    ["route"],
    []  # Global fallback
]

def detect_outliers(df: pd.DataFrame) -> Tuple[pd.DataFrame, int]:
    """
    Detects price outliers using a subgroup-based IQR method.
    Groups flights by a hierarchy of categories and flags anomalies where price is 
    outside [Q1 - 1.5 * IQR, Q3 + 1.5 * IQR].
    
    Args:
        df: Cleaned and normalized DataFrame.
        
    Returns:
        Tuple of (df_with_is_outlier_flag, outlier_count)
    """
    if df.empty:
        return df, 0
        
    df = df.copy()
    
    # Initialize output columns if not present
    df["is_outlier"] = False
    
    # We only run outlier detection on rows with valid non-null prices
    valid_price_mask = df["price"].notna() & (df["price"] >= 0)
    if not valid_price_mask.any():
        logger.info("No records with valid prices for outlier detection.")
        return df, 0
        
    # Track which rows have been evaluated
    evaluated_mask = ~valid_price_mask
    
    # Iterate through the hierarchy
    for level_idx, group_cols in enumerate(HIERARCHY):
        # Find which rows still need evaluation
        remaining_mask = ~evaluated_mask
        if not remaining_mask.any():
            break
            
        logger.info(
            "Outlier detection level %d: Grouping by %s (Remaining rows to evaluate: %d)",
            level_idx + 1, group_cols or "Global", remaining_mask.sum()
        )
        
        # If group columns are specified, verify they exist in DataFrame
        cols_to_use = [col for col in group_cols if col in df.columns]
        
        # If we are grouping by columns, check if we have missing values in grouping keys
        # We only group rows where grouping keys are not null
        if cols_to_use:
            valid_keys_mask = df[cols_to_use].notna().all(axis=1)
        else:
            valid_keys_mask = pd.Series(True, index=df.index)
            
        # Grouping context (subset of dataframe where keys are valid and price is valid)
        grouping_df = df[valid_keys_mask & valid_price_mask]
        
        if grouping_df.empty:
            continue
            
        if cols_to_use:
            # Group by specified keys and compute size, Q1, Q3
            grouped = grouping_df.groupby(cols_to_use)["price"]
            group_stats = grouped.agg(size="count")
            group_stats["q1"] = grouped.quantile(0.25)
            group_stats["q3"] = grouped.quantile(0.75)
            
            # Filter groups that meet minimum size
            valid_groups = group_stats[group_stats["size"] >= MIN_GROUP_SIZE].copy()
            if valid_groups.empty:
                continue
                
            # Calculate bounds
            valid_groups["iqr"] = valid_groups["q3"] - valid_groups["q1"]
            valid_groups["lower_bound"] = valid_groups["q1"] - (IQR_MULTIPLIER * valid_groups["iqr"])
            valid_groups["upper_bound"] = valid_groups["q3"] + (IQR_MULTIPLIER * valid_groups["iqr"])
            
            # Map back to main DataFrame
            # Join stats back to df
            merged = df.merge(
                valid_groups[["lower_bound", "upper_bound"]],
                left_on=cols_to_use,
                right_index=True,
                how="left"
            )
            
            # Identify rows belonging to valid groups that haven't been evaluated
            applicable_mask = (
                merged["lower_bound"].notna() & 
                merged["upper_bound"].notna() & 
                remaining_mask & 
                valid_keys_mask
            )
            
            if applicable_mask.any():
                # Flag outliers
                is_outlier_val = (df.loc[applicable_mask, "price"] < merged.loc[applicable_mask, "lower_bound"]) | \
                                 (df.loc[applicable_mask, "price"] > merged.loc[applicable_mask, "upper_bound"])
                df.loc[applicable_mask, "is_outlier"] = is_outlier_val
                evaluated_mask = evaluated_mask | applicable_mask
                
                logger.info(
                    "Level %d matched %d records. Flagged %d outliers.",
                    level_idx + 1, applicable_mask.sum(), is_outlier_val.sum()
                )
                
        else:
            # Global fallback
            global_prices = df.loc[valid_price_mask, "price"]
            global_size = len(global_prices)
            
            if global_size >= MIN_GROUP_SIZE:
                q1 = np.percentile(global_prices, 25)
                q3 = np.percentile(global_prices, 75)
                iqr = q3 - q1
                lower_bound = q1 - (IQR_MULTIPLIER * iqr)
                upper_bound = q3 + (IQR_MULTIPLIER * iqr)
                
                applicable_mask = remaining_mask
                is_outlier_val = (df.loc[applicable_mask, "price"] < lower_bound) | \
                                 (df.loc[applicable_mask, "price"] > upper_bound)
                df.loc[applicable_mask, "is_outlier"] = is_outlier_val
                evaluated_mask = evaluated_mask | applicable_mask
                
                logger.info(
                    "Level %d (Global fallback) matched %d records. Flagged %d outliers.",
                    level_idx + 1, applicable_mask.sum(), is_outlier_val.sum()
                )
                
    # Update quality_status for outlier records
    if "quality_status" not in df.columns:
        df["quality_status"] = "VALID"
    outlier_mask = df["is_outlier"] == True
    df.loc[outlier_mask, "quality_status"] = "OUTLIER"
    
    outlier_count = int(outlier_mask.sum())
    logger.info("Outlier detection completed. Total outliers flagged: %d", outlier_count)
    return df, outlier_count
