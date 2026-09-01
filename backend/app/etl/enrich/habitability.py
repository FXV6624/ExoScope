"""Habitability Scorer — Kopparapu et al. (2013, ApJ 765, 131).

Two-tier scoring system:
  Tier 1 (40%): Habitable Zone position based on Kopparapu stellar flux
                polynomials.  Uses incident_flux directly when available,
                or computes it from stellar_luminosity + semi_major_axis.
  Tier 2 (60%): Weighted Gaussian similarity across multiple astrophysical
                criteria (temperature, size, composition, orbital, stellar).

Confidence = data_completeness × model_precision
"""

import math

from app.core.constants.exoplanet import (
    HABITABILITY_CRITERIA,
    HZ_BOUNDARIES,
    HZ_POSITION_WEIGHT,
    HZBoundaryCoefficients,
)
from app.models import ExoplanetBase
from app.schemas.exoplanet import HabitabilityResult


def _kopparapu_s_eff(coefficients: HZBoundaryCoefficients, t_eff: float) -> float:
    """Compute the critical stellar flux at a HZ boundary.

    S_eff = S_eff☉ + a·T* + b·T*² + c·T*³ + d·T*⁴
    where T* = T_eff - 5780 K
    """
    t_star = t_eff - 5780.0
    return float(
        coefficients.s_eff_sun
        + coefficients.a * t_star
        + coefficients.b * t_star**2
        + coefficients.c * t_star**3
        + coefficients.d * t_star**4
    )


def _hz_position_score(
    flux: float,
    t_eff: float,
) -> float:
    """Score [0, 1] based on where the planet's flux sits relative to the HZ.

    Returns:
        1.0  — within conservative HZ
        0.7  — within optimistic HZ (but outside conservative)
        0→0.5 — exponential decay outside optimistic HZ
    """
    inner_conservative = _kopparapu_s_eff(HZ_BOUNDARIES["runaway_greenhouse"], t_eff)
    outer_conservative = _kopparapu_s_eff(HZ_BOUNDARIES["maximum_greenhouse"], t_eff)
    inner_optimistic = _kopparapu_s_eff(HZ_BOUNDARIES["recent_venus"], t_eff)
    outer_optimistic = _kopparapu_s_eff(HZ_BOUNDARIES["early_mars"], t_eff)

    # Inside conservative HZ
    if outer_conservative <= flux <= inner_conservative:
        return 1.0

    # Inside optimistic HZ (but outside conservative)
    if outer_optimistic <= flux <= inner_optimistic:
        return 0.70

    # Outside optimistic HZ — exponential decay
    if flux > inner_optimistic:
        overshoot = (flux - inner_optimistic) / max(inner_optimistic, 0.01)
        return 0.50 * math.exp(-3.0 * overshoot)

    if flux < outer_optimistic:
        undershoot = (outer_optimistic - flux) / max(outer_optimistic, 0.01)
        return 0.50 * math.exp(-3.0 * undershoot)

    return 0.0  # pragma: no cover


def _get_incident_flux(exoplanet: ExoplanetBase) -> tuple[float | None, float]:
    """Get the incident flux, either directly or computed from luminosity + SMA.

    Returns (flux, precision_factor) where precision_factor reflects
    measurement quality (1.0 = direct, 0.90 = computed).
    """
    if exoplanet.incident_flux is not None:
        return exoplanet.incident_flux, 1.0

    # Compute from luminosity and semi-major axis
    lum = exoplanet.stellar_luminosity
    sma = exoplanet.semi_major_axis

    if lum is not None and sma is not None and sma > 0:
        # stellar_luminosity is in log10(L/L☉) in NASA archive
        luminosity_linear = 10.0**lum
        flux = luminosity_linear / (sma**2)
        return flux, 0.90

    return None, 0.0


def _gaussian(value: float, optimum: float, sigma: float) -> float:
    """Gaussian similarity score in (0, 1]."""
    return math.exp(-((value - optimum) ** 2) / (2 * sigma**2))


def calculate_habitability(exoplanet: ExoplanetBase) -> HabitabilityResult:
    """Estimate exoplanet habitability using a two-tier Kopparapu-based model.

    Returns
    -------
    score : float
        Habitability score between 0 and 100.
    confidence : float
        Combined data completeness × model precision, between 0 and 1.
    """
    total_possible_weight = HZ_POSITION_WEIGHT + sum(
        c.weight for c in HABITABILITY_CRITERIA
    )

    # ── Tier 1: Habitable Zone Position (40% weight) ──────────────────────

    tier1_score = 0.0
    tier1_weight_used = 0.0
    tier1_precision = 1.0

    t_eff = exoplanet.stellar_effective_temperature
    flux, flux_precision = _get_incident_flux(exoplanet)

    if flux is not None and t_eff is not None:
        tier1_score = _hz_position_score(flux, t_eff) * HZ_POSITION_WEIGHT
        tier1_weight_used = HZ_POSITION_WEIGHT
        tier1_precision = flux_precision
    elif flux is not None:
        # No stellar temperature — use Sun-like default (5780 K)
        tier1_score = _hz_position_score(flux, 5780.0) * HZ_POSITION_WEIGHT
        tier1_weight_used = HZ_POSITION_WEIGHT
        tier1_precision = flux_precision * 0.85  # additional penalty for missing T_eff

    # ── Tier 2: Planetary Properties (60% weight) ─────────────────────────

    tier2_score = 0.0
    tier2_weight_used = 0.0

    for criterion in HABITABILITY_CRITERIA:
        value = criterion.getter(exoplanet)
        if value is None:
            continue

        similarity = _gaussian(value, criterion.optimum, criterion.sigma)
        tier2_score += similarity * criterion.weight
        tier2_weight_used += criterion.weight

    # ── Combine ───────────────────────────────────────────────────────────

    total_weight_used = tier1_weight_used + tier2_weight_used

    if total_weight_used == 0.0:
        return HabitabilityResult(score=0.0, confidence=0.0)

    # Normalize: score is the weighted average scaled to 0-100
    raw_score = (tier1_score + tier2_score) / total_weight_used * 100.0

    # Confidence = data completeness × model precision
    data_completeness = total_weight_used / total_possible_weight
    model_precision = tier1_precision if tier1_weight_used > 0 else 1.0

    confidence = data_completeness * model_precision

    return HabitabilityResult(
        score=round(raw_score, 1),
        confidence=round(confidence, 4),
    )
