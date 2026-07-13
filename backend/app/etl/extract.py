
import requests

from app.schemas.exoplanet import ExoplanetRaw

URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"

def extract(limit: int | None = None) -> list[ExoplanetRaw]:
    """
    Extract raw exoplanet data from NASA TAP API.
    Aplica el límite directamente en la consulta ADQL (Extract) de forma determinista.
    """

    columns = ", ".join([
    "pl_name",
    "hostname",
    "disc_year",
    "discoverymethod",
    "pl_rade",
    "pl_masse",
    "pl_dens",
    "pl_eqt",
    "pl_insol",
    "pl_orbper",
    "pl_orbsmax",
    "pl_orbeccen",
    "st_teff",
    "st_rad",
    "st_mass",
    "st_lum",
    "st_age",
    "sy_dist",
    "sy_pnum",
    "sy_snum",
])
    select_clause = f"SELECT TOP {limit} {columns}" if limit is not None else f"SELECT {columns}"
    query = f"{select_clause} FROM pscomppars ORDER BY disc_year DESC, pl_name"

    params = {"query": query, "format": "json"}
    response = requests.get(URL, params=params)
    response.raise_for_status()
    data = response.json()

    return [ExoplanetRaw(**row) for row in data]
