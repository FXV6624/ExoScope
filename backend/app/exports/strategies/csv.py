import csv
from io import BytesIO, StringIO

from app.exports.schemas import ExportRequest
from app.exports.strategies.base import ExportStrategy


class CsvExportStrategy(ExportStrategy):
    def export(
        self,
        data: list[dict[str, object]],
        request: ExportRequest,  # noqa: ARG002
    ) -> BytesIO:
        text_buffer = StringIO()

        if data:
            writer = csv.DictWriter(text_buffer, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)

        binary_buffer = BytesIO(text_buffer.getvalue().encode("utf-8"))
        binary_buffer.seek(0)

        return binary_buffer
