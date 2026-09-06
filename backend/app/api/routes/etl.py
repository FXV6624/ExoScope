from typing import Any

from fastapi import APIRouter, Request

from app.api.deps import CurrentUser, SessionDep
from app.core.limiter import limiter
from app.etl.config import ETLConfig
from app.etl.main import run_etl
from app.schemas.etl import ETLLastRunResponse, ETLRunResponse, ETLRunsResponse
from app.services.etl import read_etl_runs_service, read_last_etl_run_service

router = APIRouter(prefix="/etl", tags=["etl"])


@router.post(
    "/run",
    response_model=ETLRunResponse,
    summary="Trigger ETL pipeline",
)
@limiter.limit("1/minute")
def run_exoplanet_etl(
    request: Request,  # noqa: ARG001
    session: SessionDep,
    current_user: CurrentUser,  # noqa: ARG001
    config: ETLConfig,
) -> Any:
    """
    Trigger the exoplanet ETL ingestion pipeline with customizable limits and loading modes (admin only).
    """
    report = run_etl(session, config)
    return {"status": "ok", "report": report.model_dump()}


@router.get(
    "/last_run",
    response_model=ETLLastRunResponse,
    summary="Get last ETL run report",
)
def read_last_etl_run(
    request: Request,  # noqa: ARG001
    session: SessionDep,
    current_user: CurrentUser,  # noqa: ARG001
) -> Any:
    """
    Retrieve the execution metrics and report of the most recent ETL pipeline run (admin only).
    """
    report = read_last_etl_run_service(session)
    if not report:
        return {"status": "ok", "report": None}
    return {"status": "ok", "report": report.model_dump()}


@router.get(
    "/runs",
    response_model=ETLRunsResponse,
    summary="List ETL pipeline runs",
)
def read_etl_runs(
    request: Request,  # noqa: ARG001
    session: SessionDep,
    current_user: CurrentUser,  # noqa: ARG001
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Retrieve paginated historical execution records of past ETL pipeline runs (admin only).
    """
    runs, count = read_etl_runs_service(session, skip=skip, limit=limit)
    return {
        "status": "ok",
        "count": count,
        "runs": [run.model_dump() for run in runs],
    }
