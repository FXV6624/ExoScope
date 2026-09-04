"""Base ETL reporting model.

Re-exports ETLBaseReport from app.etl.report for backwards compatibility.
"""

from app.etl.report import ETLBaseReport

__all__ = ["ETLBaseReport"]
