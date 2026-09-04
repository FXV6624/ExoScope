import json

import pyarrow.parquet as pq
import pytest

from app.exports.schemas import ExportFormat, ExportRequest
from app.exports.strategies.csv import CsvExportStrategy
from app.exports.strategies.factory import ExportStrategyFactory
from app.exports.strategies.json import JsonExportStrategy
from app.exports.strategies.parquet import ParquetExportStrategy


@pytest.fixture
def sample_data():
    return [
        {"planet_name": "Kepler-22b", "radius_earth": 2.4, "is_habitable": True},
        {
            "planet_name": "Proxima Centauri b",
            "radius_earth": 1.07,
            "is_habitable": True,
        },
    ]


def test_csv_export_strategy_with_data(sample_data):
    strategy = CsvExportStrategy()
    request = ExportRequest(format=ExportFormat.CSV, filename="planets")
    buffer = strategy.export(sample_data, request)

    content = buffer.getvalue().decode("utf-8")
    assert "planet_name,radius_earth,is_habitable" in content
    assert "Kepler-22b" in content
    assert "Proxima Centauri b" in content


def test_csv_export_strategy_empty_data():
    strategy = CsvExportStrategy()
    request = ExportRequest(format=ExportFormat.CSV, filename="planets")
    buffer = strategy.export([], request)

    content = buffer.getvalue().decode("utf-8")
    assert content == ""


def test_json_export_strategy(sample_data):
    strategy = JsonExportStrategy()
    request = ExportRequest(format=ExportFormat.JSON, filename="planets")
    buffer = strategy.export(sample_data, request)

    content = buffer.getvalue().decode("utf-8")
    parsed = json.loads(content)
    assert len(parsed) == 2
    assert parsed[0]["planet_name"] == "Kepler-22b"


def test_parquet_export_strategy(sample_data):
    strategy = ParquetExportStrategy()
    request = ExportRequest(format=ExportFormat.PARQUET, filename="planets")
    buffer = strategy.export(sample_data, request)

    table = pq.read_table(buffer)
    assert table.num_rows == 2
    assert "planet_name" in table.column_names


def test_export_strategy_factory():
    csv_strat = ExportStrategyFactory.create(ExportFormat.CSV)
    assert isinstance(csv_strat, CsvExportStrategy)

    json_strat = ExportStrategyFactory.create(ExportFormat.JSON)
    assert isinstance(json_strat, JsonExportStrategy)

    parquet_strat = ExportStrategyFactory.create(ExportFormat.PARQUET)
    assert isinstance(parquet_strat, ParquetExportStrategy)
