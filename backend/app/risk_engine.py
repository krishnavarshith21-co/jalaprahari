"""
JALAPRAHARI — Explainable Risk Engine
AI-Powered First-Flush Plastic Risk Intelligence

⚠ TRANSPARENCY NOTICE:
Weights and scoring formulas in this engine represent provisional prototype
baseline assumptions derived from environmental literature (first-flush surface
loading and urban hydrology principles). Scores are relative priority indexes (0-100),
not statistical probabilities. In production, these heuristic coefficients will be
calibrated via empirical ground-truth observations.
"""

from typing import List, Tuple
from .models import DrainLocation, RiskFactor, RiskAssessment, RiskLevel

# ── Provisional Prototype Weights (Sum = 1.00) ──
WEIGHT_RAINFALL = 0.25
WEIGHT_DRY_DAYS = 0.20
WEIGHT_LAND_USE = 0.20
WEIGHT_DRAIN_CONDITION = 0.15
WEIGHT_CATCHMENT = 0.10
WEIGHT_HISTORICAL = 0.10

def normalize_rainfall(rainfall_mm_hr: float) -> float:
    """Normalizes rainfall intensity from 0-40 mm/hr to 0-100 score."""
    return min(100.0, max(0.0, (rainfall_mm_hr / 40.0) * 100.0))

def normalize_dry_days(dry_days: int) -> float:
    """Normalizes antecedent dry period from 0-14 days to 0-100 score."""
    return min(100.0, max(0.0, (dry_days / 14.0) * 100.0))

def normalize_catchment(catchment_sq_km: float) -> float:
    """Normalizes catchment area from 0-5 sq km to 0-100 score."""
    return min(100.0, max(0.0, (catchment_sq_km / 5.0) * 100.0))

def calculate_land_use_score(land_uses: List[str]) -> float:
    """Computes plastic generation potential score based on surrounding urban land use."""
    text = " ".join(land_uses).lower()
    if "bus terminal" in text or "commercial hub" in text:
        return 88.0
    if "vegetable market" in text or "street food" in text or "market" in text:
        return 82.0
    if "commercial" in text:
        return 68.0
    if "construction" in text:
        return 55.0
    return 42.0

def calculate_condition_score(condition: str) -> float:
    """Computes drain vulnerability from physical inspection rating."""
    cond_map = {
        "critical": 92.0,
        "poor": 75.0,
        "moderate": 50.0,
        "good": 25.0,
    }
    return cond_map.get(condition.lower(), 50.0)

def classify_risk_level(index: int) -> RiskLevel:
    """Classifies relative risk index into operational tiers."""
    if index >= 75:
        return "very-high"
    if index >= 55:
        return "high"
    if index >= 35:
        return "moderate"
    return "low"

