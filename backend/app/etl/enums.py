from enum import Enum


class LoadMode(str, Enum):
    UPSERT = "upsert"
    INSERT = "insert"
    RELOAD = "reload"
