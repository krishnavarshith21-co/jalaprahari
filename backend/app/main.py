"""
JALAPRAHARI — FastAPI Intelligence Server
AI-Powered First-Flush Plastic Risk Intelligence Platform
"""

from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    DrainLocation, RiskAssessment, WeatherEvent, Alert,
    AlertAcknowledgeRequest, InterventionAction, InterventionActionUpdate,
    Observation, ObservationCreate, MonitoringHealth, SimulationParams
)
from .risk_engine import assess_drain_risk
from .data import (
    SYNTHETIC_DRAINS, CURRENT_EVENT, SYNTHETIC_ALERTS, SYNTHETIC_OBSERVATIONS
)

app = FastAPI(
    title="Jalaprahari Risk Engine API",
    description="Backend API for AI-Powered First-Flush Plastic Risk Intelligence Platform (जलप्रहरी)",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory mutable state
drains_db = list(SYNTHETIC_DRAINS)
event_db = CURRENT_EVENT.model_copy()
alerts_db = list(SYNTHETIC_ALERTS)
observations_db = list(SYNTHETIC_OBSERVATIONS)

# Build initial actions from risk calculations
def initialize_actions() -> List[InterventionAction]:
    actions = []
    sorted_drains = sorted(
        drains_db,
        key=lambda d: assess_drain_risk(d, event_db.rainfall_intensity, event_db.antecedent_dry_days).risk_index,
        reverse=True
    )
    for i, drain in enumerate(sorted_drains[:4]):
        assessment = assess_drain_risk(drain, event_db.rainfall_intensity, event_db.antecedent_dry_days)
        actions.append(
            InterventionAction(
                id=f"ACT-{str(i+1).zfill(3)}",
                drain_id=drain.id,
                drain_name=drain.name,
                area=drain.area,
                risk_level=assessment.risk_level,
                reason=f"{assessment.leading_factor} is the leading risk factor (score: {assessment.risk_index}/100). {assessment.explanation}",
                recommended_action=assessment.recommended_action,
                urgency="immediate" if assessment.risk_level == "very-high" else "within-2h",
                event_window=f"{event_db.expected_start[11:16]} — {event_db.expected_end[11:16]}",
                status="acknowledged" if i == 0 else "pending",
                last_updated=datetime.now(timezone.utc).isoformat(),
                notes=["Field team dispatched at 09:15"] if i == 0 else [],
                assignee="Ward 150 Squad Alpha" if i == 0 else None,
            )
        )
    return actions

actions_db = initialize_actions()

_init_now = datetime.now(timezone.utc)
monitoring_health_db = MonitoringHealth(
    status="operational",
    last_successful_refresh=_init_now.isoformat(),
    data_freshness="fresh",
    active_sources=[
        "Weather forecast feed (synthetic demo)",
        "Drainage infrastructure GIS registry",
        "Field inspection logbook"
    ],
    data_mode="synthetic-demo",
    monitoring_interval=30,
    next_scheduled_refresh=(_init_now + timedelta(minutes=30)).isoformat(),
)


# ── Health & Diagnostic Endpoints ──
@app.get("/api/health", response_model=MonitoringHealth, tags=["Diagnostics"])
def get_health():
    """Returns platform operational health and data monitoring mode."""
    try:
        last_dt = datetime.fromisoformat(monitoring_health_db.last_successful_refresh)
        next_dt = last_dt + timedelta(minutes=monitoring_health_db.monitoring_interval)
        monitoring_health_db.next_scheduled_refresh = next_dt.isoformat()
    except Exception:
        pass
    return monitoring_health_db


@app.post("/api/health/refresh", response_model=MonitoringHealth, tags=["Diagnostics"])
def trigger_health_refresh():
    """Triggers an updated sync timestamp for platform monitoring telemetry."""
    now_utc = datetime.now(timezone.utc)
    monitoring_health_db.last_successful_refresh = now_utc.isoformat()
    monitoring_health_db.next_scheduled_refresh = (now_utc + timedelta(minutes=monitoring_health_db.monitoring_interval)).isoformat()
    return monitoring_health_db


# ── Weather Event Endpoints (01 — WHEN?) ──
@app.get("/api/events", response_model=WeatherEvent, tags=["Event Outlook"])
def get_current_event():
    """Returns next assessed rainfall and first-flush window."""
    return event_db


# ── Drainage Location & Risk Endpoints (02 — WHERE? & 03 — WHY?) ──
@app.get("/api/drains", response_model=List[dict], tags=["Drain Intelligence"])
def get_drains():
    """Returns all monitored drainage locations ranked by relative risk index."""
    ranked = []
    for drain in drains_db:
        assessment = assess_drain_risk(drain, event_db.rainfall_intensity, event_db.antecedent_dry_days)
        drain_dict = drain.model_dump()
        drain_dict["risk"] = assessment.model_dump()
        ranked.append(drain_dict)
    
    return sorted(ranked, key=lambda x: x["risk"]["risk_index"], reverse=True)


@app.get("/api/drains/{drain_id}", response_model=DrainLocation, tags=["Drain Intelligence"])
def get_drain_detail(drain_id: str):
    """Retrieves physical drainage structure metadata."""
    drain = next((d for d in drains_db if d.id == drain_id), None)
    if not drain:
        raise HTTPException(status_code=404, detail=f"Drain '{drain_id}' not found.")
    return drain


@app.get("/api/drains/{drain_id}/explanation", response_model=RiskAssessment, tags=["Drain Intelligence"])
def get_drain_explanation(drain_id: str):
    """Generates explainable audit breakdown of contributing risk factors for a drain."""
    drain = next((d for d in drains_db if d.id == drain_id), None)
    if not drain:
        raise HTTPException(status_code=404, detail=f"Drain '{drain_id}' not found.")
    
    return assess_drain_risk(drain, event_db.rainfall_intensity, event_db.antecedent_dry_days)


# ── Municipal Alert Endpoints ──
@app.get("/api/alerts", response_model=List[Alert], tags=["Alerts"])
def get_alerts():
    """Returns active and historical alerts."""
    return alerts_db


@app.post("/api/alerts/{alert_id}/acknowledge", response_model=Alert, tags=["Alerts"])
def acknowledge_alert(alert_id: str, payload: AlertAcknowledgeRequest):
    """Acknowledges an actionable first-flush alert and logs operator ID."""
    alert = next((a for a in alerts_db if a.id == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")
    
    alert.status = "acknowledged"
    alert.acknowledged_by = payload.user_name
    alert.acknowledged_at = datetime.now(timezone.utc).isoformat()
    return alert


# ── Municipal Action Queue Endpoints (04 — WHAT FIRST?) ──
@app.get("/api/actions", response_model=List[InterventionAction], tags=["Interventions"])
def get_actions():
    """Returns prioritized municipal preventive intervention queue."""
    return actions_db


@app.patch("/api/actions/{action_id}", response_model=InterventionAction, tags=["Interventions"])
def update_action(action_id: str, updates: InterventionActionUpdate):
    """Updates status, assignment, or logs collected plastic mass for an action item."""
    action = next((a for a in actions_db if a.id == action_id), None)
    if not action:
        raise HTTPException(status_code=404, detail=f"Action '{action_id}' not found.")
    
    if updates.status is not None:
        action.status = updates.status
    if updates.assignee is not None:
        action.assignee = updates.assignee
    if updates.note is not None:
        time_str = datetime.now(timezone.utc).strftime("%H:%M")
        action.notes.append(f"[{time_str}] {updates.note}")
    if updates.plastic_collected is not None:
        action.plastic_collected = (action.plastic_collected or 0.0) + updates.plastic_collected
        action.status = "completed"
        action.notes.append(f"Recorded {updates.plastic_collected} kg plastic collected.")
    
    action.last_updated = datetime.now(timezone.utc).isoformat()
    return action


# ── Field Observations Endpoints ──
@app.get("/api/observations", response_model=List[Observation], tags=["Observations"])
def get_observations():
    """Returns field observation ground-truth registry."""
    return observations_db


@app.post("/api/observations", response_model=Observation, status_code=status.HTTP_201_CREATED, tags=["Observations"])
def create_observation(obs_data: ObservationCreate):
    """Logs ground observation of plastic buildup and drain condition."""
    drain = next((d for d in drains_db if d.id == obs_data.drain_id), None)
    if not drain:
        raise HTTPException(status_code=404, detail=f"Drain '{obs_data.drain_id}' not found.")
    
    new_obs = Observation(
        id=f"OBS-{str(len(observations_db) + 1).zfill(3)}",
        drain_name=drain.name,
        timestamp=datetime.now(timezone.utc).isoformat(),
        **obs_data.model_dump()
    )
    observations_db.insert(0, new_obs)
    return new_obs


# ── Sensitivity & Scenario Simulation ──
@app.post("/api/simulate", response_model=WeatherEvent, tags=["Simulation"])
def simulate_weather(params: SimulationParams):
    """Dynamically updates meteorological inputs to simulate what-if risk scenarios."""
    global event_db
    
    risk_level = "low"
    if params.rainfall_intensity >= 25 and params.antecedent_dry_days >= 7:
        risk_level = "very-high"
    elif params.rainfall_intensity >= 18 or params.antecedent_dry_days >= 10:
        risk_level = "high"
    elif params.rainfall_intensity >= 10 or params.antecedent_dry_days >= 5:
        risk_level = "moderate"
    
    event_db = WeatherEvent(
        id=event_db.id,
        expected_start=event_db.expected_start,
        expected_end=event_db.expected_end,
        rainfall_intensity=params.rainfall_intensity,
        rainfall_duration=event_db.rainfall_duration,
        probability=event_db.probability,
        source="Simulation model run",
        last_updated=datetime.now(timezone.utc).isoformat(),
        first_flush_risk=risk_level,
        lead_time="Simulated Window",
        antecedent_dry_days=params.antecedent_dry_days,
        description=f"Simulated scenario: {params.rainfall_intensity} mm/hr rainfall following {params.antecedent_dry_days} antecedent dry days. First-flush risk classified as {risk_level.upper()}.",
    )
    return event_db
