"""Request-scoped context variables.

Re-exports request_id_ctx from app.core.logging for backwards compatibility.
"""

from app.core.logging import request_id_ctx

__all__ = ["request_id_ctx"]
