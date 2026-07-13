from collections.abc import Sequence
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import class_mapper
from sqlmodel import Session, col, select

from app.models import Exoplanet


def count_exoplanets(session: Session) -> int:
    return session.exec(select(func.count()).select_from(Exoplanet)).one()


def get_by_discovery_method(session: Session) -> Sequence[Any]:
    return session.exec(
        select(
            Exoplanet.discovery_method,
            func.count(),
        ).group_by(Exoplanet.discovery_method)
    ).all()


def get_by_discovery_decade(session: Session) -> Sequence[Any]:
    discovery_year_col = col(Exoplanet.discovery_year)
    decade = (discovery_year_col // 10) * 10
    return session.exec(
        select(
            decade.label("decade"),
            func.count(),
        )
        .where(discovery_year_col.is_not(None))
        .group_by(decade)
        .order_by(decade)
    ).all()


def get_by_composition(session: Session) -> Sequence[Any]:
    return session.exec(
        select(
            Exoplanet.composition,
            func.count(),
        ).group_by(Exoplanet.composition)
    ).all()


def get_summary_stats(session: Session, column: Any) -> tuple[Any, Any, Any]:
    avg_, min_, max_ = session.exec(
        select(
            func.avg(column),
            func.min(column),
            func.max(column),
        )
    ).one()
    return avg_, min_, max_


def get_habitability_stats(
    session: Session,
    score_threshold: float = 80.0,
    confidence_threshold: float = 0.8,
) -> Any:
    stmt = select(  # type: ignore
        func.avg(col(Exoplanet.habitability_score)),
        func.min(col(Exoplanet.habitability_score)),
        func.max(col(Exoplanet.habitability_score)),
        func.avg(col(Exoplanet.habitability_confidence)),
        func.count().filter(
            col(Exoplanet.habitability_score) >= score_threshold,
            col(Exoplanet.habitability_confidence) >= confidence_threshold,
        ),
    )

    return session.exec(stmt).one()


COMPLETENESS_COLUMNS = tuple(
    column
    for column in class_mapper(Exoplanet).columns
    if column.key
    not in {
        "id",
        "planet_name",
        "created_at",
        "updated_at",
    }
)


def get_completeness(session: Session) -> Any:
    """
    Returns the total number of rows together with the number of
    non-null values for each tracked field.
    """
    stmt = select(
        func.count().label("total"),
        *(func.count(column).label(column.key) for column in COMPLETENESS_COLUMNS),
    )

    return session.exec(stmt).one()
