from app.api.deps import SessionDep
from fastapi import APIRouter
from app.models import Exoplanet, ExoplanetPublic, ExoplanetsPublic
from sqlmodel import col, func, select
from typing import Any

router = APIRouter(prefix="/exoplanets", tags=["exoplanets"])

@router.get("/", response_model=ExoplanetsPublic)
def read_exoplanets(session: SessionDep, skip: int = 0, limit: int = 50) -> Any:
    """
    Retrieve exoplanets.
    """

    count_statement = select(func.count()).select_from(Exoplanet)
    count = session.exec(count_statement).one()

    statement = (
        select(Exoplanet).order_by(col(Exoplanet.planet_name).asc()).offset(skip).limit(limit)
    )
    exoplanets = session.exec(statement).all()

    exoplanets_public = [ExoplanetPublic.model_validate(exoplanet) for exoplanet in exoplanets]
    return ExoplanetsPublic(data=exoplanets_public, count=count)