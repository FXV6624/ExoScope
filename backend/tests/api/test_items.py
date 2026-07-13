"""API tests for /items endpoints."""

import uuid

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, delete

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import Item, User
from app.repositories.users import create_user
from app.schemas.user import UserCreate

API = settings.API_V1_STR


def _create_test_user(db: Session, email: str, password: str = "password12345", is_superuser: bool = False) -> User:
    uc = UserCreate(email=email, password=password, is_superuser=is_superuser)
    hashed = get_password_hash(password)
    return create_user(session=db, user_create=uc, hashed_password=hashed)


def _get_token(client: TestClient, email: str, password: str) -> dict[str, str]:
    response = client.post(f"{API}/login/access-token", data={"username": email, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def item_user(db: Session):
    email = f"itemuser-{uuid.uuid4().hex[:8]}@apitest.com"
    password = "testpassword123"
    user = _create_test_user(db, email, password)
    yield user, password
    db.execute(delete(Item).where(Item.owner_id == user.id))
    db.execute(delete(User).where(User.id == user.id))
    db.commit()


@pytest.fixture()
def other_user(db: Session):
    email = f"otheruser-{uuid.uuid4().hex[:8]}@apitest.com"
    password = "testpassword123"
    user = _create_test_user(db, email, password)
    yield user, password
    db.execute(delete(Item).where(Item.owner_id == user.id))
    db.execute(delete(User).where(User.id == user.id))
    db.commit()


class TestCreateItem:

    def test_create_item_success(self, client: TestClient, item_user):
        user, password = item_user
        headers = _get_token(client, user.email, password)
        payload = {"title": "My API Item", "description": "Desc"}
        response = client.post(f"{API}/items/", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "My API Item"
        assert "id" in data

    def test_create_item_unauthorized(self, client: TestClient):
        payload = {"title": "Unauthorized"}
        response = client.post(f"{API}/items/", json=payload)
        assert response.status_code == 401


class TestGetItems:

    def test_read_items_returns_only_own_items_for_normal_user(self, client: TestClient, db: Session, item_user, other_user):
        user1, pass1 = item_user
        user2, pass2 = other_user

        # User 1 creates an item
        h1 = _get_token(client, user1.email, pass1)
        client.post(f"{API}/items/", json={"title": "User 1 Item"}, headers=h1)

        # User 2 creates an item
        h2 = _get_token(client, user2.email, pass2)
        client.post(f"{API}/items/", json={"title": "User 2 Item"}, headers=h2)

        # User 1 reads items
        response = client.get(f"{API}/items/", headers=h1)
        assert response.status_code == 200
        data = response.json()
        assert data["count"] >= 1
        titles = [i["title"] for i in data["data"]]
        assert "User 1 Item" in titles
        assert "User 2 Item" not in titles

    def test_superuser_can_read_all_items(self, client: TestClient, superuser_token_headers: dict, item_user):
        user, password = item_user
        h = _get_token(client, user.email, password)
        client.post(f"{API}/items/", json={"title": "Superuser Visible"}, headers=h)

        response = client.get(f"{API}/items/", headers=superuser_token_headers)
        assert response.status_code == 200
        data = response.json()
        titles = [i["title"] for i in data["data"]]
        assert "Superuser Visible" in titles


class TestGetItemById:

    def test_read_own_item(self, client: TestClient, item_user):
        user, password = item_user
        headers = _get_token(client, user.email, password)
        res = client.post(f"{API}/items/", json={"title": "Own Item"}, headers=headers)
        item_id = res.json()["id"]

        response = client.get(f"{API}/items/{item_id}", headers=headers)
        assert response.status_code == 200
        assert response.json()["title"] == "Own Item"

    def test_read_other_user_item_forbidden(self, client: TestClient, item_user, other_user):
        user1, pass1 = item_user
        user2, pass2 = other_user
        h1 = _get_token(client, user1.email, pass1)
        res = client.post(f"{API}/items/", json={"title": "Secret Item"}, headers=h1)
        item_id = res.json()["id"]

        h2 = _get_token(client, user2.email, pass2)
        response = client.get(f"{API}/items/{item_id}", headers=h2)
        assert response.status_code == 403


class TestUpdateItem:

    def test_update_own_item(self, client: TestClient, item_user):
        user, password = item_user
        headers = _get_token(client, user.email, password)
        res = client.post(f"{API}/items/", json={"title": "Before Update"}, headers=headers)
        item_id = res.json()["id"]

        response = client.put(f"{API}/items/{item_id}", json={"title": "After Update"}, headers=headers)
        assert response.status_code == 200
        assert response.json()["title"] == "After Update"


class TestDeleteItem:

    def test_delete_own_item(self, client: TestClient, item_user):
        user, password = item_user
        headers = _get_token(client, user.email, password)
        res = client.post(f"{API}/items/", json={"title": "Delete Me"}, headers=headers)
        item_id = res.json()["id"]

        response = client.delete(f"{API}/items/{item_id}", headers=headers)
        assert response.status_code == 200

        get_res = client.get(f"{API}/items/{item_id}", headers=headers)
        assert get_res.status_code == 404
