from unittest.mock import MagicMock, patch

from app.initial_data import init, main


def test_initial_data_init():
    session_mock = MagicMock()
    session_mock.__enter__.return_value = session_mock

    with (
        patch("app.initial_data.Session", return_value=session_mock),
        patch("app.initial_data.init_db") as mock_init_db,
    ):
        init()
        mock_init_db.assert_called_once_with(session_mock)


def test_initial_data_main():
    with (
        patch("app.initial_data.init") as mock_init,
        patch("app.initial_data.logger") as mock_logger,
    ):
        main()
        mock_init.assert_called_once()
        assert mock_logger.info.call_count == 2
