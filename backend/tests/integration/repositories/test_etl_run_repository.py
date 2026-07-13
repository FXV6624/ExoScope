"""Integration tests for ETLRun repository (save_etl_run)."""

import pytest
from sqlmodel import Session, delete, select

from app.etl.run_repository import save_etl_run
from app.models import ETLRun
from tests.factories import make_etl_report


@pytest.fixture(autouse=True)
def clean_etl_runs(db: Session):
    yield
    db.execute(delete(ETLRun))
    db.commit()


class TestSaveETLRun:
    def test_saves_run_to_db(self, db: Session):
        report = make_etl_report(extracted=100, transformed=95)
        save_etl_run(db, report)

        runs = db.exec(select(ETLRun)).all()
        assert len(runs) == 1
        run = runs[0]
        assert run.extracted == 100
        assert run.transformed == 95

    def test_saved_run_has_uuid_id(self, db: Session):
        report = make_etl_report()
        save_etl_run(db, report)

        run = db.exec(select(ETLRun)).first()
        assert run is not None
        assert run.id is not None

    def test_success_field_true_when_no_errors(self, db: Session):
        report = make_etl_report(errors=[])
        save_etl_run(db, report)

        run = db.exec(select(ETLRun)).first()
        assert run.success is True

    def test_success_field_false_when_errors_exist(self, db: Session):
        report = make_etl_report(errors=["Connection refused"])
        save_etl_run(db, report)

        run = db.exec(select(ETLRun)).first()
        assert run.success is False
        assert "Connection refused" in run.errors

    def test_load_result_persisted_as_jsonb(self, db: Session):
        report = make_etl_report(extracted=50, transformed=48)
        save_etl_run(db, report)

        run = db.exec(select(ETLRun)).first()
        assert isinstance(run.load_result, dict)
        assert "attempted" in run.load_result

    def test_multiple_runs_saved(self, db: Session):
        for _ in range(3):
            report = make_etl_report()
            save_etl_run(db, report)

        runs = db.exec(select(ETLRun)).all()
        assert len(runs) == 3
