from sqlmodel import Session
from sqlalchemy.dialects.postgresql import insert

from app.models import Exoplanet
from .base import LoadStrategy
from app.etl.load_result import LoadResult
from .statement import build_insert_stmt

class InsertLoadStrategy(LoadStrategy):

    def load(self, session: Session, planets: list[Exoplanet]) -> LoadResult:

        stmt = (build_insert_stmt(planets)
                .on_conflict_do_nothing(index_elements=["planet_name", "host_star"])
                .returning(Exoplanet.id))

        result = session.exec(stmt).all()
        inserted = len(result)
        session.commit()
        return LoadResult(attempted=len(planets),inserted=inserted,updated=0,skipped=len(planets) - inserted,)