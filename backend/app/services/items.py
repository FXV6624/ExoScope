from app.models import Item

# -----------------------
# GET ITEMS
# -----------------------
def get_items(session, user, skip=0, limit=100):

    if user.is_superuser:
        query = session.query(Item)
    else:
        query = session.query(Item).filter(Item.owner_id == user.id)

    count = query.count()

    items = (query.order_by(Item.created_at.desc()).offset(skip).limit(limit).all())

    return items, count


# -----------------------
# GET ITEM BY ID
# -----------------------
def get_item(session, item_id, user):

    item = session.get(Item, item_id)

    if not item:
        return None, "not_found"

    if not user.is_superuser and item.owner_id != user.id:
        return None, "forbidden"

    return item, None


# -----------------------
# CREATE ITEM
# -----------------------
def create_item(session, item_in, user):

    item = Item.model_validate(item_in,update={"owner_id": user.id})

    session.add(item)
    session.commit()
    session.refresh(item)

    return item


# -----------------------
# UPDATE ITEM
# -----------------------
def update_item(session, item, item_in):

    data = item_in.model_dump(exclude_unset=True)

    item.sqlmodel_update(data)

    session.add(item)
    session.commit()
    session.refresh(item)

    return item


# -----------------------
# DELETE ITEM
# -----------------------
def delete_item(session, item):

    session.delete(item)
    session.commit()