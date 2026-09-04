"""Repository helper for saving ETL run reports.

This module re-exports save_etl_run from app.repositories.etl for backwards compatibility.
"""

from app.repositories.etl import save_etl_run

__all__ = ["save_etl_run"]
