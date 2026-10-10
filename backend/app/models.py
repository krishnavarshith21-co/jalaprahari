"""
JALAPRAHARI — Pydantic Data Models
AI-Powered First-Flush Plastic Risk Intelligence
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field

RiskLevel = Literal["low", "moderate", "high", "very-high"]
DrainCondition = Literal["good", "moderate", "poor", "critical"]
DataFreshness = Literal["fresh", "recent", "stale", "unavailable"]
AlertStatus = Literal["new", "acknowledged", "resolved", "escalated"]
ActionStatus = Literal["pending", "acknowledged", "in-progress", "completed"]
UrgencyLevel = Literal["immediate", "within-2h", "within-6h", "within-24h"]
PlasticLevel = Literal["none", "light", "moderate", "heavy", "severe"]
WaterFlow = Literal["dry", "trickle", "normal", "high", "flooding"]

class DrainLocation(BaseModel):
    id: str = Field(..., description="Unique drain inlet identifier")
    name: str = Field(..., description="Human-readable location label")
    area: str = Field(..., description="Bangalore municipal ward / locality")
    lat: float = Field(..., description="Latitude coordinate (synthetic)")
    lng: float = Field(..., description="Longitude coordinate (synthetic)")
    type: Literal["primary", "secondary", "tertiary"] = "primary"
    catchment_area: float = Field(..., description="Catchment drainage area in sq km")
    nearby_land_use: List[str] = Field(default_factory=list)
    drainage_capacity: str = Field(...)
    last_inspection: str = Field(...)
    condition: DrainCondition = "moderate"

class RiskFactor(BaseModel):
    name: str
    value: float
    weight: float = Field(..., description="Provisional prototype weight coefficient")
    normalized_score: float = Field(..., ge=0, le=100)
    description: str
    data_source: str
    is_provisional: bool = True

class RiskAssessment(BaseModel):
    drain_id: str
    risk_index: int = Field(..., ge=0, le=100, description="Relative priority index (0-100), not a probability")
    risk_level: RiskLevel
    leading_factor: str
    rainfall_intensity: float
    antecedent_dry_days: int
    historical_plastic_score: int
    drainage_vulnerability: int
    catchment_exposure: int
    land_use_risk: int
    data_freshness: DataFreshness = "fresh"
    last_updated: str
    explanation: str
    factors: List[RiskFactor]
    recommended_action: str
    confidence: Literal["low", "moderate", "high"] = "moderate"

class WeatherEvent(BaseModel):
    id: str
    expected_start: str
    expected_end: str
    rainfall_intensity: float
    rainfall_duration: float
    probability: float
    source: str
    last_updated: str
    first_flush_risk: RiskLevel
    lead_time: str
    antecedent_dry_days: int
    description: str

class Alert(BaseModel):
    id: str
    drain_id: str
    drain_name: str
    event_id: str
    type: Literal["first-flush-warning", "risk-threshold", "data-stale", "intervention-due"]
    severity: RiskLevel
    message: str
    created_at: str
    status: AlertStatus = "new"
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[str] = None

class AlertAcknowledgeRequest(BaseModel):
    user_name: str = "Municipal Operator"

class InterventionAction(BaseModel):
    id: str
    drain_id: str
    drain_name: str
    area: str
    risk_level: RiskLevel
    reason: str
    recommended_action: str
    urgency: UrgencyLevel
    event_window: str
    assignee: Optional[str] = None
    status: ActionStatus = "pending"
    last_updated: str
    notes: List[str] = Field(default_factory=list)
    plastic_collected: Optional[float] = None

class InterventionActionUpdate(BaseModel):
    status: Optional[ActionStatus] = None
    assignee: Optional[str] = None
    note: Optional[str] = None
    plastic_collected: Optional[float] = None

class ObservationCreate(BaseModel):
    drain_id: str
    observed_by: str
    plastic_level: PlasticLevel
    plastic_weight: Optional[float] = None
    drain_condition: str
    water_flow: WaterFlow
    notes: str = ""

class Observation(ObservationCreate):
    id: str
    drain_name: str
    timestamp: str

class MonitoringHealth(BaseModel):
    status: Literal["operational", "degraded", "offline"] = "operational"
    last_successful_refresh: str
    data_freshness: DataFreshness = "fresh"
    active_sources: List[str]
    data_mode: Literal["live", "synthetic-demo", "stale", "unavailable"] = "synthetic-demo"
    monitoring_interval: int = 30
    next_scheduled_refresh: str

class SimulationParams(BaseModel):
    rainfall_intensity: float = Field(..., ge=1, le=100)
    antecedent_dry_days: int = Field(..., ge=0, le=60)
