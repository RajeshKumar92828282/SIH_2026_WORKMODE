import logging
from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
HISTORICAL_DATA_DIR = PROJECT_ROOT / "data" / "historical"
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"

CLEANED_OUTPUT_PATH = PROCESSED_DATA_DIR / "cleaned_observations.csv"
REJECTED_OUTPUT_PATH = PROCESSED_DATA_DIR / "rejected_records.csv"
PIPELINE_REPORT_PATH = PROCESSED_DATA_DIR / "pipeline_report.json"

# CSV Parser Configurations
CSV_ENCODINGS = ["utf-8", "latin-1", "cp1252", "utf-16"]
MISSING_VALUE_MARKERS = {
    "", " ", "na", "n/a", "null", "none", "-", "unknown", "nan", "undefined"
}

# Advance Booking Windows (T+N)
# Format: List of window days
ADVANCE_WINDOWS = [1, 7, 15, 30, 45]

# Booking bucket ranges: upper bound is inclusive.
# 0-3 -> T+1
# 4-10 -> T+7
# 11-22 -> T+15
# 23-37 -> T+30
# 38+ -> T+45
ADVANCE_WINDOW_RANGES = [
    (0, 3, "T+1"),
    (4, 10, "T+7"),
    (11, 22, "T+15"),
    (23, 37, "T+30"),
    (38, float("inf"), "T+45"),
]

# Outlier Detection Configuration
IQR_MULTIPLIER = 1.5
MIN_GROUP_SIZE = 10  # Minimum observations in subgroup for outlier calculation

# Logger Setup Configuration
LOG_LEVEL = logging.INFO
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s"
