import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi_cache.decorator import cache

from app.api.deps import SessionDep
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


@router.get(
    "/",
    response_model=ExoplanetsQueryResponse,
    summary="List exoplanets",
)
@limiter.limit("60/minute")
@cache(expire=3600)
def read_exoplanets(
    request: Request,  # noqa: ARG001
    session: SessionDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
    sort_by: ExoplanetSortField = ExoplanetSortField.PLANET_NAME,
    order: SortOrder = SortOrder.asc,
    filters: ExoplanetFilters = Depends(),
) -> Any:
    """
    Retrieve a paginated and filterable list of exoplanets with full physical and astrophysical properties.
    """
    return read_exoplanets_service(
        session,
        filters,
        skip,
        limit,
        sort_by,
        order,
    )


@router.get(
    "/fields",
    response_model=ExoplanetsQueryResponse,
    summary="List exoplanets with selected fields",
)
@limiter.limit("60/minute")
@cache(expire=3600)
def read_exoplanets_fields(
    request: Request,  # noqa: ARG001
    session: SessionDep,
    fields: Annotated[
        list[ExoplanetField],
        Query(description="List of fields to project in response items."),
    ],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
    sort_by: ExoplanetSortField = ExoplanetSortField.PLANET_NAME,
    order: SortOrder = SortOrder.asc,
    filters: ExoplanetFilters = Depends(),
) -> Any:
    """
    Retrieve exoplanets projecting only specified fields to minimize bandwidth and payload size.
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


@router.get(
    "/stats",
    response_model=ExoplanetStats,
    summary="Get exoplanet statistics",
)
@limiter.limit("30/minute")
@cache(expire=3600)
def get_exoplanet_stats(
    request: Request,  # noqa: ARG001
    session: SessionDep,
    habitability_score_threshold: Annotated[
        float,
        Query(
            ge=0,
            le=100,
            description="Minimum habitability score threshold (0-100 scale).",
        ),
    ] = 80.0,
    habitability_confidence_threshold: Annotated[
        float,
        Query(
            ge=0,
            le=1,
            description="Minimum habitability confidence threshold (0.0-1.0 scale).",
        ),
    ] = 0.8,
) -> Any:
    """
    Retrieve aggregated analytics and summary distributions for the exoplanets catalogue.
    """
    stats = get_exoplanet_stats_service(
        session, habitability_score_threshold, habitability_confidence_threshold
    )

    return stats


@router.get(
    "/{exoplanet_id:uuid}",
    response_model=ExoplanetPublic,
    summary="Get exoplanet by ID",
)
@limiter.limit("120/minute")
@cache(expire=3600)
def read_exoplanet_by_id(
    request: Request,  # noqa: ARG001
    exoplanet_id: uuid.UUID,
    session: SessionDep,
) -> Any:
    """
    Retrieve complete astrophysical record and verified imagery for a single exoplanet by UUID.
    """
    exoplanet = read_exoplanet_by_id_service(session, exoplanet_id)
    if not exoplanet:
        raise HTTPException(status_code=404, detail="Exoplanet not found")
    return exoplanet
