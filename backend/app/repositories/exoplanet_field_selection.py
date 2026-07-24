from typing import Any

from sqlalchemy.orm import load_only
from sqlmodel.sql.expression import SelectOfScalar

from app.core.enums.exoplanet import ExoplanetField
from app.models import Exoplanet

SELECTABLE_FIELDS = {field: getattr(Exoplanet, field.value) for field in ExoplanetField}


def apply_field_selection(
    query: SelectOfScalar[Any],
    fields: list[ExoplanetField] | None,
) -> SelectOfScalar[Any]:
    """
    Apply dynamic field selection using SQLAlchemy load_only.
    """
    if not fields:
        return query

    return query.options(load_only(*(SELECTABLE_FIELDS[field] for field in fields)))
