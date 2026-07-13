"""Unit tests for core.logging module."""

import logging

from app.core.logging import setup_logging


class TestSetupLogging:
    def test_setup_logging_runs_without_error(self):
        """Calling setup_logging() should not raise any exception."""
        setup_logging()

    def test_root_logger_level_after_setup(self):
        setup_logging()
        root_logger = logging.getLogger()
        # After basicConfig, root logger level should be INFO (20)
        assert root_logger.level == logging.INFO

    def test_setup_logging_is_idempotent(self):
        """Calling multiple times should not cause issues."""
        setup_logging()
        setup_logging()
        root_logger = logging.getLogger()
        assert root_logger.level == logging.INFO

    def test_named_logger_can_be_created(self):
        setup_logging()
        logger = logging.getLogger("test.module")
        assert logger is not None

    def test_named_logger_propagates(self):
        setup_logging()
        logger = logging.getLogger("test.propagation")
        assert logger.propagate is True

    def test_root_logger_has_handlers(self):
        """After setup, root logger should have at least one handler."""
        setup_logging()
        root_logger = logging.getLogger()
        assert len(root_logger.handlers) >= 1
