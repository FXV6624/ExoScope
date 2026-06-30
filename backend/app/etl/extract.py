from typing import List
import requests
from app.schemas.exoplanet import ExoplanetRaw

URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"

def extract(limit: int | None = None) -> List[ExoplanetRaw]:
    """
    Extract raw exoplanet data from NASA TAP API.
    Aplica el límite directamente en la consulta ADQL (Extract) de forma determinista.
    """

    columns = ("pl_name, hostname, discoverymethod, disc_year, pl_orbper, pl_rade, pl_masse, sy_dist")
    select_clause = f"SELECT TOP {limit} {columns}" if limit is not None else f"SELECT {columns}"
    query = f"{select_clause} FROM pscomppars ORDER BY disc_year DESC, pl_name"

    params = {"query": query, "format": "json"}
    response = requests.get(URL, params=params)
    response.raise_for_status()
    data = response.json()
    
    return [ExoplanetRaw(**row) for row in data]