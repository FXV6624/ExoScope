"""Integration tests for ETL extract step."""

from unittest.mock import MagicMock, patch

import pytest

from app.etl.extract import extract
from app.schemas.exoplanet import ExoplanetRaw

NASA_SAMPLE = [
    {
        "pl_name": "Kepler-22b",
        "hostname": "Kepler-22",
        "discoverymethod": "Transit",
        "disc_year": 2011,
        "pl_orbper": 289.8,
        "pl_rade": 2.4,
        "pl_masse": None,
        "sy_dist": 190.0,
    },
    {
        "pl_name": "51 Peg b",
        "hostname": "51 Peg",
        "discoverymethod": "Radial Velocity",
        "disc_year": 1995,
        "pl_orbper": 4.23,
        "pl_rade": None,
        "pl_masse": 0.46,
        "sy_dist": 15.6,
    },
]


class TestExtract:

    def test_returns_list_of_exoplanet_raw(self):
        mock_response = MagicMock()
        mock_response.json.return_value = NASA_SAMPLE
        mock_response.raise_for_status = MagicMock()

        with patch("app.etl.extract.requests.get", return_value=mock_response):
            result = extract(limit=2)

        assert isinstance(result, list)
        assert len(result) == 2
        assert all(isinstance(r, ExoplanetRaw) for r in result)

    def test_limit_added_to_query(self):
        mock_response = MagicMock()
        mock_response.json.return_value = []
        mock_response.raise_for_status = MagicMock()

        with patch("app.etl.extract.requests.get", return_value=mock_response) as mock_get:
            extract(limit=100)
            call_params = mock_get.call_args[1]["params"]
            assert "TOP 100" in call_params["query"]

    def test_no_limit_omits_top_clause(self):
        mock_response = MagicMock()
        mock_response.json.return_value = []
        mock_response.raise_for_status = MagicMock()

        with patch("app.etl.extract.requests.get", return_value=mock_response) as mock_get:
            extract(limit=None)
            call_params = mock_get.call_args[1]["params"]
            assert "TOP" not in call_params["query"]

    def test_http_error_propagates(self):
        import requests
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = requests.HTTPError("503")

        with patch("app.etl.extract.requests.get", return_value=mock_response):
            with pytest.raises(requests.HTTPError):
                extract()

    def test_field_mapping_from_nasa_api(self):
        mock_response = MagicMock()
        mock_response.json.return_value = [NASA_SAMPLE[0]]
        mock_response.raise_for_status = MagicMock()

        with patch("app.etl.extract.requests.get", return_value=mock_response):
            result = extract()

        planet = result[0]
        assert planet.pl_name == "Kepler-22b"
        assert planet.hostname == "Kepler-22"
        assert planet.disc_year == 2011

    def test_query_format_json(self):
        mock_response = MagicMock()
        mock_response.json.return_value = []
        mock_response.raise_for_status = MagicMock()

        with patch("app.etl.extract.requests.get", return_value=mock_response) as mock_get:
            extract()
            call_params = mock_get.call_args[1]["params"]
            assert call_params["format"] == "json"

    def test_empty_response_returns_empty_list(self):
        mock_response = MagicMock()
        mock_response.json.return_value = []
        mock_response.raise_for_status = MagicMock()

        with patch("app.etl.extract.requests.get", return_value=mock_response):
            result = extract()
        assert result == []
