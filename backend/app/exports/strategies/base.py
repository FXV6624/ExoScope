from abc import ABC, abstractmethod
from io import BytesIO

from app.exports.schemas import ExportRequest


class ExportStrategy(ABC):
    @abstractmethod
    def export(self, data: list[dict[str, object]], request: ExportRequest) -> BytesIO:
        pass
