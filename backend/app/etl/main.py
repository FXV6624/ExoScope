from sqlmodel import Session

from app.core.db import engine
from app.core.logging import logger
from app.etl.config import ETLConfig
from app.etl.pipeline import ExoplanetETL


def run_etl(session: Session, config: ETLConfig = ETLConfig()) -> dict:
    etl = ExoplanetETL(session=session, config=config)
    report = etl.run()
    logger.info(f"ETL process completed. Report: {report.model_dump()}")
    return report

if __name__ == "__main__":
    with Session(engine) as session:
        run_etl(session)
