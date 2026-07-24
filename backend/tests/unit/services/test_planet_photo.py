"""Unit tests for app/services/planet_photo.py."""

from unittest.mock import MagicMock, patch

from app.services.planet_photo import find_photo_url, normalize_planet_name


class TestPlanetPhotoService:
    def test_normalize_planet_name(self):
        assert normalize_planet_name("Kepler-186 f") == "Kepler-186f"
        assert normalize_planet_name("TRAPPIST-1 e") == "TRAPPIST-1e"
        assert normalize_planet_name("Kepler-22b") == "Kepler-22b"

    def test_returns_none_on_empty_items(self):
        with patch("app.services.planet_photo.requests.get") as mock_get:
            mock_response = MagicMock()
            mock_response.json.return_value = {"collection": {"items": []}}
            mock_get.return_value = mock_response

            url = find_photo_url("NonExistentPlanet123")
            assert url is None

    def test_returns_none_on_network_error(self):
        with patch(
            "app.services.planet_photo.requests.get",
            side_effect=Exception("Connection timed out"),
        ):
            url = find_photo_url("Kepler-22b_error_test")
            assert url is None

    def test_returns_canonical_link_and_normalizes_query(self):
        with patch("app.services.planet_photo.requests.get") as mock_get:
            mock_response = MagicMock()
            mock_response.json.return_value = {
                "collection": {
                    "items": [
                        {
                            "data": [{"title": "Kepler-186f planet illustration"}],
                            "links": [
                                {
                                    "rel": "canonical",
                                    "href": "https://images.nasa.gov/k186f.jpg",
                                }
                            ],
                        }
                    ]
                }
            }
            mock_get.return_value = mock_response

            url = find_photo_url("Kepler-186 f")
            assert url == "https://images.nasa.gov/k186f.jpg"
            mock_get.assert_called_once_with(
                "https://images-api.nasa.gov/search",
                params={"q": "Kepler-186f", "media_type": "image"},
                timeout=2.0,
            )
