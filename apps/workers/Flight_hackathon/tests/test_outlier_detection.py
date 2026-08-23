import pandas as pd
import pytest
from data_pipeline.outlier_detection import detect_outliers

def test_detect_outliers_sufficient_group_size():
    # Create 11 flights for route "DEL-BOM", cabin_class "ECONOMY", advance_window "T+7"
    # 10 flights are tightly grouped around 5000, 1 flight is an extreme outlier (15000)
    prices = [5000.0, 5100.0, 4900.0, 5050.0, 4950.0, 5000.0, 5100.0, 4900.0, 5050.0, 4950.0, 15000.0]
    
    rows = []
    for i, p in enumerate(prices):
        rows.append({
            "route": "DEL-BOM",
            "cabin_class": "ECONOMY",
            "advance_window": "T+7",
            "price": p,
            "flight_number": f"AI-{100 + i}"
        })
        
    df = pd.DataFrame(rows)
    
    res, outlier_count = detect_outliers(df)
    
    assert outlier_count == 1
    assert res.iloc[-1]["is_outlier"] == True
    assert res.iloc[-1]["quality_status"] == "OUTLIER"
    
    # Other normal records should not be flagged as outliers
    assert res.iloc[0]["is_outlier"] == False
    assert res.iloc[0]["quality_status"] == "VALID"  # default value not overwritten

def test_detect_outliers_insufficient_group_size_fallback():
    # Subgroup route+class+window size is too small (e.g. only 3 records)
    # But route+window or route has enough records if we group them
    # Let's create a dataset where the first subgroup is too small but fallback works.
    
    # Subgroup A: DEL-BOM, cabin ECONOMY, advance T+7 (3 records) - under min_group_size 10
    # Subgroup B: DEL-BOM, cabin BUSINESS, advance T+7 (8 records)
    # Total for DEL-BOM, advance T+7 is 11 records!
    # So Level 1 (route+class+window) will fail for both subgroups because size < 10 (3 and 8).
    # But Level 2 (route+window = DEL-BOM + T+7) will have 11 records! Fallback should run here.
    
    rows = []
    # 3 economy records
    for i in range(3):
        rows.append({
            "route": "DEL-BOM",
            "cabin_class": "ECONOMY",
            "advance_window": "T+7",
            "price": 5000.0,
            "flight_number": f"SG-{i}"
        })
    # 7 business normal records + 1 business outlier
    for i in range(7):
        rows.append({
            "route": "DEL-BOM",
            "cabin_class": "BUSINESS",
            "advance_window": "T+7",
            "price": 5200.0,
            "flight_number": f"UK-{i}"
        })
    # Business outlier
    rows.append({
        "route": "DEL-BOM",
        "cabin_class": "BUSINESS",
        "advance_window": "T+7",
        "price": 18000.0,
        "flight_number": "UK-OUTLIER"
    })
    
    df = pd.DataFrame(rows)
    
    res, outlier_count = detect_outliers(df)
    
    # Subgroup Level 2 has 11 records:
    # Prices: [5000, 5000, 5000, 5200, 5200, 5200, 5200, 5200, 5200, 5200, 18000]
    # Q1 = 5000, Q3 = 5200, IQR = 200. Upper bound = 5200 + 1.5 * 200 = 5500.
    # So 18000 should be flagged as an outlier!
    assert outlier_count == 1
    assert res[res["flight_number"] == "UK-OUTLIER"].iloc[0]["is_outlier"] == True
    assert res[res["flight_number"] == "SG-0"].iloc[0]["is_outlier"] == False
