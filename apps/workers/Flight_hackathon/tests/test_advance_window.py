from datetime import date
import pandas as pd
import pytest
from data_pipeline.advance_window import (
    calculate_advance_days,
    assign_advance_window_bucket,
    process_advance_booking
)

def test_calculate_advance_days():
    obs = date(2026, 3, 20)
    jrny = date(2026, 3, 24)
    assert calculate_advance_days(obs, jrny) == 4
    
    # Missing dates
    assert calculate_advance_days(None, jrny) is None
    assert calculate_advance_days(obs, None) is None
    
    # Negative days (journey before booking)
    assert calculate_advance_days(date(2026, 3, 25), date(2026, 3, 20)) == -5

def test_assign_advance_window_bucket():
    # 0-3 days -> T+1
    assert assign_advance_window_bucket(0) == "T+1"
    assert assign_advance_window_bucket(3) == "T+1"
    
    # 4-10 days -> T+7
    assert assign_advance_window_bucket(4) == "T+7"
    assert assign_advance_window_bucket(10) == "T+7"
    
    # 11-22 days -> T+15
    assert assign_advance_window_bucket(11) == "T+15"
    assert assign_advance_window_bucket(22) == "T+15"
    
    # 23-37 days -> T+30
    assert assign_advance_window_bucket(23) == "T+30"
    assert assign_advance_window_bucket(37) == "T+30"
    
    # 38+ days -> T+45
    assert assign_advance_window_bucket(38) == "T+45"
    assert assign_advance_window_bucket(100) == "T+45"
    
    # Invalid/Negative
    assert assign_advance_window_bucket(-1) is None
    assert assign_advance_window_bucket(None) is None

def test_process_advance_booking():
    df = pd.DataFrame([
        {
            "observation_date": date(2026, 3, 20),
            "journey_date": date(2026, 3, 21),
            "advance_days": None,
        },
        {
            "observation_date": None,
            "journey_date": date(2026, 3, 21),
            "advance_days": 15,
        },
        {
            "observation_date": None,
            "journey_date": None,
            "advance_days": None,
        }
    ])
    
    res = process_advance_booking(df)
    
    # First row: calculated from dates
    assert res.iloc[0]["advance_days"] == 1
    assert res.iloc[0]["advance_window"] == "T+1"
    
    # Second row: assigned from existing advance_days
    assert res.iloc[1]["advance_days"] == 15
    assert res.iloc[1]["advance_window"] == "T+15"
    
    # Third row: remains missing
    assert pd.isna(res.iloc[2]["advance_days"])
    assert res.iloc[2]["advance_window"] is None
