from sqlmodel import Session
from sqlalchemy.dialects.postgresql import insert

from app.models import Exoplanet
from .base import LoadStrategy


class InsertLoadStrategy(LoadStrategy):

    def load(self, session: Session, planets: list[Exoplanet]) -> int:

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
        ]).on_conflict_do_nothing(
            index_elements=["planet_name", "host_star"]
        )

        session.exec(stmt)
        session.commit()
        return len(planets)