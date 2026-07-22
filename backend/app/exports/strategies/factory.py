from app.exports.schemas import ExportFormat
from app.exports.strategies.base import ExportStrategy
from app.exports.strategies.csv import CsvExportStrategy
from app.exports.strategies.json import JsonExportStrategy
from app.exports.strategies.parquet import ParquetExportStrategy


class ExportStrategyFactory:
    @staticmethod
    def create(export_format: ExportFormat) -> ExportStrategy:
        match export_format:
            case ExportFormat.CSV:
                return CsvExportStrategy()
            case ExportFormat.JSON:
                return JsonExportStrategy()
            case ExportFormat.PARQUET:
                return ParquetExportStrategy()
