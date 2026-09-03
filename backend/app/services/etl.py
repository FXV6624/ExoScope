from sqlmodel import Session

from app.models import ETLRun
from app.repositories.etl import get_etl_runs, get_last_etl_run


def read_last_etl_run_service(session: Session) -> ETLRun | None:
    """
    Get the last ETL run report
    """
    return get_last_etl_run(session)


def read_etl_runs_service(
    session: Session, skip: int = 0, limit: int = 50
) -> tuple[list[ETLRun], int]:
    """
    Get all ETL run reports
    """
    return get_etl_runs(session, skip=skip, limit=limit)
