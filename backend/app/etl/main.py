from sqlmodel import Session
from app.core.db import engine
from app.etl.pipeline import ExoplanetETL

def run_etl(session: Session):
    etl = ExoplanetETL(session=session)
    report = etl.run()
    print(report)
    return report

if __name__ == "__main__":
    with Session(engine) as session:
        run_etl(session)