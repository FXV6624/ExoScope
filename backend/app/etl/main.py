from app.etl.extract import extract
from app.etl.transform import transform
from app.etl.load import load


def run_etl(session):
    data = extract()
    planets = transform(data)
    load(session, planets)

    return len(planets)


if __name__ == "__main__":
    from app.core.db import SessionLocal

    session = SessionLocal()
    try:
        run_etl(session)
    finally:
        session.close()