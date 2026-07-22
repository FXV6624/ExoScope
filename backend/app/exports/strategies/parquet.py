from io import BytesIO

import pyarrow as pa
import pyarrow.parquet as pq

from app.exports.schemas import ExportRequest
from app.exports.strategies.base import ExportStrategy


class ParquetExportStrategy(ExportStrategy):
    def export(
        self,
        data: list[dict[str, object]],
        request: ExportRequest,  # noqa: ARG002
    ) -> BytesIO:
        table = pa.Table.from_pylist(data)

        buffer = BytesIO()
        pq.write_table(table, buffer)

        buffer.seek(0)

        return buffer
