from sqlmodel import Session, col, func, select

from app.models import ETLRun


def get_last_etl_run(session: Session) -> ETLRun | None:
    """
    Get the last ETL run report.
    """
    statement = select(ETLRun).order_by(col(ETLRun.finished_at).desc())
    return session.exec(statement).first()


def get_etl_runs(
    session: Session, skip: int = 0, limit: int = 50
) -> tuple[list[ETLRun], int]:
    """
    Get all ETL run reports ordered by finished_at descending.
    """
    count = session.exec(select(func.count()).select_from(ETLRun)).one()
    statement = (
        select(ETLRun)
        .order_by(col(ETLRun.finished_at).desc())
        .offset(skip)
        .limit(limit)
    )
    runs = session.exec(statement).all()
    return list(runs), count
