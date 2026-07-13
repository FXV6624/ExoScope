from sqlmodel import Session

from app.etl.report import ETLReport
from app.models import ETLRun


def save_etl_run(session: Session, report: ETLReport) -> None:
    run = ETLRun.create(report)
    session.add(run)
    session.commit()
