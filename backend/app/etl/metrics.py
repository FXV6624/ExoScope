from pydantic import Field
from datetime import datetime


from app.etl.base_report import ETLBaseReport


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