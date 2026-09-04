"""API tests for /private endpoints."""

import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import User

API = settings.API_V1_STR


def test_private_create_user(client: TestClient, db: Session):
    unique_email = f"private-{uuid.uuid4().hex[:8]}@example.com"
    payload = {
        "email": unique_email,
        "password": "privatepassword123",
        "full_name": "Private User",
    }
    response = client.post(f"{API}/private/users/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == unique_email
    assert data["full_name"] == "Private User"

    # Cleanup
    db_user = db.get(User, uuid.UUID(data["id"]))
    if db_user:
        db.delete(db_user)
        db.commit()
