from sqlmodel import Session
from app.core.db import engine
from app.models import Exoplanet
from sqlalchemy.dialects.postgresql import insert


def load(planets):
    with Session(engine) as session:

        stmt = insert(Exoplanet).values([
            {
                "planet_name": p.planet_name,
                "host_star": p.host_star,
                "discovery_method": p.discovery_method,
                "discovery_year": p.discovery_year,
                "orbital_period": p.orbital_period,
                "planet_radius": p.planet_radius,
                "planet_mass": p.planet_mass,
                "distance_parsecs": p.distance_parsecs,
            }
            for p in planets
        ])

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