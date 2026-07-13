from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
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


# -------------------------
# LOGIN
# -------------------------
@router.post("/login/access-token")
def login_access_token(session: SessionDep,form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:

    user = user_service.authenticate_user(session=session,email=form_data.username,password=form_data.password)

    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    return Token(access_token=security.create_access_token(user.id,expires_delta=access_token_expires))


# -------------------------
# TEST TOKEN
# -------------------------
@router.post("/login/test-token", response_model=UserPublic)
def test_token(current_user: CurrentUser) -> Any:
    return current_user


# -------------------------
# PASSWORD RECOVERY
# -------------------------
@router.post("/password-recovery/{email}", response_model=Message)
def recover_password(email: str, session: SessionDep) -> Message:

    user = user_service.get_user_by_email(session, email)

    if user:
        token = generate_password_reset_token(email=email)

        email_data = generate_reset_password_email(email_to=user.email,email=email,token=token)

        send_email(email_to=user.email, subject=email_data.subject, html_content=email_data.html_content)

    return Message(message="If that email is registered, we sent a recovery link")


# -------------------------
# RESET PASSWORD
# -------------------------
@router.post("/reset-password/", response_model=Message)
def reset_password(session: SessionDep, body: NewPassword) -> Message:

    email = verify_password_reset_token(body.token)

    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")

    ok = user_service.reset_password(session=session,email=email,new_password=body.new_password)

    if not ok:
        raise HTTPException(status_code=400, detail="Invalid token")

    return Message(message="Password updated successfully")


# -------------------------
# HTML RESET (admin only)
# -------------------------
@router.post("/password-recovery-html-content/{email}",
    dependencies=[Depends(get_current_active_superuser)],response_class=HTMLResponse)
def recover_password_html(email: str, session: SessionDep) -> Any:

    user = user_service.get_user_by_email(session, email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = generate_password_reset_token(email=email)

    email_data = generate_reset_password_email(email_to=user.email,email=email,token=token)

    return HTMLResponse(content=email_data.html_content,headers={"subject": email_data.subject})
