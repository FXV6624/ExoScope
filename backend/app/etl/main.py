from extract import extract
from transform import transform
from load import load

def run_etl():
    data = extract()
    planets = transform(data)
    load(planets)

    print(f"ETL completo: {len(planets)} planetas cargados")

if __name__ == "__main__":
    run_etl()