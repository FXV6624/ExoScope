"""Integration tests for ItemRepository against a real PostgreSQL DB."""

import uuid
import pytest
from sqlmodel import Session, delete, select

from app.models import Item, User
from app.repositories.users import create_user
from app.schemas.user import UserCreate
from app.core.security import get_password_hash


@pytest.fixture()
def test_user(db: Session) -> User:
    """Create a test user for item ownership."""
    email = f"item-owner-{uuid.uuid4().hex[:8]}@testdomain.com"
    uc = UserCreate(email=email, password="testpassword123")
    hashed = get_password_hash(uc.password)
    user = create_user(session=db, user_create=uc, hashed_password=hashed)
    yield user
    db.execute(delete(Item).where(Item.owner_id == user.id))
    db.execute(delete(User).where(User.id == user.id))
    db.commit()


class TestItemCRUD:

    def test_create_item(self, db: Session, test_user: User):
        item = Item(title="Test Item", description="Desc", owner_id=test_user.id)
        db.add(item)
        db.commit()
        db.refresh(item)
        assert item.id is not None
        assert item.title == "Test Item"
        assert item.owner_id == test_user.id

    def test_read_item_by_id(self, db: Session, test_user: User):
        item = Item(title="Readable", description=None, owner_id=test_user.id)
        db.add(item)
        db.commit()
        db.refresh(item)

        found = db.get(Item, item.id)
        assert found is not None
        assert found.title == "Readable"

    def test_item_not_found(self, db: Session):
        result = db.get(Item, uuid.uuid4())
        assert result is None

    def test_update_item_title(self, db: Session, test_user: User):
        item = Item(title="Original", owner_id=test_user.id)
        db.add(item)
        db.commit()
        db.refresh(item)

        item.title = "Updated"
        db.add(item)
        db.commit()
        db.refresh(item)
        assert item.title == "Updated"

    def test_delete_item(self, db: Session, test_user: User):
        item = Item(title="ToDelete", owner_id=test_user.id)
        db.add(item)
        db.commit()

        db.delete(item)
        db.commit()

        found = db.get(Item, item.id)
        assert found is None

    def test_filter_items_by_owner(self, db: Session, test_user: User):
        item1 = Item(title="Item-A", owner_id=test_user.id)
        item2 = Item(title="Item-B", owner_id=test_user.id)
        other_user_id = uuid.uuid4()
        item3 = Item(title="Item-C", owner_id=other_user_id)

        db.add_all([item1, item2])
        db.commit()

        stmt = select(Item).where(Item.owner_id == test_user.id)
        items = db.exec(stmt).all()
        titles = {i.title for i in items}
        assert "Item-A" in titles
        assert "Item-B" in titles