def generate_factors(drain: DrainLocation, rainfall: float, dry_days: int) -> List[RiskFactor]:
    """Generates the transparent component risk factors with audit details."""
    rf_score = normalize_rainfall(rainfall)
    dd_score = normalize_dry_days(dry_days)
    lu_score = calculate_land_use_score(drain.nearby_land_use)
    co_score = calculate_condition_score(drain.condition)
    ca_score = normalize_catchment(drain.catchment_area)
    hi_score = lu_score * 0.9  # Baseline historical proxy

    return [
        RiskFactor(
            name="Rainfall Intensity",
            value=rainfall,
            weight=WEIGHT_RAINFALL,
            normalized_score=rf_score,
            description=f"Expected {rainfall} mm/hr intensity. {'Strong enough to mobilize surface debris.' if rainfall > 20 else 'Moderate mobilization potential.'}",
            data_source="Weather forecast (synthetic demo)",
            is_provisional=True,
        ),
        RiskFactor(
            name="Antecedent Dry Period",
            value=float(dry_days),
            weight=WEIGHT_DRY_DAYS,
            normalized_score=dd_score,
            description=f"{dry_days} days since last significant rain. {'Extended dry period allows substantial plastic accumulation.' if dry_days > 7 else 'Recent rain may have partially cleared surfaces.'}",
            data_source="Historical meteorological records",
            is_provisional=True,
        ),
        RiskFactor(
            name="Land Use Exposure",
            value=lu_score,
            weight=WEIGHT_LAND_USE,
            normalized_score=lu_score,
            description=f"Nearby land use includes: {', '.join(drain.nearby_land_use)}. {'High plastic generation potential from commercial activity.' if lu_score > 70 else 'Moderate generation potential.'}",
            data_source="Urban land use survey",
            is_provisional=True,
        ),
        RiskFactor(
            name="Drainage Vulnerability",
            value=co_score,
            weight=WEIGHT_DRAIN_CONDITION,
            normalized_score=co_score,
            description=f'Drain condition rated "{drain.condition}". {"Compromised drainage increases blockage and overflow risk." if co_score > 60 else "Drainage infrastructure in acceptable condition."}',
            data_source="Field inspection records",
            is_provisional=True,
        ),
        RiskFactor(
            name="Catchment Exposure",
            value=drain.catchment_area,
            weight=WEIGHT_CATCHMENT,
            normalized_score=ca_score,
            description=f"Catchment area of {drain.catchment_area} sq km. {'Large catchment concentrates runoff from multiple sources.' if drain.catchment_area > 3 else 'Moderate catchment area.'}",
            data_source="GIS watershed delineation",
            is_provisional=True,
        ),
        RiskFactor(
            name="Historical Observations",
            value=hi_score,
            weight=WEIGHT_HISTORICAL,
            normalized_score=hi_score,
            description="Historical plastic accumulation observed at or near this structure.",
            data_source="Field observation logbook",
            is_provisional=True,
        ),
    ]

def recommend_action(risk_level: RiskLevel, drain: DrainLocation) -> str:
    """Generates site-appropriate preventive municipal action."""
    if risk_level == "very-high":
        return f"Immediate pre-event drain inspection and plastic debris removal at {drain.name}. Deploy temporary screening if available. Clear surrounding surface litter within 200m radius of drain inlet."
    if risk_level == "high":
        return f"Priority inspection of {drain.name} within 2 hours. Remove visible plastic accumulation from drain inlet and upstream channel section. Document observed litter volume."
    if risk_level == "moderate":
        return f"Scheduled inspection of {drain.name} within 6 hours. Check drain inlet for obstructions and note plastic accumulation levels in the surrounding area."
    return f"Routine monitoring of {drain.name}. No immediate intervention needed based on current risk assessment."

def assess_drain_risk(drain: DrainLocation, rainfall: float, dry_days: int) -> RiskAssessment:
    """Computes explainable risk assessment for a single drainage structure."""
    factors = generate_factors(drain, rainfall, dry_days)
    weighted_sum = sum(f.normalized_score * f.weight for f in factors)
    risk_index = round(min(100.0, max(0.0, weighted_sum)))
    risk_level = classify_risk_level(risk_index)

    # Sort factors by weighted contribution to identify leading driver
    sorted_factors = sorted(factors, key=lambda f: f.normalized_score * f.weight, reverse=True)
    leading_factor = sorted_factors[0].name if sorted_factors else "Rainfall Intensity"

    explanation = (
        f"Risk assessment for {drain.name} based on expected {rainfall} mm/hr rainfall "
        f"after {dry_days}-day dry period. Leading factor: {leading_factor}. "
        f"{'High plastic mobilization potential due to commercial density and drain geometry.' if risk_level in ['very-high', 'high'] else 'Conditions remain within manageable thresholds.'}"
    )

    return RiskAssessment(
        drain_id=drain.id,
        risk_index=risk_index,
        risk_level=risk_level,
        leading_factor=leading_factor,
        rainfall_intensity=rainfall,
        antecedent_dry_days=dry_days,
        historical_plastic_score=round(factors[5].normalized_score),
        drainage_vulnerability=round(factors[3].normalized_score),
        catchment_exposure=round(factors[4].normalized_score),
        land_use_risk=round(factors[2].normalized_score),
        data_freshness="fresh",
        last_updated="2026-10-09T08:15:00+05:30",
        explanation=explanation,
        factors=factors,
        recommended_action=recommend_action(risk_level, drain),
        confidence="moderate" if risk_level in ["very-high", "high"] else "low",
    )
