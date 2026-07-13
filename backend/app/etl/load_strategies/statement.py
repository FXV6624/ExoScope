from sqlalchemy.dialects.postgresql import insert

from app.models import Exoplanet

BATCH_SIZE = 1000
def build_insert_stmt(planets: list[Exoplanet]):
    return insert(Exoplanet).values([
        {
            "planet_name": p.planet_name,
            "host_star": p.host_star,
            "discovery_year": p.discovery_year,
            "discovery_method": p.discovery_method,
            "planet_radius": p.planet_radius,
            "planet_mass": p.planet_mass,
            "planet_density": p.planet_density,
            "equilibrium_temperature": p.equilibrium_temperature,
            "incident_flux": p.incident_flux,
            "orbital_period": p.orbital_period,
            "semi_major_axis": p.semi_major_axis,
            "orbital_eccentricity": p.orbital_eccentricity,
            "stellar_effective_temperature": p.stellar_effective_temperature,
            "stellar_radius": p.stellar_radius,
            "stellar_mass": p.stellar_mass,
            "stellar_luminosity": p.stellar_luminosity,
            "stellar_age": p.stellar_age,
            "distance_from_earth": p.distance_from_earth,
            "system_planet_count": p.system_planet_count,
            "system_star_count": p.system_star_count,
            "composition": p.composition,
            "composition_confidence": p.composition_confidence,
            "habitability_score": p.habitability_score,
            "habitability_confidence": p.habitability_confidence,
        }
        for p in planets
    ])
