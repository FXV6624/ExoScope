
from sqlmodel import Session

from app.models import Exoplanet
from app.repositories.exoplanet_stats import (
    get_by_composition,
    get_by_discovery_decade,
    get_by_discovery_method,
    get_completeness,
    get_habitability_stats,
    get_summary_stats,
)
from app.repositories.exoplanets import (
    count_exoplanets,
    get_exoplanet_by_id,
    get_exoplanets_with_filters,
)
from app.schemas.exoplanet import (
    CompletenessStats,
    CompositionStats,
    ExoplanetFilters,
    ExoplanetStats,
    HabitabilityStats,
    SummaryStats,
)


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


def _summary(session, column) -> SummaryStats:
    avg_, min_, max_ = get_summary_stats(session, column)

    return SummaryStats(
        average=avg_,
        minimum=min_,
        maximum=max_,
    )


def get_exoplanet_stats_service(session, habitability_score_threshold: float = 80.0,
        habitability_confidence_threshold: float = 0.8) -> ExoplanetStats:

    avg_score, min_score, max_score, avg_confidence, habitable = get_habitability_stats(session,
        habitability_score_threshold, habitability_confidence_threshold)

    return ExoplanetStats(
        total=count_exoplanets(session),

        by_method=_to_dict(get_by_discovery_method(session)),

        by_decade=_format_by_decade(get_by_discovery_decade(session)),


        composition=CompositionStats(
            by_composition=_to_dict(get_by_composition(session)),
            average_confidence=_summary(session, Exoplanet.composition_confidence).average,
        ),


        habitability=HabitabilityStats(
            average=avg_score,
            minimum=min_score,
            maximum=max_score,
            average_confidence=avg_confidence,
            potentially_habitable=habitable,
        ),

        radius=_summary(session, Exoplanet.planet_radius),

        mass=_summary(session, Exoplanet.planet_mass),

        density=_summary(session, Exoplanet.planet_density),

        equilibrium_temperature=_summary(session,Exoplanet.equilibrium_temperature,),

        orbital_period=_summary(session,Exoplanet.orbital_period,),

        distance=_summary(session,Exoplanet.distance_from_earth,),

        completeness=_build_completeness(session),
    )


def _to_dict(rows: list[tuple[str, int]]) -> dict[str, int]:
    """
    Convert raw SQL tuples into JSON-friendly dict format.
    """
    return {key: value for key, value in rows if key is not None}


def _format_by_decade(rows: list[tuple[int, int]]) -> dict[str, int]:
    """
    Convert raw SQL tuples into JSON-friendly dict format.
    """
    return {str(decade): count for decade, count in rows}


def _build_completeness(session) -> CompletenessStats:

    row = get_completeness(session)._mapping

    total = row["total"]

    if total == 0:
        return CompletenessStats(**dict.fromkeys(CompletenessStats.model_fields, 0.0))

    return CompletenessStats(**{field: round(row[field] * 100 / total, 1)for field in CompletenessStats.model_fields})
