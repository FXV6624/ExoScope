from app.etl.enums import LoadMode

from .base import LoadStrategy
from .insert import InsertLoadStrategy
from .reload import ReloadLoadStrategy
from .upsert import UpsertLoadStrategy


def get_load_strategy(mode: LoadMode) -> LoadStrategy:

    match mode:
        case LoadMode.UPSERT:
            return UpsertLoadStrategy()
        case LoadMode.INSERT:
            return InsertLoadStrategy()
        case LoadMode.RELOAD:
            return ReloadLoadStrategy()
        case _:
            raise ValueError(f"Unknown LoadMode: {mode}")
