from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request

from app.api.deps import get_current_active_superuser
from app.schemas.scheduler import SchedulerUpdate
from app.services.scheduler import (
    read_scheduler_status_service,
    start_scheduler_service,
    stop_scheduler_service,
    update_scheduler_interval_service,
)

router = APIRouter(prefix="/scheduler", tags=["scheduler"])


@router.get("/", dependencies=[Depends(get_current_active_superuser)])
def read_scheduler_status(
    request: Request,  # noqa: ARG001
) -> Any:
    """
    Get the scheduler status (superuser only).
    """
    return {
        "status": "ok",
        "scheduler": read_scheduler_status_service(),
    }


@router.post("/start", dependencies=[Depends(get_current_active_superuser)])
def start_scheduler_route() -> Any:
    """
    Start the scheduler (superuser only).
    """
    try:
        start_scheduler_service()
    except RuntimeError as exc:
        raise HTTPException(
            status_code=409,
            detail=str(exc),
        ) from exc

    return {
        "status": "ok",
        "scheduler": read_scheduler_status_service(),
    }


@router.post("/stop", dependencies=[Depends(get_current_active_superuser)])
def stop_scheduler_route() -> Any:
    """
    Stop the scheduler (superuser only).
    """
    try:
        stop_scheduler_service()
    except RuntimeError as exc:
        raise HTTPException(
            status_code=409,
            detail=str(exc),
        ) from exc

    return {
        "status": "ok",
        "scheduler": read_scheduler_status_service(),
    }


@router.patch("/", dependencies=[Depends(get_current_active_superuser)])
def update_scheduler(
    data: SchedulerUpdate,
) -> Any:
    try:
        update_scheduler_interval_service(data.interval_seconds)
    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    return {
        "status": "ok",
        "scheduler": read_scheduler_status_service(),
    }
