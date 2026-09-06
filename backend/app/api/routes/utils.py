from typing import Annotated

from fastapi import APIRouter, Query
from pydantic.networks import EmailStr

from app.api.deps import CurrentUser
from app.core.cache import clear_cache
from app.schemas.auth import Message
from app.utils import generate_test_email, send_email

router = APIRouter(prefix="/utils", tags=["utils"])


@router.post(
    "/test-email/",
    response_model=Message,
    status_code=201,
    summary="Send test email",
)
def test_email(
    email_to: Annotated[
        EmailStr,
        Query(description="Recipient email address for the test message."),
    ],
    current_user: CurrentUser,  # noqa: ARG001
) -> Message:
    """
    Send a test email to verify SMTP delivery and template rendering (admin only).
    """
    email_data = generate_test_email(email_to=email_to)
    send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Test email sent")


@router.post(
    "/purge-cache/",
    response_model=Message,
    summary="Purge application cache",
)
async def purge_cache(current_user: CurrentUser) -> Message:  # noqa: ARG001
    """
    Invalidate and clear both Redis and local in-memory caches (admin only).
    """
    await clear_cache()
    return Message(message="Cache purged successfully")


@router.get(
    "/health-check/",
    response_model=bool,
    summary="System health check",
)
async def health_check() -> bool:
    """
    Service liveness probe confirming the API application is healthy and responsive.
    """
    return True
