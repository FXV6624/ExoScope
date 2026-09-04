import uuid
from typing import Any

from sqlmodel import Session

from app.core.security import get_password_hash, verify_password
from app.models import User
from app.repositories import users as user_repo
from app.repositories.users import (
    create_user,
    get_user_by_email,
    update_user,
)
from app.schemas.user import UserCreate

# Dummy hash used for constant-time comparison when user is not found (prevents timing attacks)
DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$MjQyZWE1MzBjYjJlZTI0Yw$YTU4NGM5ZTZmYjE2NzZlZjY0ZWY3ZGRkY2U2OWFjNjk"


def authenticate_user(session: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(session, email)

    if not user:
        verify_password(password, DUMMY_HASH)
        return None

    verified, updated_hash = verify_password(password, user.hashed_password)

    if not verified:
        return None

    if updated_hash:
        update_user(session=session, db_user=user, hashed_password=updated_hash)

    return user


def get_user(session: Session, email: str) -> User | None:
    return get_user_by_email(session, email)


def get_user_by_id(session: Session, user_id: uuid.UUID) -> User | None:
    return user_repo.get_user_by_id(session, user_id)


def get_users(
    session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[User], int]:
    return user_repo.get_users(session, skip=skip, limit=limit)


def create_new_user(
    session: Session, user_in: UserCreate, hashed_password: str
) -> User:
    return create_user(
        session=session, user_create=user_in, hashed_password=hashed_password
    )


def update_user_fields(
    session: Session, db_user: User, update_data: dict[str, Any]
) -> User:
    return user_repo.update_user(
        session=session, db_user=db_user, update_data=update_data
    )


def update_password(session: Session, user: User, new_password: str) -> User:
    hashed = get_password_hash(new_password)
    return update_user(session=session, db_user=user, hashed_password=hashed)


def delete_user(session: Session, user: User) -> None:
    user_repo.delete_user(session, user)
