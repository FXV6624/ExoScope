from sqlmodel import Session

from app.models import ETLRun
from app.repositories.etl import get_last_etl_run


def read_last_etl_run_service(session: Session) -> ETLRun | None:
    """
    Get the last ETL run report
    """
    return get_last_etl_run(session)
