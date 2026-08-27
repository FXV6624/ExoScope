from pydantic import BaseModel, Field


class SchedulerUpdate(BaseModel):
    interval_seconds: int = Field(gt=59)
