from requests import session
from sqlmodel import Session
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import delete

from app.models import Exoplanet
from .base import LoadStrategy
from app.etl.schemas import LoadResult
from .statement import build_insert_stmt, BATCH_SIZE

class ReloadLoadStrategy(LoadStrategy):

    def load(self, session: Session, planets: list[Exoplanet]) -> LoadResult:

        session.exec(delete(Exoplanet))
        session.flush()
        
        for i in range(0, len(planets), BATCH_SIZE):
            batch = planets[i:i + BATCH_SIZE]
            stmt = build_insert_stmt(batch)
            session.exec(stmt)

        session.commit()
        
        return LoadResult(attempted=len(planets), inserted=len(planets), updated=0, skipped=0)