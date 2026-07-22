from sqlmodel import Session

from app.models import Exoplanet
from app.repositories.exoplanet_query_builder import build_exoplanet_query
from app.schemas.exoplanet import ExoplanetFilters


def get_exoplanets_for_export(
    session: Session,
    filters: ExoplanetFilters,
) -> list[Exoplanet]:
    """
    Return all exoplanets matching the filters.
    """
    query = build_exoplanet_query(filters)

    statement = query.order_by(Exoplanet.planet_name)

    return list(session.exec(statement).all())
