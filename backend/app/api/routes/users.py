import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import col, func, select

from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models import User
from app.schemas.auth import Message
from app.schemas.user import (
    UpdatePassword,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)
from app.services import users as user_service
from app.utils import generate_new_account_email, send_email

router = APIRouter(prefix="/users", tags=["users"])


# -----------------------
# GET USERS (admin)
# -----------------------
@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UsersPublic,
)
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    count = session.exec(select(func.count()).select_from(User)).one()

    users = session.exec(
        select(User).order_by(col(User.created_at).desc()).offset(skip).limit(limit)
    ).all()

    return UsersPublic(data=[UserPublic.model_validate(u) for u in users], count=count)


# -----------------------
# CREATE USER (admin)
# -----------------------
@router.post(
    "/", dependencies=[Depends(get_current_active_superuser)], response_model=UserPublic
)
def create_user(session: SessionDep, user_in: UserCreate) -> Any:
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


# -----------------------
# ME
# -----------------------
@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    return current_user


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> Any:
    if user_in.email:
        existing = user_service.get_user(session, user_in.email)

        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=409, detail="Email already used")

    data = user_in.model_dump(exclude_unset=True)

    current_user.sqlmodel_update(data)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return current_user


@router.patch("/me/password", response_model=Message)
def update_password_me(
    session: SessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Any:
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


# -----------------------
# DELETE ME
# -----------------------
@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    if current_user.is_superuser:
        raise HTTPException(status_code=403)

    user_service.delete_user(session, current_user)

    return Message(message="User deleted")


# -----------------------
# REGISTER
# -----------------------
@router.post("/signup", response_model=UserPublic)
def register_user(session: SessionDep, user_in: UserRegister) -> Any:
    if user_service.get_user(session, user_in.email):
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )

    user_create = UserCreate.model_validate(user_in)

    return user_service.create_new_user(
        session=session,
        user_in=user_create,
        hashed_password=get_password_hash(user_in.password),
    )


# -----------------------
# GET BY ID
# -----------------------
@router.get("/{user_id}", response_model=UserPublic)
def read_user(
    user_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(status_code=404)

    if user == current_user:
        return user

    if not current_user.is_superuser:
        raise HTTPException(status_code=403)

    return user


# -----------------------
# UPDATE USER (admin)
# -----------------------
@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
def update_user(user_id: uuid.UUID, session: SessionDep, user_in: UserUpdate) -> Any:
    db_user = session.get(User, user_id)

    if not db_user:
        raise HTTPException(status_code=404)

    if user_in.email:
        existing = user_service.get_user(session, user_in.email)
        if existing and existing.id != user_id:
            raise HTTPException(status_code=409)

    db_user.sqlmodel_update(user_in.model_dump(exclude_unset=True))

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return db_user


# -----------------------
# DELETE USER (admin)
# -----------------------
@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(
    session: SessionDep, current_user: CurrentUser, user_id: uuid.UUID
) -> Any:
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(status_code=404)

    if user == current_user:
        raise HTTPException(status_code=403)

    session.delete(user)
    session.commit()

    return Message(message="User deleted")
