from pydantic import BaseModel

class LoadResult(BaseModel):
    attempted: int = 0
    inserted: int = 0
    updated: int = 0
    skipped: int = 0