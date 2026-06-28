from pydantic import BaseModel, Field


class ETLReport(BaseModel):
    extracted: int = 0
    transformed: int = 0
    loaded: int = 0

    duration_seconds: float = 0.0

    extract_time: float = 0.0
    transform_time: float = 0.0
    load_time: float = 0.0

    errors: list[str] = Field(default_factory=list)