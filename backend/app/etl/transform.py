from app.models import ExoplanetBase, ExoplanetRaw

def transform(data: list[ExoplanetRaw]) -> list[ExoplanetBase]:
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
            print("Validation error:", e)

    return exoplanets