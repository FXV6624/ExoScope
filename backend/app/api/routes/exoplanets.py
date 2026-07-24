import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi_cache.decorator import cache

from app.api.deps import CurrentUser, SessionDep
from app.core.enums.exoplanet import (
    ExoplanetField,
    ExoplanetSortField,
    SortOrder,
)
from app.core.limiter import limiter
from app.schemas.exoplanet import (
    ExoplanetFilters,
    ExoplanetPublic,
    ExoplanetsQueryResponse,
    ExoplanetStats,
)
from app.services.exoplanets import (
    get_exoplanet_stats_service,
    read_exoplanet_by_id_service,
    read_exoplanets_service,
)

router = APIRouter(prefix="/exoplanets", tags=["exoplanets"])


@router.get("/", response_model=ExoplanetsQueryResponse)
@limiter.limit("60/minute")
@cache(expire=300)
def read_exoplanets(
    request: Request,  # noqa: ARG001
    session: SessionDep,
    _current_user: CurrentUser,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
    sort_by: ExoplanetSortField = ExoplanetSortField.PLANET_NAME,
    order: SortOrder = SortOrder.asc,
    filters: ExoplanetFilters = Depends(),
) -> Any:
    """
    Retrieve a standard list of exoplanets with full models.
    """
    return read_exoplanets_service(
        session,
        filters,
        skip,
        limit,
        sort_by,
        order,
    )


@router.get("/fields", response_model=ExoplanetsQueryResponse)
@limiter.limit("60/minute")
@cache(expire=300)
def read_exoplanets_fields(
    request: Request,  # noqa: ARG001
    session: SessionDep,
    _current_user: CurrentUser,
    fields: Annotated[list[ExoplanetField], Query()],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
    sort_by: ExoplanetSortField = ExoplanetSortField.PLANET_NAME,
    order: SortOrder = SortOrder.asc,
    filters: ExoplanetFilters = Depends(),
) -> Any:
    """
    Retrieve exoplanets selecting only the requested fields.
    Useful for lightweight clients and large datasets.
    """
    return read_exoplanets_service(
        session,
        filters,
        skip,
        limit,
        sort_by,
        order,
        fields,
    )


@router.get("/stats", response_model=ExoplanetStats)
@limiter.limit("30/minute")
@cache(expire=600)
def get_exoplanet_stats(
    request: Request,  # noqa: ARG001
    session: SessionDep,
    _current_user: CurrentUser,
    habitability_score_threshold: Annotated[float, Query(ge=0, le=100)] = 80.0,
    habitability_confidence_threshold: Annotated[float, Query(ge=0, le=1)] = 0.8,
) -> Any:
    """
    Retrieve statistics about the exoplanets dataset.
    """
    stats = get_exoplanet_stats_service(
        session, habitability_score_threshold, habitability_confidence_threshold
    )

    return stats


@router.get("/{exoplanet_id:uuid}", response_model=ExoplanetPublic)
@limiter.limit("120/minute")
@cache(expire=300)
def read_exoplanet_by_id(
    request: Request,  # noqa: ARG001
    exoplanet_id: uuid.UUID,
    session: SessionDep,
    _current_user: CurrentUser,
) -> Any:
    """
    Get a specific exoplanet by ID.
    """
    exoplanet = read_exoplanet_by_id_service(session, exoplanet_id)
    if not exoplanet:
        raise HTTPException(status_code=404, detail="Exoplanet not found")
    return exoplanet
