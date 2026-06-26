from app.models import User
from sqlmodel import select


def create_user(session, user_create, hashed_password: str):
    db_obj = User.model_validate(user_create,update={"hashed_password": hashed_password})
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(session, db_user, **fields):
    db_user.sqlmodel_update(fields)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(session, email: str):
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()