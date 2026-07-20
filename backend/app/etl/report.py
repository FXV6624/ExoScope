from __future__ import annotations

from app.etl.base_report import ETLBaseReport
from app.etl.metrics import ETLMetrics


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
