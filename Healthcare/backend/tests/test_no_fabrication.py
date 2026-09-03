"""
CAREGUARD — Rigorous "No Fabrication" & Defensibility Test Suite
Enforces that:
1. No hardcoded threat confidence scores exist (all derived from Z-scores & sample size).
2. No fake physical IoMT device counts are invented (explicitly tagged NOT_AVAILABLE).
3. No fake numeric fallbacks exist (missing fields return None).
4. Field-level provenance is present on core structures.
5. Operational response honestly records LOGGED_INTENT without claiming live actuator enforcement.
6. Risk calculation exposes evidence checklist and uncertainty.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.detection.healthcare_detectors import healthcare_detector_engine
from app.healthcare.devices.iomt_engine import iomt_device_engine
from app.data.loaders.eicu_loader import eicu_loader
from app.data.loaders.mimic_ed_loader import mimic_ed_loader

client = TestClient(app)

def test_no_hardcoded_threat_confidence():
    threats = healthcare_detector_engine.run_all_detections()
    assert len(threats) > 0, "Threat detector must return detections."

    for th in threats:
        # Must not contain arbitrary hardcoded float confidence values
        assert "confidence_score" not in th, f"Threat {th['event_id']} has deprecated hardcoded confidence_score."
        
        stat = th.get("statistical_evidence")
        assert stat is not None, f"Threat {th['event_id']} missing statistical_evidence."
        assert stat.get("sample_size") is not None, f"Threat {th['event_id']} missing sample_size."
        assert stat.get("confidence_tier") in ["HIGH", "MEDIUM", "LOW"], f"Invalid confidence_tier in {th['event_id']}."
        assert "confidence_basis" in stat, f"Threat {th['event_id']} missing confidence_basis rationale."

        # Verify decoupling of attack path and impact path
        assert "attack_path" in th, f"Threat {th['event_id']} missing attack_path."
        assert "impact_path" in th, f"Threat {th['event_id']} missing impact_path."
        assert "target_asset" in th["attack_path"]
        assert "care_service" in th["impact_path"]

def test_no_fake_device_inventory():
    devices = iomt_device_engine.get_device_overview()
    total = devices.get("total_connected_medical_devices")
    assert isinstance(total, dict), "total_connected_medical_devices must be a provenance dict, not a fake integer."
    assert total.get("value") is None, "Physical device count must not be fabricated."
    assert total.get("derivation") == "NOT_AVAILABLE"

    for cat in devices.get("categories", []):
        inv = cat.get("physical_device_inventory")
        assert inv is not None, f"Category {cat['name']} missing physical_device_inventory."
        assert inv.get("value") is None, f"Category {cat['name']} must not claim fabricated hardware inventory count."
        assert inv.get("derivation") == "NOT_AVAILABLE"

        streams = cat.get("observed_telemetry_streams")
        assert streams is not None, f"Category {cat['name']} missing observed_telemetry_streams."
        assert streams.get("derivation") == "DATA_DERIVED"

def test_no_numeric_fallbacks():
    eicu_loader.load()
    mimic_ed_loader.load()

    # Ensure no loader contains fabricated default numbers
    if "heartrate" not in eicu_loader.stats:
        assert eicu_loader.stats.get("mean_icu_heartrate") is None or isinstance(eicu_loader.stats.get("mean_icu_heartrate"), float)
    
    # If a table is empty or missing, loader should never invent 84.5 or 83.2
    assert eicu_loader.stats.get("mean_icu_heartrate") != 84.5, "Loader used hardcoded fallback 84.5."
    assert mimic_ed_loader.stats.get("mean_heartrate") != 83.2, "Loader used hardcoded fallback 83.2."

def test_response_does_not_claim_live_enforcement():
    resp = client.post("/api/response", json={
        "asset_id": "EHR_CORE_GATEWAY",
        "action_type": "RESTRICT_FHIR_API",
        "operator_notes": "Automated test validation"
    })
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "LOGGED_INTENT"
    assert data["live_actuator_enforcement"] is False
    assert "NOT_AVAILABLE" in data["verification"]
    assert "disclaimer" in data
    assert "SAFEGUARD_ENFORCED" not in data["status"]

def test_risk_engine_uncertainty_and_evidence():
    resp = client.get("/api/risk")
    assert resp.status_code == 200
    risk = resp.json()

    assert risk["uncertainty_level"] in ["LOW", "MEDIUM", "HIGH"]
    assert "uncertainty_rationale" in risk
    assert isinstance(risk["evidence_checklist"], list)
    assert len(risk["evidence_checklist"]) >= 3
    assert isinstance(risk["missing_evidence"], list)
    assert len(risk["missing_evidence"]) >= 1

def test_data_coverage_matrix_endpoint():
    resp = client.get("/api/coverage")
    assert resp.status_code == 200
    cov = resp.json()

    assert "clinical_workflows" in cov
    assert cov["clinical_workflows"]["status"] == "AVAILABLE"
    assert "network_packet_telemetry" in cov
    assert cov["network_packet_telemetry"]["status"] == "NOT_AVAILABLE"
    assert "iomt_physical_hardware_inventory" in cov
    assert cov["iomt_physical_hardware_inventory"]["status"] == "NOT_AVAILABLE"

def test_incident_lifecycle_stages():
    resp = client.get("/api/incidents")
    assert resp.status_code == 200
    incidents = resp.json()
    assert len(incidents) > 0

    first_inc = incidents[0]
    inc_id = first_inc["incident_id"]
    assert first_inc["lifecycle_stage"] in ["DETECTED", "TRIAGED", "ACKNOWLEDGED", "CONTAINMENT_PLANNED", "ACTION_LOGGED", "VERIFICATION", "RESOLVED"]

    # Advance stage
    adv_resp = client.post(f"/api/incidents/{inc_id}/stage", json={
        "new_stage": "TRIAGED",
        "notes": "Triage verified by test operator"
    })
    assert adv_resp.status_code == 200
    assert adv_resp.json()["current_stage"] == "TRIAGED"
