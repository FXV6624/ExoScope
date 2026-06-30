from sqlmodel import Session
from app.core.db import engine
from app.etl.pipeline import ExoplanetETL
from app.etl.config import ETLConfig

def run_etl(session: Session, config: ETLConfig = ETLConfig()) -> dict:
    etl = ExoplanetETL(session=session, config=config)
    report = etl.run()
    print(report)
    return report

if __name__ == "__main__":
    with Session(engine) as session:
        run_etl(session)