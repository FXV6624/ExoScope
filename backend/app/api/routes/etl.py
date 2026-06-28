from fastapi import APIRouter, Depends
from app.api.deps import SessionDep, get_current_active_superuser
from app.etl.main import run_etl

router = APIRouter(prefix="/etl", tags=["etl"])


@router.post("/run", dependencies=[Depends(get_current_active_superuser)])
def run_exoplanet_etl(session: SessionDep):
    """
    Run ETL process for exoplanets (superuser only)
    """
    report = run_etl(session)
    return {"status": "ok","report": report.model_dump()}