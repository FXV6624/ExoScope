from sqlmodel import select
from app.models import Exoplanet
from app.schemas.exoplanet import ExoplanetFilters


def build_exoplanet_query(filters: ExoplanetFilters):
    """
    Build base query with optional filters.
    """
    query = select(Exoplanet)

    conditions = []

    if filters.planet_name:
        conditions.append(
            Exoplanet.planet_name.contains(filters.planet_name)
        )

    if filters.host_star:
        conditions.append(
            Exoplanet.host_name.contains(filters.host_star)
        )

    if conditions:
        query = query.where(*conditions)

    return query