from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse

from app.api.deps import CurrentUser, SessionDep
from app.core.limiter import limiter
from app.exports.schemas import ExportFormat, ExportRequest
from app.schemas.exoplanet import ExoplanetFilters
from app.services.exports import export_exoplanets

router = APIRouter(prefix="/exports", tags=["exports"])


MEDIA_TYPES = {
    "csv": "text/csv",
    "json": "application/json",
    "parquet": "application/octet-stream",
}


@router.get("/export")
@limiter.limit("10/minute")
def export_exoplanets_endpoint(
    request: Request,  # noqa: ARG001
    session: SessionDep,
    _current_user: CurrentUser,
    format: ExportFormat = ExportFormat.CSV,
    filename: str = "exoplanets",
    fields: Annotated[list[str] | None, Query()] = None,
    compress: bool = False,
    filters: ExoplanetFilters = Depends(),
) -> StreamingResponse:
    """
    Export exoplanets using the selected format.
    """
    export = ExportRequest(
        format=format,
        filename=filename,
        fields=fields,
        compress=compress,
    )

    file = export_exoplanets(session, filters, export)

    extension = "zip" if export.compress else export.format.value

    media_type = (
        "application/zip" if export.compress else MEDIA_TYPES[export.format.value]
    )

    return StreamingResponse(
        file,
        media_type=media_type,
        headers={
            "Content-Disposition": (
                f'attachment; filename="{export.filename}.{extension}"'
            )
        },
    )
