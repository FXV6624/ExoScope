import re
from functools import lru_cache
from typing import cast

import requests


def normalize_planet_name(planet_name: str) -> str:
    """
    Normalize planet name for NASA Images API search query.
    Converts 'Kepler-186 f' -> 'Kepler-186f' (removes space before single-letter suffix).
    """
    cleaned = planet_name.strip()
    return re.sub(r"\s+([b-zB-Z])$", r"\1", cleaned)


@lru_cache(maxsize=4096)
def find_photo_url(planet_name: str) -> str | None:
    """
    Search NASA Images API for a specific exoplanet photo URL.
    Returns the image URL if found, or None if no image is found or on network error.
    """
    search_query = normalize_planet_name(planet_name)
    url = "https://images-api.nasa.gov/search"

    try:
        response = requests.get(
            url, params={"q": search_query, "media_type": "image"}, timeout=2.0
        )
        response.raise_for_status()
        items = response.json().get("collection", {}).get("items", [])
    except Exception:
        return None

    if not items:
        return None

    original_lower = planet_name.lower()
    normalized_lower = search_query.lower()

    for item in items:
        data_list = item.get("data", [])
        if not data_list:
            continue
        data = data_list[0]

        title = data.get("title", "").lower()
        description = data.get("description", "").lower()

        if (
            original_lower in title
            or normalized_lower in title
            or original_lower in description
            or normalized_lower in description
        ):
            for link in item.get("links", []):
                if link.get("rel") == "canonical":
                    return cast(str | None, link.get("href"))

            for link in item.get("links", []):
                if link.get("rel") == "alternate":
                    return cast(str | None, link.get("href"))

    return None
