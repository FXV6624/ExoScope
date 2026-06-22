from pydantic import BaseModel

class Exoplanet(BaseModel):
    planet_name: str
    host_star: str | None = None
    discovery_method: str | None = None
    discovery_year: int | None = None
    orbital_period: float | None = None
    planet_radius: float | None = None
    planet_mass: float | None = None
    distance_parsecs: float | None = None
