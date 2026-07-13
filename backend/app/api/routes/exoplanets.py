import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi_cache.decorator import cache

from app.api.deps import CurrentUser, SessionDep
from app.core.limiter import limiter
from app.schemas.exoplanet import (
    ExoplanetFilters,
    ExoplanetPublic,
    ExoplanetsPublic,
    ExoplanetStats,
)
from app.services.exoplanets import (
    get_exoplanet_stats_service,
    read_exoplanet_by_id_service,
    read_exoplanets_service,
)

router = APIRouter(prefix="/exoplanets", tags=["exoplanets"])


@router.get("/", response_model=ExoplanetsPublic)
@limiter.limit("60/minute")
@cache(expire=300)
def read_exoplanets(_request: Request, session: SessionDep, _current_user: CurrentUser, skip: int = 0,
    limit: int = 50, filters: ExoplanetFilters = Depends()):
    """
    Retrieve a list of exoplanets with optional filters.
    """
    return read_exoplanets_service(session, filters, skip,limit)


@router.get("/stats", response_model=ExoplanetStats)
@limiter.limit("30/minute")
@cache(expire=600)
def get_exoplanet_stats(_request: Request, session: SessionDep, _current_user: CurrentUser,
     habitability_score_threshold: Annotated[float,Query(ge=0, le=100)] = 80.0,
     habitability_confidence_threshold: Annotated[float,Query(ge=0, le=1)] = 0.8,):
    """
    Retrieve statistics about the exoplanets dataset.
    """
    stats = get_exoplanet_stats_service(session, habitability_score_threshold, habitability_confidence_threshold)

    return stats

@router.get("/{exoplanet_id:uuid}", response_model=ExoplanetPublic)
@limiter.limit("120/minute")
@cache(expire=300)
def read_exoplanet_by_id(_request: Request, exoplanet_id: uuid.UUID, session: SessionDep, _current_user: CurrentUser):
    """
    Get a specific exoplanet by ID.
    """
    exoplanet = read_exoplanet_by_id_service(session, exoplanet_id)
    if not exoplanet:
        raise HTTPException(status_code=404, detail="Exoplanet not found")
    return exoplanet



