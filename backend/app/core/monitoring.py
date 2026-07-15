from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator


def setup_monitoring(app: FastAPI) -> None:
    """
    Configures Prometheus monitoring for the FastAPI application.
    """

    (
        Instrumentator(
            should_group_status_codes=True,
            should_ignore_untemplated=True,
            should_instrument_requests_inprogress=True,
            excluded_handlers=["/metrics"],
        )
        .instrument(app)
        .expose(app)
    )
