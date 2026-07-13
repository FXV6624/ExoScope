"""Integration tests for database models (SQLModel / SQLAlchemy)."""

import uuid

import pytest
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, delete, select

from app.core.security import get_password_hash
from app.models import ETLRun, Exoplanet, Item, User
from app.repositories.users import create_user
from app.schemas.user import UserCreate


@pytest.fixture(autouse=True)
def clean_db(db: Session):
    yield
    db.rollback()
    db.execute(delete(Item))
    db.execute(delete(Exoplanet))
    db.execute(delete(ETLRun))
    db.execute(delete(User).where(User.email.like("%@modeltest.com")))
    db.commit()


class TestUserModel:
    def test_user_gets_uuid_on_creation(self, db: Session):
        uc = UserCreate(email="uuid@modeltest.com", password="password12345")
        user = create_user(
            session=db, user_create=uc, hashed_password=get_password_hash(uc.password)
        )
        assert isinstance(user.id, uuid.UUID)

    def test_unique_email_constraint(self, db: Session):
        email = "unique@modeltest.com"
        uc = UserCreate(email=email, password="password12345")
        create_user(
            session=db, user_create=uc, hashed_password=get_password_hash(uc.password)
        )

        with pytest.raises(IntegrityError):
            create_user(
                session=db,
                user_create=uc,
                hashed_password=get_password_hash(uc.password),
            )
            db.commit()

    def test_user_has_created_at(self, db: Session):
        uc = UserCreate(email="created@modeltest.com", password="password12345")
        user = create_user(
            session=db, user_create=uc, hashed_password=get_password_hash(uc.password)
        )
        assert user.created_at is not None

    def test_user_items_relationship(self, db: Session):
        uc = UserCreate(email="items@modeltest.com", password="password12345")
        user = create_user(
            session=db, user_create=uc, hashed_password=get_password_hash(uc.password)
        )
        item = Item(title="Test Item", owner_id=user.id)
        db.add(item)
        db.commit()
        db.refresh(user)
        assert len(user.items) == 1
        assert user.items[0].title == "Test Item"


class TestItemModel:
    def test_item_gets_uuid_on_creation(self, db: Session):
        uc = UserCreate(email="itemuuid@modeltest.com", password="password12345")
        user = create_user(
            session=db, user_create=uc, hashed_password=get_password_hash(uc.password)
        )
        item = Item(title="UUID Test", owner_id=user.id)
        db.add(item)
        db.commit()
        db.refresh(item)
        assert isinstance(item.id, uuid.UUID)

    def test_item_has_created_at(self, db: Session):
        uc = UserCreate(email="itemcreated@modeltest.com", password="password12345")
        user = create_user(
            session=db, user_create=uc, hashed_password=get_password_hash(uc.password)
        )
        item = Item(title="Created Test", owner_id=user.id)
        db.add(item)
        db.commit()
        db.refresh(item)
        assert item.created_at is not None


class TestExoplanetModel:
    def test_exoplanet_unique_constraint(self, db: Session):
        planet1 = Exoplanet(planet_name="Kepler-22b", host_star="Kepler-22")
        planet2 = Exoplanet(planet_name="Kepler-22b", host_star="Kepler-22")
        db.add(planet1)
        db.commit()

        db.add(planet2)
        with pytest.raises(IntegrityError):  # Unique constraint violation
            db.commit()
        db.rollback()

    def test_exoplanet_unique_constraint_allows_different_star(self, db: Session):
        planet1 = Exoplanet(planet_name="Planet-b", host_star="Star-A")
        planet2 = Exoplanet(planet_name="Planet-b", host_star="Star-B")
        db.add_all([planet1, planet2])
        db.commit()
        # Both should be inserted without error
        count = db.exec(
            select(Exoplanet).where(Exoplanet.planet_name == "Planet-b")
        ).all()
        assert len(count) == 2

    def test_exoplanet_allows_null_optional_fields(self, db: Session):
        planet = Exoplanet(planet_name="Minimal-b")
        db.add(planet)
        db.commit()
        db.refresh(planet)
        assert planet.host_star is None
        assert planet.discovery_method is None
