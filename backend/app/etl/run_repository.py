from sqlmodel import Session
from app.models import ETLRun
from app.etl.report import ETLReport

def save_etl_run(session: Session, report: ETLReport):
    run = ETLRun.create(report)
    session.add(run)
    session.commit()