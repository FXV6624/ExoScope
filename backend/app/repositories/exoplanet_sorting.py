from typing import Any

from sqlmodel.sql.expression import SelectOfScalar

from app.core.enums.exoplanet import ExoplanetSortField, SortOrder
from app.models import Exoplanet

_SORTABLE_FIELDS = {
    field: getattr(Exoplanet, field.value) for field in ExoplanetSortField
}


def apply_sorting(
    query: SelectOfScalar[Any],
    sort_by: ExoplanetSortField | None,
    order: SortOrder,
) -> SelectOfScalar[Any]:
    column = _SORTABLE_FIELDS[sort_by or ExoplanetSortField.PLANET_NAME]

    if order is SortOrder.desc:
        return query.order_by(column.desc().nulls_last())

    return query.order_by(column.asc().nulls_last())
