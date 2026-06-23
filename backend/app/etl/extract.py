import requests
from app.schemas.exoplanet import ExoplanetRaw

URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"

QUERY = """SELECT pl_name, hostname, discoverymethod, disc_year,
       pl_orbper, pl_rade, pl_masse, sy_dist FROM pscomppars"""

def extract():
       response  = requests.get(URL, params={"query": QUERY, "format": "json"})
       response.raise_for_status()
       data = response.json()
       return [ExoplanetRaw(**row) for row in data]