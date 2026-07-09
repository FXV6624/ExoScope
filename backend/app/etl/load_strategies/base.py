from abc import ABC, abstractmethod
from sqlmodel import Session
from app.models import Exoplanet
from app.etl.schemas import LoadResult

class LoadStrategy(ABC):

    @abstractmethod
    def load(self, session: Session, planets: list[Exoplanet]) -> LoadResult:
        pass