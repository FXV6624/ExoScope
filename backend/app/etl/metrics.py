from pydantic import BaseModel, Field
from datetime import datetime


class ETLMetrics(BaseModel):
    extracted: int = 0
    transformed: int = 0
    loaded: int = 0

    extract_start: datetime | None = None
    extract_end: datetime | None = None

    transform_start: datetime | None = None
    transform_end: datetime | None = None

    load_start: datetime | None = None
    load_end: datetime | None = None

    start_time: datetime | None = None
    end_time: datetime | None = None

    errors: list[str] = Field(default_factory=list)

    def total_duration(self) -> float:
        if self.start_time and self.end_time:
            return (self.end_time - self.start_time).total_seconds()
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