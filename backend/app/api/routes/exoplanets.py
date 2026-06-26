import uuid
from fastapi import APIRouter, HTTPException, Depends

from app.api.deps import CurrentUser, SessionDep
from app.schemas.exoplanet import ExoplanetFilters, ExoplanetPublic, ExoplanetStats, ExoplanetsPublic
from app.services.exoplanets import read_exoplanets_service, get_exoplanet_stats_service, read_exoplanet_by_id_service

router = APIRouter(prefix="/exoplanets", tags=["exoplanets"])


@router.get("/", response_model=ExoplanetsPublic)
def read_exoplanets(session: SessionDep, current_user: CurrentUser, skip: int = 0, 
    limit: int = 50, filters: ExoplanetFilters = Depends()):
    """
    Retrieve a list of exoplanets with optional filters.
    """
    return read_exoplanets_service(session, filters, skip,limit)


@router.get("/stats", response_model=ExoplanetStats)
def get_exoplanet_stats(session: SessionDep, current_user: CurrentUser):
    """
    Retrieve statistics about the exoplanets dataset.
    """
    stats = get_exoplanet_stats_service(session)

    return stats

@router.get("/{exoplanet_id:uuid}", response_model=ExoplanetPublic)
def read_exoplanet_by_id(exoplanet_id: uuid.UUID, session: SessionDep,current_user: CurrentUser):
    """
    Get a specific exoplanet by ID.
    """
    exoplanet = read_exoplanet_by_id_service(session, exoplanet_id)
    if not exoplanet:
        raise HTTPException(status_code=404, detail="Exoplanet not found")
    return exoplanet



