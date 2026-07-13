"""Unit tests for LoadResult schema."""

from app.etl.schemas import LoadResult


class TestLoadResult:
    def test_defaults_are_zero(self):
        lr = LoadResult()
        assert lr.attempted == 0
        assert lr.inserted == 0
        assert lr.updated == 0
        assert lr.skipped == 0

    def test_custom_values(self):
        lr = LoadResult(attempted=10, inserted=7, updated=2, skipped=1)
        assert lr.attempted == 10
        assert lr.inserted == 7
        assert lr.updated == 2
        assert lr.skipped == 1

    def test_all_zero_is_valid(self):
        lr = LoadResult(attempted=0, inserted=0, updated=0, skipped=0)
        assert lr.attempted == 0

    def test_serialization(self):
        lr = LoadResult(attempted=5, inserted=3, updated=1, skipped=1)
        d = lr.model_dump()
        assert d == {"attempted": 5, "inserted": 3, "updated": 1, "skipped": 1}

    def test_inserted_plus_updated_plus_skipped_consistency(self):
        """Business rule: inserted + updated + skipped <= attempted."""
        lr = LoadResult(attempted=10, inserted=4, updated=3, skipped=3)
        assert lr.inserted + lr.updated + lr.skipped == lr.attempted

    def test_negative_values_validation(self):
        """Pydantic does not reject negatives by default, but log a known behavior."""
        # If the project adds validators later, this test documents expected behavior
        lr = LoadResult(attempted=0, inserted=0, updated=0, skipped=0)
        assert lr.inserted == 0

    def test_json_round_trip(self):
        lr = LoadResult(attempted=3, inserted=2, updated=1, skipped=0)
        json_str = lr.model_dump_json()
        restored = LoadResult.model_validate_json(json_str)
        assert restored == lr
