"""
JALAPRAHARI — Risk Engine Unit Test Suite
Verify mathematical consistency, normalization, and bounds.
"""

import pytest
from backend.app.models import DrainLocation
from backend.app.risk_engine import (
    assess_drain_risk,
    normalize_rainfall,
    normalize_dry_days,
    normalize_catchment,
    classify_risk_level,
    calculate_land_use_score,
    calculate_condition_score,
    recommend_action,
)

@pytest.fixture
def sample_drain():
    return DrainLocation(
        id="TEST-001",
        name="Test Outfall Drain",
        area="Test Ward",
        lat=12.9500,
        lng=77.6000,
        type="primary",
        catchment_area=3.0,
        nearby_land_use=["Vegetable market", "Commercial market"],
        drainage_capacity="2m channel",
        last_inspection="2026-10-01",
        condition="poor",
    )

def test_normalization_bounds():
    """Verify that normalization helpers strictly stay within [0, 100]."""
    assert normalize_rainfall(0.0) == 0.0
    assert normalize_rainfall(40.0) == 100.0
    assert normalize_rainfall(120.0) == 100.0  # Capped at 100

    assert normalize_dry_days(0) == 0.0
    assert normalize_dry_days(14) == 100.0
    assert normalize_dry_days(30) == 100.0  # Capped at 100

    assert normalize_catchment(0.0) == 0.0
    assert normalize_catchment(5.0) == 100.0
    assert normalize_catchment(10.0) == 100.0

def test_risk_index_bounds(sample_drain):
    """Verify risk index is always between 0 and 100."""
    # Low storm
    low_assessment = assess_drain_risk(sample_drain, rainfall=0.0, dry_days=0)
    assert 0 <= low_assessment.risk_index <= 100

    # Severe storm
    high_assessment = assess_drain_risk(sample_drain, rainfall=50.0, dry_days=20)
    assert 0 <= high_assessment.risk_index <= 100

def test_monotonicity(sample_drain):
    """Verify that increased rainfall or longer dry period monotonically increases risk."""
    base = assess_drain_risk(sample_drain, rainfall=15.0, dry_days=5)
    more_rain = assess_drain_risk(sample_drain, rainfall=35.0, dry_days=5)
    more_dry_days = assess_drain_risk(sample_drain, rainfall=15.0, dry_days=14)

    assert more_rain.risk_index >= base.risk_index
    assert more_dry_days.risk_index >= base.risk_index

def test_risk_tier_classification():
    """Verify operational risk tiers."""
    assert classify_risk_level(85) == "very-high"
    assert classify_risk_level(65) == "high"
    assert classify_risk_level(45) == "moderate"
    assert classify_risk_level(20) == "low"

def test_explanation_and_recommendation(sample_drain):
    """Verify natural language diagnostics and actionable advice."""
    assessment = assess_drain_risk(sample_drain, rainfall=30.0, dry_days=12)
    assert assessment.leading_factor != ""
    assert sample_drain.name in assessment.explanation
    assert len(assessment.factors) == 6
    assert "Immediate" in assessment.recommended_action or "Priority" in assessment.recommended_action
