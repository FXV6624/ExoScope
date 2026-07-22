import zipfile
from io import BytesIO

from fastapi import HTTPException
from sqlmodel import Session

from app.exports.schemas import ExportRequest
from app.exports.strategies.factory import ExportStrategyFactory
from app.models import Exoplanet
from app.repositories.exports import get_exoplanets_for_export
from app.schemas.exoplanet import ExoplanetFilters


def export_exoplanets(
    session: Session,
    filters: ExoplanetFilters,
    request: ExportRequest,
) -> BytesIO:
    """
    Export exoplanets matching the provided filters.
    """
    if request.fields:
        valid_fields = set(Exoplanet.model_fields)

        invalid_fields = sorted(set(request.fields) - valid_fields)

        if invalid_fields:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid export fields: {', '.join(invalid_fields)}",
            )

    exoplanets = get_exoplanets_for_export(session, filters)

    data = []

    for planet in exoplanets:
        item = planet.model_dump(mode="json")

        if request.fields:
            item = {key: value for key, value in item.items() if key in request.fields}

        data.append(item)

    strategy = ExportStrategyFactory.create(request.format)

    buffer = strategy.export(data, request)

    if not request.compress:
        return buffer

    zip_buffer = BytesIO()

    with zipfile.ZipFile(
        zip_buffer,
        mode="w",
        compression=zipfile.ZIP_DEFLATED,
    ) as zip_file:
        zip_file.writestr(
            f"{request.filename}.{request.format.value}",
            buffer.getvalue(),
        )

    zip_buffer.seek(0)

    return zip_buffer
