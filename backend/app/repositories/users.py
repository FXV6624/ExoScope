from sqlmodel import Session, select

from app.models import User
from app.schemas.user import UserCreate


def create_user(session: Session, user_create: UserCreate, hashed_password: str) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": hashed_password}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(session: Session, db_user: User, **fields: str) -> User:
    db_user.sqlmodel_update(fields)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()
