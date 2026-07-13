import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import CurrentUser, SessionDep
from app.schemas.auth import Message
from app.schemas.item import ItemCreate, ItemPublic, ItemsPublic, ItemUpdate
from app.services import items as item_service

router = APIRouter(prefix="/items", tags=["items"])


# -----------------------
# GET ITEMS
# -----------------------
@router.get("/", response_model=ItemsPublic)
def read_items(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    items, count = item_service.get_items(session, current_user, skip, limit)
    return ItemsPublic(data=[ItemPublic.model_validate(i) for i in items], count=count)


# -----------------------
# GET ITEM
# -----------------------
@router.get("/{item_id}", response_model=ItemPublic)
def read_item(session: SessionDep, current_user: CurrentUser, item_id: uuid.UUID) -> Any:
    item, error = item_service.get_item(session, item_id, current_user)

    if error == "not_found":
        raise HTTPException(status_code=404, detail="Item not found")

    if error == "forbidden":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return item


# -----------------------
# CREATE ITEM
# -----------------------
@router.post("/", response_model=ItemPublic)
def create_item(session: SessionDep, current_user: CurrentUser, item_in: ItemCreate) -> Any:
    return item_service.create_item(session, item_in, current_user)


# -----------------------
# UPDATE ITEM
# -----------------------
@router.put("/{item_id}", response_model=ItemPublic)
def update_item(
    session: SessionDep,
    current_user: CurrentUser,
    item_id: uuid.UUID,
    item_in: ItemUpdate,
) -> Any:
    item, error = item_service.get_item(session, item_id, current_user)

    if error == "not_found":
        raise HTTPException(status_code=404)

    if error == "forbidden":
        raise HTTPException(status_code=403)

    assert item is not None
    return item_service.update_item(session, item, item_in)


# -----------------------
# DELETE ITEM
# -----------------------
@router.delete("/{item_id}", response_model=Message)
def delete_item(session: SessionDep, current_user: CurrentUser, item_id: uuid.UUID) -> Any:
    item, error = item_service.get_item(session, item_id, current_user)

    if error:
        raise HTTPException(status_code=403)

    assert item is not None
    item_service.delete_item(session, item)

    return Message(message="Item deleted")
