from pydantic import BaseModel, Field
from datetime import datetime
from app.etl.schemas import LoadResult

class ETLBaseReport(BaseModel):

    extracted: int = 0

    transformed: int = 0

    load_result: LoadResult = Field(default_factory=LoadResult)

    started_at: datetime | None = None
    finished_at: datetime | None = None

    errors: list[str] = Field(default_factory=list)