from pydantic import BaseModel, Field

from app.etl.enums import LoadMode


class ETLConfig(BaseModel):
    limit: int | None = Field(
        default=None,
        gt=0,
        description="Max number of records to extract. None = no limit",
    )
    dry_run: bool = False
    persist_run: bool = True
    load_mode: LoadMode = LoadMode.UPSERT
