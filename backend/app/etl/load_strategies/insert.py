from sqlmodel import Session
from sqlalchemy.dialects.postgresql import insert

from app.models import Exoplanet
from .base import LoadStrategy
from app.etl.load_result import LoadResult
from .statement import build_insert_stmt, BATCH_SIZE

class InsertLoadStrategy(LoadStrategy):

    def load(self, session: Session, planets: list[Exoplanet]) -> LoadResult:

        inserted = 0

        for i in range(0, len(planets), BATCH_SIZE):
            batch = planets[i:i + BATCH_SIZE]
            stmt = (build_insert_stmt(batch).on_conflict_do_nothing(index_elements=["planet_name", "host_star"])
                    .returning(Exoplanet.id))
            inserted += len(session.exec(stmt).all())

        session.commit()

        return LoadResult(attempted=len(planets),inserted=inserted,updated=0,skipped=len(planets) - inserted,)