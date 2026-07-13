from sqlalchemy import select, tuple_
from sqlmodel import Session, col

from app.etl.schemas import LoadResult
from app.models import Exoplanet

from .base import LoadStrategy
from .statement import BATCH_SIZE, build_insert_stmt


class UpsertLoadStrategy(LoadStrategy):
    def load(self, session: Session, planets: list[Exoplanet]) -> LoadResult:
        keys = {(p.planet_name, p.host_star) for p in planets}

        existing_query = select(
            col(Exoplanet.planet_name), col(Exoplanet.host_star)
        ).where(tuple_(col(Exoplanet.planet_name), col(Exoplanet.host_star)).in_(keys))

        existing = set(session.exec(existing_query).all())  # type: ignore

        inserted = 0
        updated = 0

        for p in planets:
            key = (p.planet_name, p.host_star)
            if key in existing:
                updated += 1
            else:
                inserted += 1

        for i in range(0, len(planets), BATCH_SIZE):
            batch = planets[i : i + BATCH_SIZE]

            stmt = build_insert_stmt(batch)

            stmt = stmt.on_conflict_do_update(
                index_elements=["planet_name", "host_star"],
                set_={
                    "discovery_year": stmt.excluded.discovery_year,
                    "discovery_method": stmt.excluded.discovery_method,
                    "planet_radius": stmt.excluded.planet_radius,
                    "planet_mass": stmt.excluded.planet_mass,
                    "planet_density": stmt.excluded.planet_density,
                    "equilibrium_temperature": stmt.excluded.equilibrium_temperature,
                    "incident_flux": stmt.excluded.incident_flux,
                    "orbital_period": stmt.excluded.orbital_period,
                    "semi_major_axis": stmt.excluded.semi_major_axis,
                    "orbital_eccentricity": stmt.excluded.orbital_eccentricity,
                    "stellar_effective_temperature": stmt.excluded.stellar_effective_temperature,
                    "stellar_radius": stmt.excluded.stellar_radius,
                    "stellar_mass": stmt.excluded.stellar_mass,
                    "stellar_luminosity": stmt.excluded.stellar_luminosity,
                    "stellar_age": stmt.excluded.stellar_age,
                    "distance_from_earth": stmt.excluded.distance_from_earth,
                    "system_planet_count": stmt.excluded.system_planet_count,
                    "system_star_count": stmt.excluded.system_star_count,
                    "composition": stmt.excluded.composition,
                    "composition_confidence": stmt.excluded.composition_confidence,
                    "habitability_score": stmt.excluded.habitability_score,
                    "habitability_confidence": stmt.excluded.habitability_confidence,
                },
            )

            session.exec(stmt)

        session.commit()

        return LoadResult(
            attempted=len(planets),
            inserted=inserted,
            updated=updated,
            skipped=0,
        )
