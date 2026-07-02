from sqlalchemy import tuple_, select
from sqlalchemy.dialects.postgresql import insert
from sqlmodel import Session

from app.models import Exoplanet
from app.etl.load_result import LoadResult
from .base import LoadStrategy
from .statement import build_insert_stmt


class UpsertLoadStrategy(LoadStrategy):

    def load(self, session: Session, planets: list[Exoplanet]) -> LoadResult:

        keys = {(p.planet_name, p.host_star) for p in planets}

        existing_query = select(Exoplanet.planet_name, Exoplanet.host_star).where(
            tuple_(Exoplanet.planet_name, Exoplanet.host_star).in_(keys))
        
        existing = set(session.exec(existing_query).all())

        inserted = 0
        updated = 0

        for p in planets:
            key = (p.planet_name, p.host_star)
            if key in existing:
                updated += 1
            else:
                inserted += 1

        stmt = build_insert_stmt(planets)

        stmt = stmt.on_conflict_do_update(
            index_elements=["planet_name", "host_star"],
            set_={
                "discovery_method": stmt.excluded.discovery_method,
                "discovery_year": stmt.excluded.discovery_year,
                "orbital_period": stmt.excluded.orbital_period,
                "planet_radius": stmt.excluded.planet_radius,
                "planet_mass": stmt.excluded.planet_mass,
                "distance_parsecs": stmt.excluded.distance_parsecs,
            },
        )

        session.exec(stmt)
        session.commit()

        return LoadResult(attempted=len(planets),inserted=inserted,updated=updated,skipped=0,)