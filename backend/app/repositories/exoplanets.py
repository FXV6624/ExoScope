import uuid
from typing import Any

from sqlmodel import Session, func, select
from sqlmodel.sql.expression import SelectOfScalar

from app.core.enums.exoplanet import ExoplanetField, ExoplanetSortField, SortOrder
from app.models import Exoplanet
from app.repositories.exoplanet_field_selection import apply_field_selection
from app.repositories.exoplanet_query_builder import build_exoplanet_query
from app.repositories.exoplanet_sorting import apply_sorting
from app.schemas.exoplanet import ExoplanetFilters


def get_exoplanets_with_filters(
    session: Session,
    filters: ExoplanetFilters,
    skip: int,
    limit: int,
    sort_by: ExoplanetSortField,
    order: SortOrder,
    fields: list[ExoplanetField] | None = None,
) -> tuple[list[Exoplanet], int]:
    """
    Build query with filters and return paginated results + total count.
    """
    query = build_exoplanet_query(filters)
    data = get_exoplanets(
        session,
        query,
        skip,
        limit,
        sort_by,
        order,
        fields,
    )
    count = count_exoplanets(session, query)

    return data, count


def get_exoplanets(
    session: Session,
    query: SelectOfScalar[Any],
    skip: int,
    limit: int,
    sort_by: ExoplanetSortField,
    order: SortOrder,
    fields: list[ExoplanetField] | None = None,
) -> list[Exoplanet]:
    """
    Return paginated exoplanets ordered by planet name.
    """
    statement = apply_field_selection(query, fields)
    statement = apply_sorting(statement, sort_by, order)
    statement = statement.offset(skip).limit(limit)

    return list(session.exec(statement).all())


def count_exoplanets(session: Session, query: SelectOfScalar[Any] | None = None) -> int:
    """
    Count total exoplanets, with or without filters.
    """
    if query is None:
        statement = select(func.count()).select_from(Exoplanet)
    else:
        statement = select(func.count()).select_from(query.subquery())

    return session.exec(statement).one()


def get_exoplanet_by_id(session: Session, exoplanet_id: uuid.UUID) -> Exoplanet | None:
    """
    Retrieve a single exoplanet by its UUID.
    """
    statement = select(Exoplanet).where(Exoplanet.id == exoplanet_id)
    return session.exec(statement).first()
