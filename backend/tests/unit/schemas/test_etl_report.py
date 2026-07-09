"""Unit tests for ETLReport schema."""

import pytest
from datetime import datetime, timezone, timedelta

from app.etl.report import ETLReport
from app.etl.metrics import ETLMetrics
from app.etl.schemas import LoadResult
from tests.factories import make_etl_metrics, make_load_result


class TestETLReport:

    def test_from_metrics_basic(self):
        metrics = make_etl_metrics(extracted=10, transformed=9)
        report = ETLReport.from_metrics(metrics)
        assert report.extracted == 10
        assert report.transformed == 9
        assert report.errors == []

    def test_from_metrics_with_errors(self):
        metrics = make_etl_metrics(errors=["Connection failed"])
        report = ETLReport.from_metrics(metrics)
        assert "Connection failed" in report.errors

    def test_duration_seconds_computed(self):
        now = datetime.now(timezone.utc)
        metrics = ETLMetrics(
            extracted=5,
            transformed=5,
            load_result=LoadResult(),
            errors=[],
        )
        metrics.started_at = now
        metrics.finished_at = now + timedelta(seconds=5)
        metrics.extract_start = now
        metrics.extract_end = now + timedelta(seconds=2)
        metrics.transform_start = now + timedelta(seconds=2)
        metrics.transform_end = now + timedelta(seconds=4)
        metrics.load_start = now + timedelta(seconds=4)
        metrics.load_end = now + timedelta(seconds=5)

        report = ETLReport.from_metrics(metrics)
        assert report.duration_seconds == pytest.approx(5.0, abs=0.1)
        assert report.extract_time == pytest.approx(2.0, abs=0.1)
        assert report.transform_time == pytest.approx(2.0, abs=0.1)
        assert report.load_time == pytest.approx(1.0, abs=0.1)

    def test_load_result_propagated(self):
        metrics = make_etl_metrics()
        metrics.load_result = make_load_result(attempted=9, inserted=7, updated=2, skipped=0)
        report = ETLReport.from_metrics(metrics)
        assert report.load_result.inserted == 7
        assert report.load_result.updated == 2

    def test_default_duration_zero_when_no_timestamps(self):
        metrics = ETLMetrics(extracted=0, transformed=0, load_result=LoadResult(), errors=[])
        report = ETLReport.from_metrics(metrics)
        assert report.duration_seconds == 0.0
        assert report.extract_time == 0.0
        assert report.transform_time == 0.0
        assert report.load_time == 0.0

    def test_serialization(self):
        metrics = make_etl_metrics()
        report = ETLReport.from_metrics(metrics)
        d = report.model_dump()
        assert "extracted" in d
        assert "transformed" in d
        assert "load_result" in d
        assert "duration_seconds" in d
        assert "errors" in d
