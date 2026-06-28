from sqlmodel import Session
from app.models import ETLRun


def save_etl_run(session: Session, report, metrics):
    run = ETLRun(
        started_at=metrics.start_time,
        finished_at=metrics.end_time,

        extracted=report.extracted,
        transformed=report.transformed,
        loaded=report.loaded,

        extract_time=report.extract_time,
        transform_time=report.transform_time,
        load_time=report.load_time,
        total_time=report.duration_seconds,

        success=len(report.errors) == 0,
        errors=" | ".join(report.errors),
    )

    session.add(run)
    session.commit()