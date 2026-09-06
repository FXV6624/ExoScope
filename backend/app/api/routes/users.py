import uuid
from typing import Any

from fastapi import APIRouter, HTTPException

from app.api.deps import (
    CurrentUser,
    SessionDep,
)
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.schemas.auth import Message
from app.schemas.user import (
    UpdatePassword,
    UserCreate,
    UserPublic,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)
from app.services import users as user_service
from app.utils import generate_new_account_email, send_email

router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "/",
    response_model=UsersPublic,
    summary="List users",
)
def read_users(
    session: SessionDep,
    current_user: CurrentUser,  # noqa: ARG001
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve a paginated list of registered users (admin only).
    """
    users, count = user_service.get_users(session, skip=skip, limit=limit)
    return UsersPublic(data=[UserPublic.model_validate(u) for u in users], count=count)


@router.post(
    "/",
    response_model=UserPublic,
    summary="Create user",
)
def create_user(
    session: SessionDep,
    current_user: CurrentUser,  # noqa: ARG001
    user_in: UserCreate,
) -> Any:
    """
    Create a new administrator user (admin only).
    """
    if user_service.get_user(session, user_in.email):
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )

    hashed = get_password_hash(user_in.password)

    user = user_service.create_new_user(
        session=session, user_in=user_in, hashed_password=hashed
    )

    if settings.emails_enabled:
        email_data = generate_new_account_email(
            email_to=user_in.email, username=user_in.email, password=user_in.password
        )

        send_email(
            email_to=user_in.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )

    return user


@router.get(
    "/me",
    response_model=UserPublic,
    summary="Get current user",
)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Retrieve profile information for the authenticated user.
    """
    return current_user


@router.patch(
    "/me",
    response_model=UserPublic,
    summary="Update current user",
)
def update_user_me(
    session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> Any:
    """
    Update profile details for the authenticated user.
    """
    if user_in.email:
        existing = user_service.get_user(session, user_in.email)

        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=409, detail="Email already used")

    data = user_in.model_dump(exclude_unset=True)
    return user_service.update_user_fields(session, current_user, data)


@router.patch(
    "/me/password",
    response_model=Message,
    summary="Update current user password",
)
def update_password_me(
    session: SessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Any:
    """
    Change password for the authenticated user.
    """
    verified, _ = verify_password(body.current_password, current_user.hashed_password)

    if not verified:
        raise HTTPException(status_code=400, detail="Incorrect password")

    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password cannot be the same as the current one",
        )

    user_service.update_password(session, current_user, body.new_password)

    return Message(message="Password updated")


@router.get(
    "/{user_id}",
    response_model=UserPublic,
    summary="Get user by ID",
)
def read_user(
    user_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,  # noqa: ARG001
) -> Any:
    """
    Retrieve user details by unique identifier (admin only).
    """
    user = user_service.get_user_by_id(session, user_id)

    if not user:
        raise HTTPException(status_code=404)

    return user


@router.patch(
    "/{user_id}",
    response_model=UserPublic,
    summary="Update user by ID",
)
def update_user(
    user_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,  # noqa: ARG001
    user_in: UserUpdate,
) -> Any:
    """
    Update user information by unique identifier (admin only).
    """
    db_user = user_service.get_user_by_id(session, user_id)

    if not db_user:
        raise HTTPException(status_code=404)

    if user_in.email:
        existing = user_service.get_user(session, user_in.email)
        if existing and existing.id != user_id:
            raise HTTPException(status_code=409)

    return user_service.update_user_fields(
        session, db_user, user_in.model_dump(exclude_unset=True)
    )


@router.delete(
    "/{user_id}",
    response_model=Message,
    summary="Delete user by ID",
)
def delete_user(
    session: SessionDep, current_user: CurrentUser, user_id: uuid.UUID
) -> Any:
    """
    Delete a user account by unique identifier (admin only).
    """
    user = user_service.get_user_by_id(session, user_id)

    if not user:
        raise HTTPException(status_code=404)

    if user == current_user:
        raise HTTPException(status_code=403)

    user_service.delete_user(session, user)

    return Message(message="User deleted")
