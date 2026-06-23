from sqlmodel import Session, func, col
from app.models import Exoplanet


def get_exoplanets(session: Session, query, skip: int, limit: int):
    statement = (query.order_by(col(Exoplanet.planet_name).asc()).offset(skip).limit(limit))
    return session.exec(statement).all()


def count_exoplanets(session: Session, query):
    count_statement = query.with_only_columns(func.count())
    return session.exec(count_statement).one()


def get_exoplanet_by_id(session: Session, exoplanet_id):
    return session.get(Exoplanet, exoplanet_id)