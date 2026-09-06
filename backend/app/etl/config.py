from pydantic import BaseModel, Field

from app.etl.enums import LoadMode


class ETLConfig(BaseModel):
    limit: int | None = Field(
        default=None,
        gt=0,
        description="Maximum number of records to extract from NASA TAP service (None = full extraction).",
    )
    dry_run: bool = Field(
        default=False,
        description="If True, runs extraction and transformation without persisting to database.",
    )
    persist_run: bool = Field(
        default=True,
        description="Whether to save the execution metrics and summary in the database.",
    )
    load_mode: LoadMode = Field(
        default=LoadMode.UPSERT,
        description="Database load strategy: upsert, insert, or reload.",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "limit": 100,
                    "dry_run": False,
                    "persist_run": True,
                    "load_mode": "upsert",
                }
            ]
        }
    }
