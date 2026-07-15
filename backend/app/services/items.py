import uuid

from sqlmodel import Session, col, func, select

from app.models import Item, User
from app.schemas.item import ItemCreate, ItemUpdate


# -----------------------
# GET ITEMS
# -----------------------
def get_items(
    session: Session, user: User, skip: int = 0, limit: int = 100
) -> tuple[list[Item], int]:
    stmt = select(Item)
    count_stmt = select(func.count()).select_from(Item)

    if not user.is_superuser:
        stmt = stmt.where(Item.owner_id == user.id)
        count_stmt = count_stmt.where(Item.owner_id == user.id)

    count = session.exec(count_stmt).one()
    items = session.exec(
        stmt.order_by(col(Item.created_at).desc()).offset(skip).limit(limit)
    ).all()

    return list(items), count


# -----------------------
# GET ITEM BY ID
# -----------------------
def get_item(
    session: Session, item_id: uuid.UUID, user: User
) -> tuple[Item | None, str | None]:
    item = session.get(Item, item_id)

    if not item:
        return None, "not_found"

    if not user.is_superuser and item.owner_id != user.id:
        return None, "forbidden"

    return item, None


# -----------------------
# CREATE ITEM
# -----------------------
def create_item(session: Session, item_in: ItemCreate, user: User) -> Item:
    item = Item.model_validate(item_in, update={"owner_id": user.id})

    session.add(item)
    session.commit()
    session.refresh(item)

    return item


# -----------------------
# UPDATE ITEM
# -----------------------
def update_item(session: Session, item: Item, item_in: ItemUpdate) -> Item:
    data = item_in.model_dump(exclude_unset=True)

    item.sqlmodel_update(data)

    session.add(item)
    session.commit()
    session.refresh(item)

    return item


# -----------------------
# DELETE ITEM
# -----------------------
def delete_item(session: Session, item: Item) -> None:
    session.delete(item)
    session.commit()
