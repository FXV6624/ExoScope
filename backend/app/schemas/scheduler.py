from pydantic import BaseModel, Field


class SchedulerUpdate(BaseModel):
    interval_seconds: int = Field(
        gt=59,
        description="Execution interval in seconds for the background ETL job (minimum 60s).",
        examples=[3600],
    )


class SchedulerStatus(BaseModel):
    running: bool
    interval_seconds: int | None = None
    next_run: str | None = None
    next_run_time: str | None = None


class SchedulerStatusResponse(BaseModel):
    status: str = "ok"
    scheduler: SchedulerStatus
