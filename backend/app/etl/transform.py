from app.models import ExoplanetBase
from app.schemas.exoplanet import ExoplanetRaw

def transform(data: list[ExoplanetRaw]) -> list[ExoplanetBase]:
    """
    Transform raw API data into validated internal model.
    """
    exoplanets = []
    for row in data:
        try:
            planet = ExoplanetBase(
                planet_name=row.pl_name,
                host_star=row.hostname,
                discovery_method=row.discoverymethod,
                discovery_year=row.disc_year,
                orbital_period=row.pl_orbper,
                planet_radius=row.pl_rade,
                planet_mass=row.pl_masse,
                distance_parsecs=row.sy_dist,
            )
            exoplanets.append(planet)

        except Exception as e:
             print(f"Validation error for {row.pl_name}: {e}")

    return exoplanets