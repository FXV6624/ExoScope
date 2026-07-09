"""Unit tests for ETLMetrics."""

import pytest
from datetime import datetime, timezone, timedelta

from app.etl.metrics import ETLMetrics
from app.etl.schemas import LoadResult


def _make_metrics_with_times(total_s=10, extract_s=3, transform_s=4, load_s=3):
    now = datetime.now(timezone.utc)
    m = ETLMetrics(extracted=10, transformed=9, load_result=LoadResult(), errors=[])
    m.started_at = now
    m.finished_at = now + timedelta(seconds=total_s)
    m.extract_start = now
    m.extract_end = now + timedelta(seconds=extract_s)
    m.transform_start = now + timedelta(seconds=extract_s)
    m.transform_end = now + timedelta(seconds=extract_s + transform_s)
    m.load_start = now + timedelta(seconds=extract_s + transform_s)
    m.load_end = now + timedelta(seconds=extract_s + transform_s + load_s)
    return m


class TestETLMetrics:

    def test_total_duration(self):
        m = _make_metrics_with_times(total_s=10)
        assert m.total_duration() == pytest.approx(10.0, abs=0.01)

    def test_extract_duration(self):
        m = _make_metrics_with_times(extract_s=3)
        assert m.extract_duration() == pytest.approx(3.0, abs=0.01)

    def test_transform_duration(self):
        m = _make_metrics_with_times(transform_s=4)
        assert m.transform_duration() == pytest.approx(4.0, abs=0.01)

    def test_load_duration(self):
        m = _make_metrics_with_times(load_s=3)
        assert m.load_duration() == pytest.approx(3.0, abs=0.01)

    def test_total_duration_zero_when_no_timestamps(self):
        m = ETLMetrics(extracted=0, transformed=0, load_result=LoadResult(), errors=[])
        assert m.total_duration() == 0.0

    def test_extract_duration_zero_when_no_timestamps(self):
        m = ETLMetrics(extracted=0, transformed=0, load_result=LoadResult(), errors=[])
        assert m.extract_duration() == 0.0

    def test_transform_duration_zero_when_no_timestamps(self):
        m = ETLMetrics(extracted=0, transformed=0, load_result=LoadResult(), errors=[])
        assert m.transform_duration() == 0.0

    def test_load_duration_zero_when_no_timestamps(self):
        m = ETLMetrics(extracted=0, transformed=0, load_result=LoadResult(), errors=[])
        assert m.load_duration() == 0.0

    def test_errors_list_default_empty(self):
        m = ETLMetrics(extracted=0, transformed=0, load_result=LoadResult(), errors=[])
        assert m.errors == []

    def test_errors_can_be_appended(self):
        m = ETLMetrics(extracted=0, transformed=0, load_result=LoadResult(), errors=[])
        m.errors.append("Something went wrong")
        assert len(m.errors) == 1

    def test_load_result_default(self):
        m = ETLMetrics(extracted=5, transformed=5, load_result=LoadResult(), errors=[])
        assert m.load_result.attempted == 0
        assert m.load_result.inserted == 0
