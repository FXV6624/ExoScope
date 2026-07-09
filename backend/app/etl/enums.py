from enum import StrEnum

class LoadMode(StrEnum):
    UPSERT = "upsert"
    INSERT = "insert"
    RELOAD = "reload"