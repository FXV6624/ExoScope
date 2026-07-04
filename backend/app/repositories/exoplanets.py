import uuid
from typing import Optional

from sqlalchemy import Select
from sqlmodel import Session, func, col, select

from app.schemas.exoplanet import ExoplanetFilters
from app.repositories.exoplanet_query_builder import build_exoplanet_query
from app.models import Exoplanet


def get_exoplanets_with_filters(session: Session,filters: ExoplanetFilters,
        skip: int,limit: int) -> tuple[list[Exoplanet], int]:
    """
    Build query with filters and return paginated results + total count.
    """
    query = build_exoplanet_query(filters)
    data = get_exoplanets(session, query, skip, limit)
    count = count_exoplanets(session, query)

    return data, count


def get_exoplanets(session: Session,query,skip: int,limit: int) -> list[Exoplanet]:
    """
    Return paginated exoplanets ordered by planet name.
    """
    statement = (query.order_by(col(Exoplanet.planet_name).asc()).offset(skip).limit(limit))

    return session.exec(statement).all()


def count_exoplanets(session: Session,query: Optional[Select] = None) -> int:
    """
    Count total exoplanets, with or without filters.
    """
    if query is None:
        statement = select(func.count()).select_from(Exoplanet)
    else:
        statement = select(func.count()).select_from(query.subquery())

    return session.exec(statement).one()


def get_exoplanet_by_id(session: Session,exoplanet_id: uuid.UUID) -> Exoplanet | None:
    """
    Retrieve a single exoplanet by its UUID.
    """
    statement = select(Exoplanet).where(Exoplanet.id == exoplanet_id)
    return session.exec(statement).first()