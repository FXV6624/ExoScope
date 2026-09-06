from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse

from app.api.deps import SessionDep
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


@router.get(
    "/export",
    summary="Export exoplanets dataset",
    response_description="Streamed export file attachment",
    responses={
        200: {
            "content": {
                "text/csv": {},
                "application/json": {},
                "application/octet-stream": {},
                "application/zip": {},
            },
            "description": "Exported data file as attachment stream.",
        }
    },
)
@limiter.limit("1/minute")
def export_exoplanets_endpoint(
    request: Request,  # noqa: ARG001
    session: SessionDep,
    format: ExportFormat = ExportFormat.CSV,
    filename: Annotated[
        str, Query(description="Base name for the generated download file.")
    ] = "exoplanets",
    fields: Annotated[
        list[str] | None,
        Query(
            description="List of fields to include in export (omit to export all fields)."
        ),
    ] = None,
    compress: Annotated[
        bool,
        Query(description="Whether to compress the exported file into a ZIP archive."),
    ] = False,
    filters: ExoplanetFilters = Depends(),
) -> StreamingResponse:
    """
    Export filtered exoplanet data to a downloadable file stream in CSV, JSON, or Parquet format.
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
