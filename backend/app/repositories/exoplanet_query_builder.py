from sqlmodel import select

from app.models import Exoplanet
from app.schemas.exoplanet import ExoplanetFilters


def build_exoplanet_query(filters: ExoplanetFilters):
    """
    Build SQLModel query dynamically from filter schema.
    Supports:
    - exact match (field=value)
    - partial match for strings (ILIKE)
    - range filters (min_*, max_*)
    """
    query = select(Exoplanet)
    conditions = []

    operators = {
        "min_": lambda field, val: field >= val,
        "max_": lambda field, val: field <= val,
    }

    active_filters = filters.model_dump(exclude_none=True)

    for filter_name, value in active_filters.items():
        prefix = next((p for p in operators if filter_name.startswith(p)), None)

        if prefix:
            field_name = filter_name[len(prefix):]
            op_func = operators[prefix]
        else:
            field_name = filter_name
            def op_func(field, val): return field == val

        field = getattr(Exoplanet, field_name, None)

        if field is not None:
            if isinstance(value, str) and prefix is None:
                conditions.append(field.ilike(f"%{value}%"))
            elif prefix:
                conditions.append(op_func(field, value))
            else:
                conditions.append(field == value)

    if conditions:
        query = query.where(*conditions)

    return query
