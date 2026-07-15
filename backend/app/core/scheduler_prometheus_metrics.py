from prometheus_client import Gauge


class SchedulerPrometheusMetrics:
    def __init__(self) -> None:
        self.last_run_timestamp = Gauge(
            "scheduler_last_run_timestamp_seconds",
            "Unix timestamp of the last scheduler ETL execution",
        )
        self.execution_interval = Gauge(
            "scheduler_execution_interval_seconds",
            "Configured interval between scheduler executions in seconds",
        )
        self.next_run_timestamp = Gauge(
            "scheduler_next_run_timestamp_seconds",
            "Estimated Unix timestamp of the next scheduler ETL execution",
        )
        self._interval_seconds: float = 0

    def initialize(self, interval_seconds: float) -> None:
        """Set the execution interval on startup."""
        self._interval_seconds = interval_seconds
        self.execution_interval.set(interval_seconds)

    def record_run(self, timestamp: float) -> None:
        """Record a scheduler run and calculate the next estimated run."""
        self.last_run_timestamp.set(timestamp)
        self.execution_interval.set(self._interval_seconds)
        self.next_run_timestamp.set(timestamp + self._interval_seconds)

    def update_next_run(self, next_run_ts: float) -> None:
        """Update the next run timestamp from APScheduler's actual data."""
        self.next_run_timestamp.set(next_run_ts)


scheduler_prometheus_metrics = SchedulerPrometheusMetrics()
