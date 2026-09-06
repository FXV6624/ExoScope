"""Logging filter for injecting request ID into log records.

Re-exports RequestIdFilter from app.core.logging for backwards compatibility.
"""

from app.core.logging import RequestIdFilter

__all__ = ["RequestIdFilter"]
