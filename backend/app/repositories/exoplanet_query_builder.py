from typing import Any

from sqlmodel import col, or_, select
from sqlmodel.sql.expression import SelectOfScalar

from app.models import Exoplanet
from app.schemas.exoplanet import ExoplanetFilters


def build_exoplanet_query(filters: ExoplanetFilters) -> SelectOfScalar[Exoplanet]:
    """
    Build SQLModel query dynamically from filter schema.
    Supports:
    - exact match (field=value)
    - partial match for strings (ILIKE)
    - range filters (min_*, max_*)
    - boolean filter for non-default NASA photo (has_nasa_photo)
    """
    query = select(Exoplanet)
    conditions: list[Any] = []

    active_filters = filters.model_dump(exclude_none=True)

    if "has_nasa_photo" in active_filters:
        has_custom = active_filters.pop("has_nasa_photo")
        if has_custom:
            conditions.append(col(Exoplanet.photo_url).like("http%"))
        else:
            conditions.append(
                or_(
                    col(Exoplanet.photo_url).like("/assets/%"),
                    col(Exoplanet.photo_url).is_(None),
                )
            )

    operators: dict[str, Any] = {
        "min_": lambda field, val: field >= val,
        "max_": lambda field, val: field <= val,
    }

    for filter_name, value in active_filters.items():
        prefix = next((p for p in operators if filter_name.startswith(p)), None)

        if prefix:
            field_name = filter_name[len(prefix) :]
            op_func = operators[prefix]
        else:
            field_name = filter_name

            def op_func(field: Any, val: Any) -> Any:
                return field == val

        field = getattr(Exoplanet, field_name, None)

        if field is not None:
            if prefix:
                conditions.append(op_func(field, value))
            elif field_name in {"planet_class", "composition", "discovery_method"}:
                conditions.append(col(field) == value)
            elif isinstance(value, str):
                conditions.append(col(field).ilike(f"%{value}%"))
            else:
                conditions.append(field == value)

    if conditions:
        query = query.where(*conditions)

    return query
