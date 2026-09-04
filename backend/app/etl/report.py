from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.etl.schemas import LoadResult


class ETLBaseReport(BaseModel):
    extracted: int = 0
    transformed: int = 0
    load_result: LoadResult = Field(default_factory=LoadResult)
    started_at: datetime | None = None
    finished_at: datetime | None = None
    success: bool = True
    errors: list[str] = Field(default_factory=list)


class ETLMetrics(ETLBaseReport):
    extract_start: datetime | None = None
    extract_end: datetime | None = None

    transform_start: datetime | None = None
    transform_end: datetime | None = None

    load_start: datetime | None = None
    load_end: datetime | None = None

    def total_duration(self) -> float:
        if self.started_at and self.finished_at:
            return (self.finished_at - self.started_at).total_seconds()
        return 0.0

    def extract_duration(self) -> float:
        if self.extract_start and self.extract_end:
            return (self.extract_end - self.extract_start).total_seconds()
        return 0.0

    def transform_duration(self) -> float:
        if self.transform_start and self.transform_end:
            return (self.transform_end - self.transform_start).total_seconds()
        return 0.0

    def load_duration(self) -> float:
        if self.load_start and self.load_end:
            return (self.load_end - self.load_start).total_seconds()
        return 0.0


class ETLReport(ETLBaseReport):
    duration_seconds: float = 0.0

    extract_time: float = 0.0
    transform_time: float = 0.0
    load_time: float = 0.0

    @classmethod
    def from_metrics(cls, metrics: ETLMetrics) -> ETLReport:
        return cls(
            started_at=metrics.started_at,
            finished_at=metrics.finished_at,
            extracted=metrics.extracted,
            transformed=metrics.transformed,
            load_result=metrics.load_result,
            duration_seconds=metrics.total_duration(),
            extract_time=metrics.extract_duration(),
            transform_time=metrics.transform_duration(),
            load_time=metrics.load_duration(),
            success=not metrics.errors,
            errors=metrics.errors,
        )
