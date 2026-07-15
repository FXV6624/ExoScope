from prometheus_client import Counter, Gauge, Histogram

from app.etl.metrics import ETLMetrics


class ETLPrometheusMetrics:
    def __init__(self) -> None:
        self.runs_total = Counter(
            "etl_runs_total",
            "Total number of ETL executions",
        )
        self.failed_runs_total = Counter(
            "etl_failed_runs_total",
            "Total number of failed ETL executions",
        )

        self.duration = Histogram(
            "etl_duration_seconds",
            "Duration of the ETL pipeline",
        )
        self.extract_duration = Histogram(
            "etl_extract_duration_seconds",
            "Duration of the extract stage",
        )
        self.transform_duration = Histogram(
            "etl_transform_duration_seconds",
            "Duration of the transform stage",
        )
        self.load_duration = Histogram(
            "etl_load_duration_seconds",
            "Duration of the load stage",
        )

        self.last_duration = Gauge(
            "etl_last_duration_seconds",
            "Duration of the last ETL execution in seconds",
        )
        self.last_extract_duration = Gauge(
            "etl_last_extract_duration_seconds",
            "Duration of the last extract stage in seconds",
        )
        self.last_transform_duration = Gauge(
            "etl_last_transform_duration_seconds",
            "Duration of the last transform stage in seconds",
        )
        self.last_load_duration = Gauge(
            "etl_last_load_duration_seconds",
            "Duration of the last load stage in seconds",
        )

        self.records_extracted = Gauge(
            "etl_records_extracted",
            "Records extracted in the last ETL execution",
        )
        self.records_transformed = Gauge(
            "etl_records_transformed",
            "Records transformed in the last ETL execution",
        )
        self.records_inserted = Gauge(
            "etl_records_inserted",
            "Records inserted in the last ETL execution",
        )
        self.records_updated = Gauge(
            "etl_records_updated",
            "Records updated in the last ETL execution",
        )
        self.records_skipped = Gauge(
            "etl_records_skipped",
            "Records skipped in the last ETL execution",
        )
        self.errors_count = Gauge(
            "etl_errors_total",
            "Number of errors in the last ETL execution",
        )

        self.last_run = Gauge(
            "etl_last_run_timestamp",
            "Unix timestamp of the last ETL execution",
        )
        self.last_run_success = Gauge(
            "etl_last_run_success",
            "Status of the last run (1 = SUCCESS, 0 = ERROR)",
        )

    def update(self, metrics: ETLMetrics) -> None:
        self.runs_total.inc()

        total_duration = metrics.total_duration()
        extract_duration = metrics.extract_duration()
        transform_duration = metrics.transform_duration()
        load_duration = metrics.load_duration()

        self.duration.observe(total_duration)
        self.extract_duration.observe(extract_duration)
        self.transform_duration.observe(transform_duration)
        self.load_duration.observe(load_duration)

        self.last_duration.set(total_duration)
        self.last_extract_duration.set(extract_duration)
        self.last_transform_duration.set(transform_duration)
        self.last_load_duration.set(load_duration)

        self.records_extracted.set(metrics.extracted)
        self.records_transformed.set(metrics.transformed)
        self.records_inserted.set(metrics.load_result.inserted)
        self.records_updated.set(metrics.load_result.updated)
        self.records_skipped.set(metrics.load_result.skipped)

        errors_qty = len(metrics.errors)
        self.errors_count.set(errors_qty)

        success = errors_qty == 0
        self.last_run_success.set(int(success))

        if not success:
            self.failed_runs_total.inc()

        if metrics.finished_at:
            self.last_run.set(metrics.finished_at.timestamp())


etl_prometheus_metrics = ETLPrometheusMetrics()
