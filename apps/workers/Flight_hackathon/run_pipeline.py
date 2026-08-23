import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.append(str(PROJECT_ROOT))

from data_pipeline import run_etl_pipeline

print("=" * 50)
print("RUNNING APIx ETL PIPELINE...")
print("=" * 50)

cleaned, rejected, report = run_etl_pipeline()

print("\n" + "=" * 50)
print("ETL PIPELINE RESULTS SUMMARY")
print("=" * 50)
print(f"CSV files processed      : {report['datasets_processed']}")
print(f"Total rows loaded        : {report['total_rows_loaded']:,}")
print(f"Duplicates removed       : {report['duplicates_removed']:,}")
print(f"Outliers flagged         : {report['outliers_flagged']:,}")
print(f"Accepted records output  : {report['accepted_records']:,}")
print(f"Rejected records output  : {report['rejected_records']:,}")
print(f"Execution duration       : {report['duration_seconds']:.2f} seconds")
print("-" * 50)
print(f"Cleaned dataset path     : {PROJECT_ROOT}/data/processed/cleaned_observations.csv")
print(f"Rejected records path    : {PROJECT_ROOT}/data/processed/rejected_records.csv")
print(f"Pipeline report JSON     : {PROJECT_ROOT}/data/processed/pipeline_report.json")
print("=" * 50)
