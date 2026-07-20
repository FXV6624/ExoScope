from typing import Any

from fastapi import APIRouter, Depends, Request

from app.api.deps import SessionDep, get_current_active_superuser
from app.core.limiter import limiter
from app.etl.config import ETLConfig
from app.etl.main import run_etl

router = APIRouter(prefix="/etl", tags=["etl"])


@router.post("/run", dependencies=[Depends(get_current_active_superuser)])
@limiter.limit("1/minute")
def run_exoplanet_etl(
    request: Request,  # noqa: ARG001
    session: SessionDep,
    config: ETLConfig,
) -> Any:
    """
    Run ETL process for exoplanets (superuser only)
    """
    report = run_etl(session, config)
    return {"status": "ok", "report": report.model_dump()}


@router.get("/crash")
def crash():
    raise ValueError("Testing")
