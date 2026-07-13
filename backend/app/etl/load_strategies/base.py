from abc import ABC, abstractmethod

from sqlmodel import Session

from app.etl.schemas import LoadResult
from app.models import Exoplanet


class LoadStrategy(ABC):
    @abstractmethod
    def load(self, session: Session, planets: list[Exoplanet]) -> LoadResult:
        pass
