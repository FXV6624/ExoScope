from app.core.security import verify_password
from app.repositories.users import get_user_by_email, update_user, create_user
from app.core.security import get_password_hash
from app.models import User

# Dummy hash to use for timing attack prevention when user is not found 
# # This is an Argon2 hash of a random password, used to ensure constant-time comparison
DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$MjQyZWE1MzBjYjJlZTI0Yw$YTU4NGM5ZTZmYjE2NzZlZjY0ZWY3ZGRkY2U2OWFjNjk"


# -----------------------
# AUTH
# -----------------------
def authenticate_user(session, email: str, password: str) -> User | None:
    user = get_user_by_email(session, email)

    if not user:
        verify_password(password, DUMMY_HASH)
        return None

    verified, updated_hash = verify_password(password, user.hashed_password)

    if not verified:
        return None

    if updated_hash:
        update_user(session=session,db_user=user,hashed_password=updated_hash)

    return user


# -----------------------
# GET USER
# -----------------------
def get_user(session, email: str):
    return get_user_by_email(session, email)


# -----------------------
# CREATE USER
# -----------------------
def create_new_user(session, user_in, hashed_password: str):
    return create_user(session=session,user_create=user_in,hashed_password=hashed_password)


# -----------------------
# UPDATE PASSWORD
# -----------------------
def update_password(session, user, new_password: str):
    hashed = get_password_hash(new_password)

    return update_user(session=session,db_user=user,hashed_password=hashed)


# -----------------------
# DELETE USER
# -----------------------
def delete_user(session, user):
    session.delete(user)
    session.commit()