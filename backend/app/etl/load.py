import psycopg2

def get_connection():
    return psycopg2.connect(
        host="localhost",
        port=5432,
        database="app",
        user="postgres",
        password="changethis"
    )

def load(planets):
    conn = get_connection()
    cursor = conn.cursor()
    for planet in planets:
        cursor.execute("""
            INSERT INTO exoplanets (
                planet_name,
                host_star,
                discovery_method,
                discovery_year,
                orbital_period,
                planet_radius,
                planet_mass,
                distance_parsecs
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (planet_name, host_star)
            DO NOTHING
            """, (
            planet.planet_name,
            planet.host_star,
            planet.discovery_method,
            planet.discovery_year,
            planet.orbital_period,
            planet.planet_radius,
            planet.planet_mass,
            planet.distance_parsecs
        ))

    conn.commit()
    cursor.close()
    conn.close()