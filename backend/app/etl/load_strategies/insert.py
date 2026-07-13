from sqlmodel import Session

from app.etl.schemas import LoadResult
from app.models import Exoplanet

from .base import LoadStrategy
from .statement import BATCH_SIZE, build_insert_stmt


class InsertLoadStrategy(LoadStrategy):
    def load(self, session: Session, planets: list[Exoplanet]) -> LoadResult:
        inserted = 0

        for i in range(0, len(planets), BATCH_SIZE):
            batch = planets[i : i + BATCH_SIZE]
            stmt = (
                build_insert_stmt(batch)
                .on_conflict_do_nothing(index_elements=["planet_name", "host_star"])
                .returning(Exoplanet.id)
            )
            inserted += len(session.exec(stmt).all())

        session.commit()

        return LoadResult(
            attempted=len(planets),
            inserted=inserted,
            updated=0,
            skipped=len(planets) - inserted,
        )
