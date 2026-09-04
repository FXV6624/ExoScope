import uuid
from typing import Any

from sqlmodel import Session, col, func, select

from app.models import User
from app.schemas.user import UserCreate


def create_user(
    session: Session, user_create: UserCreate, hashed_password: str
) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": hashed_password}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(
    session: Session,
    db_user: User,
    update_data: dict[str, Any] | None = None,
    **fields: Any,
) -> User:
    if update_data:
        db_user.sqlmodel_update(update_data)
    if fields:
        db_user.sqlmodel_update(fields)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def get_user_by_id(session: Session, user_id: uuid.UUID) -> User | None:
    return session.get(User, user_id)


def get_users(
    session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[User], int]:
    count = session.exec(select(func.count()).select_from(User)).one()
    statement = (
        select(User).order_by(col(User.created_at).desc()).offset(skip).limit(limit)
    )
    users = session.exec(statement).all()
    return list(users), count


def delete_user(session: Session, user: User) -> None:
    session.delete(user)
    session.commit()
