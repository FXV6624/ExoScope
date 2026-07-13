"""Integration tests for ETL run repository (save_etl_run) - full DB round-trip."""

import pytest
from sqlmodel import Session, delete, select

from app.etl.run_repository import save_etl_run
from app.models import ETLRun
from tests.factories import make_etl_report, make_load_result


@pytest.fixture(autouse=True)
def clean_etl_runs(db: Session):
    db.execute(delete(ETLRun))
    db.commit()
    yield
    db.execute(delete(ETLRun))
    db.commit()


class TestSaveETLRunIntegration:
    def test_persists_complete_report(self, db: Session):
        report = make_etl_report(extracted=200, transformed=195)
        report.load_result = make_load_result(
            attempted=195, inserted=180, updated=10, skipped=5
        )
        save_etl_run(db, report)

        run = db.exec(select(ETLRun)).first()
        assert run is not None
        assert run.extracted == 200
        assert run.transformed == 195
        assert run.load_result["inserted"] == 180
        assert run.load_result["updated"] == 10

    def test_timing_fields_persisted(self, db: Session):
        report = make_etl_report()
        save_etl_run(db, report)

        run = db.exec(select(ETLRun)).first()
        assert run.total_time >= 0
        assert run.extract_time >= 0
        assert run.transform_time >= 0
        assert run.load_time >= 0

    def test_started_and_finished_at_persisted(self, db: Session):
        report = make_etl_report()
        save_etl_run(db, report)

        run = db.exec(select(ETLRun)).first()
        assert run.started_at is not None
        assert run.finished_at is not None

    def test_errors_joined_with_pipe(self, db: Session):
        report = make_etl_report(errors=["Error A", "Error B"])
        save_etl_run(db, report)

        run = db.exec(select(ETLRun)).first()
        assert "Error A" in run.errors
        assert "Error B" in run.errors

    def test_success_true_when_no_errors(self, db: Session):
        report = make_etl_report(errors=[])
        save_etl_run(db, report)

        run = db.exec(select(ETLRun)).first()
        assert run.success is True

    def test_success_false_when_errors(self, db: Session):
        report = make_etl_report(errors=["something failed"])
        save_etl_run(db, report)

        run = db.exec(select(ETLRun)).first()
        assert run.success is False
