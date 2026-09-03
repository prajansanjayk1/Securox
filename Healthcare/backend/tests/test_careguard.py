"""
CAREGUARD — Comprehensive Automated Verification Test Suite
Tests all loaders, detectors, care pathway shadows, cartography graph,
risk calculations, blast radius, device telemetry, and REST endpoints.
Zero Synthetic Data Policy.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.data.provenance.registry import provenance_ledger
from app.data.loaders.mimic_ed_loader import mimic_ed_loader
from app.data.loaders.mimic_clinical_loader import mimic_clinical_loader
from app.data.loaders.eicu_loader import eicu_loader
from app.data.loaders.onc_loader import onc_loader
from app.detection.healthcare_detectors import healthcare_detector_engine
from app.healthcare.dependencies.graph import dependency_graph_service
from app.healthcare.pathways.engine import care_pathway_service
from app.healthcare.exposure.engine import operational_exposure_engine
from app.healthcare.blast_radius import blast_radius_engine
from app.healthcare.risk.engine import healthcare_risk_engine
from app.healthcare.devices.iomt_engine import iomt_device_engine
from app.healthcare.health_it.engine import health_it_engine

client = TestClient(app)

def test_provenance_and_zero_synthetic_policy():
    prov = provenance_ledger.get_provenance_summary()
    assert prov["policy"] == "VERIFIED_CLINICAL_DATA_POLICY"
    assert "MIMIC_IV_ED" in prov["registered_datasets"]
    assert "MIMIC_IV_CLINICAL" in prov["registered_datasets"]
    assert "EICU_CRD" in prov["registered_datasets"]
    assert "ONC_HEALTH_IT" in prov["registered_datasets"]
    assert "KAGGLE_FAKE_EXCLUDED" not in prov["registered_datasets"]

def test_mimic_ed_loader_real_data():
    mimic_ed_loader.load()
    assert mimic_ed_loader._loaded is True
    assert len(mimic_ed_loader.edstays_sample) > 0
    assert len(mimic_ed_loader.triage_sample) > 0
    assert len(mimic_ed_loader.pyxis_sample) > 0
    # Test table query
    records = mimic_ed_loader.get_table_records("triage", 5)
    assert len(records) == 5
    assert "acuity" in records[0]

def test_mimic_clinical_loader_real_data():
    mimic_clinical_loader.load()
    assert mimic_clinical_loader._loaded is True
    assert len(mimic_clinical_loader.poe_sample) > 0
    assert len(mimic_clinical_loader.emar_sample) > 0
    assert len(mimic_clinical_loader.labevents_sample) > 0
    records = mimic_clinical_loader.get_table_records("poe", 5)
    assert len(records) == 5

def test_eicu_loader_real_device_telemetry():
    eicu_loader.load()
    assert eicu_loader._loaded is True
    assert len(eicu_loader.vital_periodic_sample) > 0
    assert len(eicu_loader.respiratory_sample) > 0
    assert len(eicu_loader.infusion_sample) > 0
    assert len(eicu_loader.patient_sample) > 0

def test_onc_loader_real_infrastructure():
    onc_loader.load()
    assert onc_loader._loaded is True
    assert len(onc_loader.chpl_sample) > 0
    assert len(onc_loader.apps_sample) > 0

def test_detection_engine_authentic_threats():
    threats = healthcare_detector_engine.run_all_detections()
    assert len(threats) >= 4
    event_ids = [t["event_id"] for t in threats]
    assert "CYB_THR_001" in event_ids  # POE Velocity Burst
    assert "CYB_THR_002" in event_ids  # Bedside Telemetry Dropout
    assert "CYB_THR_003" in event_ids  # BCMA Bypass Spike
    assert "CYB_THR_004" in event_ids  # Pyxis Access Surge

def test_dependency_cartography_graph():
    graph = dependency_graph_service.build_cartography_graph()
    assert graph["total_nodes"] >= 12
    assert graph["total_links"] >= 10
    asset_nodes = [n for n in graph["nodes"] if n.get("group") == "ASSET"]
    assert len(asset_nodes) == 7

def test_care_pathways_shadow():
    pathways = care_pathway_service.get_all_pathways()
    assert len(pathways) == 5
    pathway_ids = [p["id"] for p in pathways]
    assert "PATHWAY_ED" in pathway_ids
    assert "PATHWAY_ICU" in pathway_ids
    assert "PATHWAY_LAB" in pathway_ids
    assert "PATHWAY_PHARM" in pathway_ids
    assert "PATHWAY_SURG" in pathway_ids

def test_care_pathway_exposure_states():
    exposures = operational_exposure_engine.calculate_exposures()
    assert len(exposures) == 5
    for exp in exposures:
        assert exp["degradation_state"] in ["NORMAL", "ELEVATED VULNERABILITY", "DEGRADED", "SEVERELY DEGRADED", "UNAVAILABLE", "INSUFFICIENT TELEMETRY"]
        assert 0 <= exp["exposure_score"] <= 100

def test_cascade_blast_radius():
    assessment = blast_radius_engine.evaluate_asset("EHR_CORE_GATEWAY")
    assert assessment is not None
    assert assessment["cascading_failure_depth"] >= 3
    assert "Emergency Intake & Acute Resuscitation" in assessment["directly_impacted_pathways"]
    assert assessment["cascade_propagation_severity"] == "CRITICAL_CASCADE"

def test_explainable_risk_engine():
    risk = healthcare_risk_engine.calculate_systemic_risk()
    assert 0 <= risk["composite_risk_score"] <= 100
    assert risk["risk_tier"] in ["NOMINAL_STABLE", "MONITORED_OPERATIONAL_RISK", "ELEVATED_CLINICAL_RISK", "CRITICAL_CARE_EXPOSURE"]
    assert len(risk["risk_drivers"]) >= 4

def test_iomt_devices_engine():
    overview = iomt_device_engine.get_device_overview()
    assert overview["total_connected_medical_devices"] > 0
    assert len(overview["categories"]) == 3

def test_health_it_engine():
    profile = health_it_engine.get_health_it_profile()
    assert "Epic Systems Corporation" in profile["certified_ehr_market"]["primary_platforms"]
    assert profile["smart_on_fhir_ecosystem"]["total_certified_apps_analyzed"] == 8089

def test_api_rest_endpoints():
    r_overview = client.get("/api/overview")
    assert r_overview.status_code == 200
    assert r_overview.json()["zero_synthetic_data_guarantee"] is True

    r_threats = client.get("/api/threats")
    assert r_threats.status_code == 200
    assert len(r_threats.json()["threats"]) >= 4

    r_assets = client.get("/api/assets")
    assert r_assets.status_code == 200
    assert len(r_assets.json()["assets"]) == 7

    r_deps = client.get("/api/dependencies")
    assert r_deps.status_code == 200
    assert r_deps.json()["total_nodes"] >= 12

    r_pathways = client.get("/api/pathways")
    assert r_pathways.status_code == 200
    assert len(r_pathways.json()["pathways"]) == 5

    r_exposure = client.get("/api/exposure")
    assert r_exposure.status_code == 200
    assert len(r_exposure.json()["pathway_exposures"]) == 5

    r_blast = client.get("/api/blast-radius?asset_id=EHR_CORE_GATEWAY")
    assert r_blast.status_code == 200

    r_devices = client.get("/api/devices")
    assert r_devices.status_code == 200

    r_health_it = client.get("/api/health-it")
    assert r_health_it.status_code == 200

    r_risk = client.get("/api/risk")
    assert r_risk.status_code == 200

    r_evidence = client.get("/api/evidence?table_name=triage&limit=5")
    assert r_evidence.status_code == 200
    assert r_evidence.json()["count"] == 5

    r_datasets = client.get("/api/datasets")
    assert r_datasets.status_code == 200

    # Response action
    r_resp = client.post("/api/response", json={
        "asset_id": "EHR_CORE_GATEWAY",
        "action_type": "RESTRICT_FHIR_API"
    })
    assert r_resp.status_code == 200
    assert r_resp.json()["status"] == "SAFEGUARD_ENFORCED"

