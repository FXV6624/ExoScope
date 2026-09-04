from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUser, SessionDep
from app.core import security
from app.core.config import settings
from app.schemas.auth import Message, NewPassword, Token
from app.schemas.user import UserPublic
from app.services import users as user_service
from app.utils import (
    generate_password_reset_token,
    generate_reset_password_email,
    send_email,
    verify_password_reset_token,
)

router = APIRouter(tags=["login"])


@router.post("/login/access-token")
def login_access_token(
    session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    user = user_service.authenticate_user(
        session=session, email=form_data.username, password=form_data.password
    )

    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )


@router.post("/login/test-token", response_model=UserPublic)
def test_token(current_user: CurrentUser) -> Any:
    return current_user


@router.post("/password-recovery/{email}", response_model=Message)
def recover_password(email: str, session: SessionDep) -> Message:
    user = user_service.get_user(session, email)

    if user:
        token = generate_password_reset_token(email=email)

        email_data = generate_reset_password_email(
            email_to=user.email, email=email, token=token
        )

        send_email(
            email_to=user.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )

    return Message(message="If that email is registered, we sent a recovery link")


@router.post("/reset-password/", response_model=Message)
def reset_password(session: SessionDep, body: NewPassword) -> Message:
    email = verify_password_reset_token(body.token)

    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")

    user = user_service.get_user(session, email)

    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")

    user_service.update_password(
        session=session, user=user, new_password=body.new_password
    )

    return Message(message="Password updated successfully")


@router.post(
    "/password-recovery-html-content/{email}",
    response_class=HTMLResponse,
)
def recover_password_html(
    email: str,
    session: SessionDep,
    current_user: CurrentUser,  # noqa: ARG001
) -> Any:
    user = user_service.get_user(session, email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = generate_password_reset_token(email=email)

    email_data = generate_reset_password_email(
        email_to=user.email, email=email, token=token
    )

    return HTMLResponse(
        content=email_data.html_content, headers={"subject": email_data.subject}
    )
