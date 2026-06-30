from typing import List
from sqlmodel import Session
from app.etl.enums import LoadMode
from app.etl.load_strategies.factory import get_load_strategy

from app.models import Exoplanet


def load(session: Session,planets: List[Exoplanet],mode: LoadMode = LoadMode.UPSERT,) -> int:
    """
    Delegates loading logic to the selected strategy:
    - upsert: Inserts or updates if the planet already exists. 
    - insert: Inserts only new planets (ignores existing ones). 
    - reload: Truncates/deletes all existing data before inserting
    """

    if not planets and mode != LoadMode.RELOAD:
        return 0

    strategy = get_load_strategy(mode)
    return strategy.load(session, planets)