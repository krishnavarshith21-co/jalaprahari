"""
JALAPRAHARI — API Endpoint Integration Tests
"""

import pytest
from fastapi.testclient import TestClient
try:
    from app.main import app
except ImportError:
    from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["data_mode"] == "synthetic-demo"

def test_events_endpoint():
    response = client.get("/api/events")
    assert response.status_code == 200
    data = response.json()
    assert "rainfall_intensity" in data
    assert "first_flush_risk" in data

def test_drains_endpoint():
    response = client.get("/api/drains")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 8
    assert "risk" in data[0]
    assert 0 <= data[0]["risk"]["risk_index"] <= 100

def test_drain_explanation():
    response = client.get("/api/drains/DR-004/explanation")
    assert response.status_code == 200
    data = response.json()
    assert data["drain_id"] == "DR-004"
    assert len(data["factors"]) == 6
    assert data["leading_factor"] != ""

def test_alerts_and_acknowledge():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) > 0
    target_id = alerts[0]["id"]

    ack_res = client.post(
        f"/api/alerts/{target_id}/acknowledge",
        json={"user_name": "Test Officer"}
    )
    assert ack_res.status_code == 200
    assert ack_res.json()["status"] == "acknowledged"
    assert ack_res.json()["acknowledged_by"] == "Test Officer"

def test_create_observation():
    obs_payload = {
        "drain_id": "DR-001",
        "observed_by": "Test Field Agent",
        "plastic_level": "moderate",
        "plastic_weight": 5.5,
        "drain_condition": "Good",
        "water_flow": "dry",
        "notes": "Test survey",
    }
    response = client.post("/api/observations", json=obs_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["drain_id"] == "DR-001"
    assert data["plastic_weight"] == 5.5
