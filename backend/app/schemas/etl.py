import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.etl.report import ETLReport


class ETLRunItem(BaseModel):
    id: uuid.UUID
    started_at: datetime
    finished_at: datetime | None = None
    extracted: int = 0
    transformed: int = 0
    load_result: dict[str, Any] = Field(default_factory=dict)
    extract_time: float = 0.0
    transform_time: float = 0.0
    load_time: float = 0.0
    total_time: float = 0.0
    success: bool = True
    errors: str = ""


class ETLRunResponse(BaseModel):
    status: str = "ok"
    report: ETLReport


class ETLLastRunResponse(BaseModel):
    status: str = "ok"
    report: ETLRunItem | None = None


class ETLRunsResponse(BaseModel):
    status: str = "ok"
    count: int
    runs: list[ETLRunItem]
