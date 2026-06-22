from app.etl.extract import extract
from app.etl.transform import transform
from app.etl.load import load

def run_etl():
    data = extract()
    planets = transform(data)
    load(planets)

    print(f"ETL completo: {len(planets)} planetas cargados")

if __name__ == "__main__":
    run_etl()