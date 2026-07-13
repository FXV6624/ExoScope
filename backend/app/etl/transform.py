import logging
from app.models import ExoplanetBase
from app.schemas.exoplanet import ExoplanetRaw

logger = logging.getLogger(__name__)

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
                discovery_year=row.disc_year,
                discovery_method=row.discoverymethod,
                planet_radius=row.pl_rade,
                planet_mass=row.pl_masse,
                planet_density=row.pl_dens,
                equilibrium_temperature=row.pl_eqt,
                incident_flux=row.pl_insol,
                orbital_period=row.pl_orbper,
                semi_major_axis=row.pl_orbsmax,
                orbital_eccentricity=row.pl_orbeccen,
                stellar_effective_temperature=row.st_teff,
                stellar_radius=row.st_rad,
                stellar_mass=row.st_mass,
                stellar_luminosity=row.st_lum,
                stellar_age=row.st_age,
                distance_from_earth=row.sy_dist,
                system_planet_count=row.sy_pnum,
                system_star_count=row.sy_snum,
            )
            exoplanets.append(planet)

        except Exception as e:
            logger.error(f"Error transforming row {row.pl_name}: {e}")

    return exoplanets
