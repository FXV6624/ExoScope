from typing import Any

from fastapi import APIRouter, Depends, Request

from app.api.deps import SessionDep, get_current_active_superuser
from app.core.limiter import limiter
from app.etl.config import ETLConfig
from app.etl.main import run_etl
from app.services.etl import read_last_etl_run_service

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


@router.get("/last_run", dependencies=[Depends(get_current_active_superuser)])
def read_last_etl_run(
    request: Request,  # noqa: ARG001
    session: SessionDep,
) -> Any:
    """
    Get the last ETL run report (superuser only)
    """
    report = read_last_etl_run_service(session)
    if not report:
        return {"status": "ok", "report": None}
    return {"status": "ok", "report": report.model_dump()}
