"""Unit tests for services/items.py (with mocked DB)."""

import uuid
from unittest.mock import MagicMock, patch

from app.models import Item, User
from app.services import items as item_service


def _make_user(is_superuser=False):
    user = MagicMock(spec=User)
    user.id = uuid.uuid4()
    user.is_superuser = is_superuser
    return user


def _make_item(owner_id=None):
    item = MagicMock(spec=Item)
    item.id = uuid.uuid4()
    item.owner_id = owner_id or uuid.uuid4()
    item.created_at = None
    return item


class TestGetItems:
    def test_superuser_queries_all_items(self):
        user = _make_user(is_superuser=True)
        session = MagicMock()

        mock_count = MagicMock()
        mock_count.one.return_value = 5
        mock_items = MagicMock()
        mock_items.all.return_value = []
        session.exec.side_effect = [mock_count, mock_items]

        items, count = item_service.get_items(session, user, skip=0, limit=10)

        assert session.exec.call_count == 2
        assert count == 5
        assert items == []

        # Verify no filtering was applied
        calls = session.exec.call_args_list
        count_stmt = calls[0][0][0]
        assert "WHERE" not in str(count_stmt)

    def test_normal_user_filters_by_owner(self):
        user = _make_user(is_superuser=False)
        session = MagicMock()

        mock_count = MagicMock()
        mock_count.one.return_value = 2
        mock_items = MagicMock()
        mock_items.all.return_value = []
        session.exec.side_effect = [mock_count, mock_items]

        items, count = item_service.get_items(session, user, skip=0, limit=10)

        assert session.exec.call_count == 2
        assert count == 2
        assert items == []

        # Verify filtering by owner_id was applied
        calls = session.exec.call_args_list
        count_stmt = calls[0][0][0]
        assert "WHERE item.owner_id =" in str(count_stmt)


class TestGetItem:
    def test_item_not_found_returns_not_found(self):
        session = MagicMock()
        session.get.return_value = None
        user = _make_user()
        item, error = item_service.get_item(session, uuid.uuid4(), user)
        assert item is None
        assert error == "not_found"

    def test_item_belongs_to_other_user_returns_forbidden(self):
        user = _make_user(is_superuser=False)
        item = _make_item(owner_id=uuid.uuid4())  # different owner
        session = MagicMock()
        session.get.return_value = item
        result_item, error = item_service.get_item(session, item.id, user)
        assert result_item is None
        assert error == "forbidden"

    def test_superuser_can_access_any_item(self):
        superuser = _make_user(is_superuser=True)
        item = _make_item(owner_id=uuid.uuid4())  # different owner
        session = MagicMock()
        session.get.return_value = item
        result_item, error = item_service.get_item(session, item.id, superuser)
        assert result_item is item
        assert error is None

    def test_owner_can_access_own_item(self):
        user = _make_user(is_superuser=False)
        item = _make_item(owner_id=user.id)
        session = MagicMock()
        session.get.return_value = item
        result_item, error = item_service.get_item(session, item.id, user)
        assert result_item is item
        assert error is None


class TestCreateItem:
    def test_creates_and_returns_item(self):
        user = _make_user()
        session = MagicMock()
        item_in = MagicMock()
        item_in.model_validate = MagicMock()

        with patch.object(
            Item, "model_validate", return_value=_make_item(owner_id=user.id)
        ):
            item_service.create_item(session, item_in, user)
            session.add.assert_called_once()
            session.commit.assert_called_once()
            session.refresh.assert_called_once()


class TestUpdateItem:
    def test_updates_and_returns_item(self):
        session = MagicMock()
        item = _make_item()
        item_in = MagicMock()
        item_in.model_dump.return_value = {"title": "New Title"}
        item.sqlmodel_update = MagicMock()

        item_service.update_item(session, item, item_in)
        item.sqlmodel_update.assert_called_once_with({"title": "New Title"})
        session.add.assert_called_once_with(item)
        session.commit.assert_called_once()


class TestDeleteItem:
    def test_deletes_and_commits(self):
        session = MagicMock()
        item = _make_item()
        item_service.delete_item(session, item)
        session.delete.assert_called_once_with(item)
        session.commit.assert_called_once()
