import json
from io import BytesIO

from app.exports.schemas import ExportRequest
from app.exports.strategies.base import ExportStrategy


class JsonExportStrategy(ExportStrategy):
    def export(
        self,
        data: list[dict[str, object]],
        request: ExportRequest,  # noqa: ARG002
    ) -> BytesIO:
        buffer = BytesIO()

        buffer.write(
            json.dumps(
                data,
                indent=2,
                ensure_ascii=False,
            ).encode("utf-8")
        )

        buffer.seek(0)

        return buffer
