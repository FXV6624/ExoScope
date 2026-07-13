import math

from app.core.constants.exoplanet import CRITERIA
from app.models import ExoplanetBase
from app.schemas.exoplanet import HabitabilityResult


def _gaussian(value: float,optimum: float,sigma: float,) -> float:
    """
    Return a similarity score in the range (0, 1] using
    a Gaussian distribution centred on the optimum value.
    """
    return math.exp(-((value - optimum) ** 2) / (2 * sigma**2))


def calculate_habitability(exoplanet: ExoplanetBase,) -> HabitabilityResult:
    """
    Estimate the habitability of an exoplanet.

    The score is computed as a weighted average of the available
    astrophysical criteria. Missing values are ignored.

    Returns
    -------
    score:
        Habitability score between 0 and 100.

    confidence:
        Fraction of the total criterion weight used in the estimate.
    """

    weighted_score = 0.0
    available_weight = 0.0

    for criterion in CRITERIA:

        value = criterion.getter(exoplanet)

        if value is None:
            continue

        similarity = _gaussian(value=value,optimum=criterion.optimum,sigma=criterion.sigma,)

        weighted_score += similarity * criterion.weight
        available_weight += criterion.weight

    if available_weight == 0.0:
        return HabitabilityResult(score=0.0,confidence=0.0,)

    return HabitabilityResult(
        score=round(weighted_score / available_weight * 100, 1),
        confidence=round(available_weight, 2),
    )
