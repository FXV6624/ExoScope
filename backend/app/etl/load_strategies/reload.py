from sqlmodel import Session
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import delete

from app.models import Exoplanet
from .base import LoadStrategy
from app.etl.load_result import LoadResult
from .statement import build_insert_stmt

class ReloadLoadStrategy(LoadStrategy):

    def load(self, session: Session, planets: list[Exoplanet]) -> LoadResult:

        session.exec(delete(Exoplanet))
        session.flush()
        
        stmt = build_insert_stmt(planets)

        session.exec(stmt)
        session.commit()
        return LoadResult(attempted=len(planets), inserted=len(planets), updated=0, skipped=0)