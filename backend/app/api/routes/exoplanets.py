import uuid
from typing import Any
from sqlmodel import col, func
from fastapi import APIRouter, HTTPException, Depends

from app.api.deps import SessionDep
from app.services.exoplanets import build_exoplanet_query
from app.schemas.exoplanet import ExoplanetFilters, ExoplanetPublic, ExoplanetsPublic
from app.repositories.exoplanets import (get_exoplanets,count_exoplanets,get_exoplanet_by_id)

router = APIRouter(prefix="/exoplanets", tags=["exoplanets"])


@router.get("/", response_model=ExoplanetsPublic)
def read_exoplanets(session: SessionDep,skip: int = 0,limit: int = 50,filters: ExoplanetFilters = Depends()):
    """
    Retrieve a list of exoplanets with optional filters.
    """
    base_query = build_exoplanet_query(filters)
    count = count_exoplanets(session, base_query)
    exoplanets = get_exoplanets(session, base_query, skip, limit)

    return {
        "data": exoplanets,
        "count": count
    }


@router.get("/{exoplanet_id}", response_model=ExoplanetPublic)
def read_exoplanet_by_id(exoplanet_id: uuid.UUID, session: SessionDep):
    """
    Get a specific exoplanet by ID.
    """
    exoplanet = get_exoplanet_by_id(session, exoplanet_id)
    if exoplanet is None:
        raise HTTPException(status_code=404, detail="Exoplanet not found")
    return exoplanet


