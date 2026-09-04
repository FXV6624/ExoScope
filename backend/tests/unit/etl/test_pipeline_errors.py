from unittest.mock import MagicMock, patch

from app.etl.config import ETLConfig
from app.etl.pipeline import ExoplanetETL


def test_pipeline_transform_failure():
    session = MagicMock()
    config = ETLConfig(limit=10, dry_run=False, persist_run=False)
    pipeline = ExoplanetETL(session=session, config=config)

    with (
        patch("app.etl.pipeline.extract", return_value=[{"pl_name": "Kepler-10b"}]),
        patch(
            "app.etl.pipeline.transform",
            side_effect=ValueError("Transform parsing error"),
        ),
    ):
        report = pipeline.run()

    assert len(report.errors) == 1
    assert "Transform parsing error" in report.errors[0]
    assert report.transformed == 0


def test_pipeline_enrich_failure():
    session = MagicMock()
    config = ETLConfig(limit=10, dry_run=False, persist_run=False)
    pipeline = ExoplanetETL(session=session, config=config)

    with (
        patch("app.etl.pipeline.extract", return_value=[{"pl_name": "Kepler-10b"}]),
        patch("app.etl.pipeline.transform", return_value=[MagicMock()]),
        patch(
            "app.etl.pipeline.enrich",
            side_effect=RuntimeError("Enrichment calculation error"),
        ),
    ):
        report = pipeline.run()

    assert len(report.errors) == 1
    assert "Enrichment calculation error" in report.errors[0]


def test_pipeline_load_failure():
    session = MagicMock()
    config = ETLConfig(limit=10, dry_run=False, persist_run=False)
    pipeline = ExoplanetETL(session=session, config=config)

    mock_planet = MagicMock()
    mock_planet.model_dump.return_value = {
        "planet_name": "Kepler-10b",
        "hostname": "Kepler-10",
        "discovery_method": "Transit",
        "disc_year": 2011,
    }

    with (
        patch("app.etl.pipeline.extract", return_value=[{"pl_name": "Kepler-10b"}]),
        patch("app.etl.pipeline.transform", return_value=[mock_planet]),
        patch("app.etl.pipeline.enrich", return_value=[mock_planet]),
        patch(
            "app.etl.pipeline.load", side_effect=Exception("Database insert deadlock")
        ),
    ):
        report = pipeline.run()

    assert len(report.errors) == 1
    assert "Database insert deadlock" in report.errors[0]


def test_pipeline_dry_run_mode():
    session = MagicMock()
    config = ETLConfig(limit=10, dry_run=True, persist_run=False)
    pipeline = ExoplanetETL(session=session, config=config)

    mock_planet = MagicMock()
    mock_planet.model_dump.return_value = {
        "planet_name": "Kepler-10b",
        "hostname": "Kepler-10",
        "discovery_method": "Transit",
        "disc_year": 2011,
    }

    with (
        patch("app.etl.pipeline.extract", return_value=[{"pl_name": "Kepler-10b"}]),
        patch("app.etl.pipeline.transform", return_value=[mock_planet]),
        patch("app.etl.pipeline.enrich", return_value=[mock_planet]),
        patch("app.etl.pipeline.load") as mock_load,
    ):
        report = pipeline.run()
        mock_load.assert_not_called()

    assert len(report.errors) == 0
    assert report.load_result.inserted == 0
