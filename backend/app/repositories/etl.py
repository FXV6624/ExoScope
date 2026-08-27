from sqlmodel import Session, col, select

from app.models import ETLRun


def get_last_etl_run(session: Session) -> ETLRun | None:
    """
    Get the last ETL run report.
    """
    statement = select(ETLRun).order_by(col(ETLRun.finished_at).desc())
    return session.exec(statement).first()
