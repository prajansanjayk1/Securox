"""
CAREGUARD — Authentic Cyberdatasets Integration Test Suite
Validates that:
1. Real cybersecurity files from cyberdatasets/ are discovered and parsed.
2. PCAP files are genuinely read with packet counts, durations, and rates.
3. Attack categories are dynamically extracted from source files without fabrication.
4. Hospital threat database reflects authentic Medicare cyberattack diversion/delay counts.
5. REST endpoints under /api/cyber/* respond with 200 OK and genuine records.
Zero Synthetic Data Policy enforced.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.data.loaders.cyber_loader import cyber_dataset_loader

client = TestClient(app)

def test_cyber_loader_ingestion():
    cyber_dataset_loader.load()
    summary = cyber_dataset_loader.get_summary()

    assert summary["policy"] == "AUTHENTIC_CYBER_DATASET_POLICY"
    assert summary["total_files_discovered"] >= 50
    assert summary["total_records_indexed"] > 1_000_000
    assert summary["total_attack_flows"] > 0
    assert summary["total_benign_flows"] > 0
    assert len(summary["ciciomt2024_attack_categories"]) >= 10
    assert summary["monitored_iomt_devices_count"] >= 9

def test_pcap_parsing_real_packet_metrics():
    devices = cyber_dataset_loader.get_iomt_devices()
    assert len(devices) >= 9

    # Checkme O2 Pulse Oximeter PCAP
    checkme = next((d for d in devices if "CheckmeO2" in d["file_name"]), None)
    assert checkme is not None
    assert checkme["packet_count"] > 1000
    assert checkme["total_bytes"] > 10000
    assert checkme["duration_seconds"] > 60.0
    assert checkme["linktype"] == 201  # Bluetooth HCI
    assert len(checkme["sample_packets"]) > 0

    # Bluetooth DoS Attack PCAP
    bt_dos = next((d for d in devices if "Bluetooth_DoS" in d["file_name"]), None)
    assert bt_dos is not None
    assert bt_dos["packet_count"] > 50000
    assert bt_dos["packets_per_sec"] > 50.0

def test_no_fake_device_names():
    devices = cyber_dataset_loader.get_iomt_devices()
    for d in devices:
        # Must not contain arbitrary made-up vendor names like Philips or Puritan Bennett
        assert "Philips" not in d["device_name"]
        assert "Puritan" not in d["device_name"]
        assert "Alaris" not in d["device_name"]
        # Must match genuine filename
        assert d["file_name"].endswith(".pcap")
        assert d["derivation"] == "DATA_DERIVED"

def test_hospital_threat_database_grounding():
    hosp = cyber_dataset_loader.get_hospital_threat_database()
    assert hosp["total_records"] == 4349
    assert hosp["er_diversions_observed"] == 52
    assert hosp["surgical_cancellation_delays_observed"] == 79
    assert hosp["derivation"] == "DATA_DERIVED"

def test_cyber_api_rest_endpoints():
    r_overview = client.get("/api/cyber/overview")
    assert r_overview.status_code == 200
    assert r_overview.json()["total_records_indexed"] > 1_000_000

    r_devices = client.get("/api/cyber/devices")
    assert r_devices.status_code == 200
    assert r_devices.json()["devices_count"] >= 9

    r_cats = client.get("/api/cyber/categories")
    assert r_cats.status_code == 200
    assert "MQTT-DDoS-Publish_Flood" in r_cats.json() or "ARP_Spoofing" in r_cats.json()

    r_hosp = client.get("/api/cyber/hospital-threats")
    assert r_hosp.status_code == 200
    assert r_hosp.json()["er_diversions_observed"] == 52

    r_inv = client.get("/api/cyber/inventory")
    assert r_inv.status_code == 200
    assert r_inv.json()["total_files"] >= 50
