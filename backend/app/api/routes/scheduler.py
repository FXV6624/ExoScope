from typing import Any

from fastapi import APIRouter, HTTPException, Request

from app.api.deps import CurrentUser
from app.schemas.scheduler import SchedulerUpdate
from app.services.scheduler import (
    read_scheduler_status_service,
    start_scheduler_service,
    stop_scheduler_service,
    update_scheduler_interval_service,
)

router = APIRouter(prefix="/scheduler", tags=["scheduler"])


@router.get("/")
def read_scheduler_status(
    request: Request,  # noqa: ARG001
    current_user: CurrentUser,  # noqa: ARG001
) -> Any:
    """
    Get the scheduler status (admin only).
    """
    return {
        "status": "ok",
        "scheduler": read_scheduler_status_service(),
    }


@router.post("/start")
def start_scheduler_route(
    current_user: CurrentUser,  # noqa: ARG001
) -> Any:
    """
    Start the scheduler (admin only).
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


@router.post("/stop")
def stop_scheduler_route(
    current_user: CurrentUser,  # noqa: ARG001
) -> Any:
    """
    Stop the scheduler (admin only).
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


@router.patch("/")
def update_scheduler(
    current_user: CurrentUser,  # noqa: ARG001
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
