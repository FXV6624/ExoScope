from enum import Enum

from pydantic import BaseModel


class ExportFormat(str, Enum):
    CSV = "csv"
    JSON = "json"
    PARQUET = "parquet"


class ExportRequest(BaseModel):
    format: ExportFormat = ExportFormat.CSV
    filename: str = "exoplanets"
    fields: list[str] | None = None
    compress: bool = False
