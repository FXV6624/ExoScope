from typing import List, Tuple

from app.models import Exoplanet
from sqlmodel import Session

from app.schemas.exoplanet import ExoplanetFilters
from app.repositories.exoplanets import get_exoplanet_by_id, get_exoplanets_with_filters, count_exoplanets
from app.repositories.exoplanet_stats import (get_by_discovery_method,get_by_discovery_decade)


def read_exoplanets_service(session: Session,filters: ExoplanetFilters,skip: int,limit: int) -> dict:
    """
    Orchestrates repository calls for filtered + paginated exoplanets.
    """
    data, count = get_exoplanets_with_filters(session, filters, skip, limit)
    return { "data": data,"count": count}


def read_exoplanet_by_id_service(session: Session, exoplanet_id: str) -> Exoplanet | None:
    """
    Retrieve a single exoplanet by its UUID.
    """
    return get_exoplanet_by_id(session, exoplanet_id)


def get_exoplanet_stats_service(session: Session) -> dict:
    """
    Aggregates multiple repository queries into a single stats response.
    """
    total_count = count_exoplanets(session)
    by_method_raw = get_by_discovery_method(session)
    by_decade_raw = get_by_discovery_decade(session)

    return {"total": total_count,"by_method": _to_dict(by_method_raw),"by_decade": _format_by_decade(by_decade_raw)}


def _to_dict(rows: List[Tuple[str, int]]) -> dict[str, int]:
    """
    Convert raw SQL tuples into JSON-friendly dict format.
    """
    return {key: value for key, value in rows}


def _format_by_decade(rows: List[Tuple[int, int]]) -> dict[str, int]:
    """
    Convert raw SQL tuples into JSON-friendly dict format.
    """
    return {str(decade): count for decade, count in rows}