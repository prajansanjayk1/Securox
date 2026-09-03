"""
CAREGUARD — Cyber Care Cartography Topology & Dependency Graph
Maps:
CYBER ASSET -> DIGITAL SERVICE -> HEALTHCARE DEPENDENCY -> CARE PATHWAY -> OPERATIONAL EXPOSURE
Zero Synthetic Data Policy.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class HealthcareDigitalAsset(BaseModel):
    id: str
    name: str
    category: str
    ip_address: str
    port: int
    protocol: str
    primary_vendor: str
    associated_pathways: List[str]
    critical_dependencies: List[str]
    source_dataset: str
    operational_status: str = "ONLINE"
    active_threat_level: str = "NOMINAL"

DIGITAL_HEALTHCARE_ASSETS: Dict[str, HealthcareDigitalAsset] = {
    "EHR_CORE_GATEWAY": HealthcareDigitalAsset(
        id="EHR_CORE_GATEWAY",
        name="Hospital Core EHR FHIR Gateway",
        category="Health-IT & Provider Order Entry",
        ip_address="10.240.10.12",
        port=443,
        protocol="HTTPS / SMART-on-FHIR REST API",
        primary_vendor="Epic Systems / Cerner Corp (ONC Certified)",
        associated_pathways=["PATHWAY_ED", "PATHWAY_ICU", "PATHWAY_PHARM", "PATHWAY_LAB"],
        critical_dependencies=[
            "Provider Order Entry (POE) Order Placement",
            "Patient Clinical History & Demographics Retrieval",
            "Emergency Care Acuity Record Synchronization"
        ],
        source_dataset="MIMIC-IV hosp/poe.csv.gz & ONC hospital-promoting-interoperability-chpl-linkage.csv",
        operational_status="ONLINE",
        active_threat_level="ELEVATED"
    ),
    "EMAR_BCMA_SERVER": HealthcareDigitalAsset(
        id="EMAR_BCMA_SERVER",
        name="Closed-Loop Barcode Med Verification Server (eMAR)",
        category="Inpatient Pharmacy & Medication Administration",
        ip_address="10.240.12.45",
        port=8080,
        protocol="HL7 v2.5.1 / MLLP TCP",
        primary_vendor="Omnicell / Pyxis MedStation Enterprise",
        associated_pathways=["PATHWAY_PHARM", "PATHWAY_ICU"],
        critical_dependencies=[
            "Five-Rights Barcode Verification (Patient, Drug, Dose, Route, Time)",
            "Automated Pyxis Dispensing Cabinet Override Locks",
            "STAT Medication Administration Record Logging"
        ],
        source_dataset="MIMIC-IV hosp/emar.csv.gz & hosp/emar_detail.csv.gz",
        operational_status="ONLINE",
        active_threat_level="NOMINAL"
    ),
    "ICU_BEDSIDE_TELEMETRY_GW": HealthcareDigitalAsset(
        id="ICU_BEDSIDE_TELEMETRY_GW",
        name="Philips IntelliVue Bedside Monitor Telemetry Gateway",
        category="Critical Care Medical Device / IoMT",
        ip_address="10.240.14.88",
        port=5000,
        protocol="Proprietary Medical LAN / IEEE 11073-MDC",
        primary_vendor="Philips Healthcare Critical Care",
        associated_pathways=["PATHWAY_ICU", "PATHWAY_SURG"],
        critical_dependencies=[
            "Continuous Electrocardiogram (ECG) Waveform Feed",
            "Continuous SaO2 Arterial Oxygenation Stream",
            "Central Nursing Station Acoustic Alarm Annunciation"
        ],
        source_dataset="eICU vitalPeriodic.csv.gz & MIMIC-IV icu/chartevents.csv.gz",
        operational_status="ONLINE",
        active_threat_level="NOMINAL"
    ),
    "LAB_ANALYZER_LIS": HealthcareDigitalAsset(
        id="LAB_ANALYZER_LIS",
        name="Laboratory Information System (LIS) Interface",
        category="Clinical Diagnostics & Instrumentation",
        ip_address="10.240.18.22",
        port=2575,
        protocol="HL7 LIS Specimen Results / ASTM E1394",
        primary_vendor="Sunquest / Roche Cobas Laboratory Suite",
        associated_pathways=["PATHWAY_LAB", "PATHWAY_ED", "PATHWAY_ICU"],
        critical_dependencies=[
            "Automated Specimen Barcode Accessioning",
            "STAT Panic Lab Value Telephone/Broadcast Alerting",
            "Troponin, Lactate & Blood Gas Diagnostic Feeds"
        ],
        source_dataset="MIMIC-IV hosp/labevents.csv.gz & eICU lab.csv.gz",
        operational_status="ONLINE",
        active_threat_level="NOMINAL"
    ),
    "ED_TRIAGE_TERMINAL": HealthcareDigitalAsset(
        id="ED_TRIAGE_TERMINAL",
        name="Emergency Department Intake Triage Workstation",
        category="Emergency Department Clinical Operations",
        ip_address="10.240.20.15",
        port=443,
        protocol="HTTPS Web Client / TLS 1.3",
        primary_vendor="Epic ASAP Emergency Department Information System",
        associated_pathways=["PATHWAY_ED"],
        critical_dependencies=[
            "Emergency Severity Index (ESI 1-5) Acuity Scoring",
            "Rapid Trauma Bay Registration & Bed Allocation",
            "Inbound Ambulance Transfer-of-Care Handoff"
        ],
        source_dataset="MIMIC-IV-ED edstays.csv.gz & triage.csv.gz",
        operational_status="ONLINE",
        active_threat_level="NOMINAL"
    ),
    "SMART_INFUSION_PUMP_GW": HealthcareDigitalAsset(
        id="SMART_INFUSION_PUMP_GW",
        name="Smart IV Infusion Pump Wireless Gateway",
        category="Medical Device / Connected Drug Delivery",
        ip_address="10.240.22.99",
        port=8443,
        protocol="WPA3-Enterprise / TLS Smart Pump Dose Error Reduction System",
        primary_vendor="BD Alaris / B. Braun Space Wireless",
        associated_pathways=["PATHWAY_ICU", "PATHWAY_PHARM"],
        critical_dependencies=[
            "Dose Error Reduction System (DERS) Drug Library Pushes",
            "Continuous Vasoactive Infusion Rate Telemetry (infusiondrug)",
            "High-Alert Medication Soft/Hard Stop Infusion Safeguards"
        ],
        source_dataset="eICU infusiondrug.csv.gz",
        operational_status="ONLINE",
        active_threat_level="NOMINAL"
    ),
    "VENTILATOR_TELEMETRY_SERVER": HealthcareDigitalAsset(
        id="VENTILATOR_TELEMETRY_SERVER",
        name="ICU Mechanical Ventilator Telemetry Server",
        category="Life-Critical Medical Device / Respiratory",
        ip_address="10.240.24.110",
        port=4001,
        protocol="Serial-over-Ethernet / IEEE 11073",
        primary_vendor="Medtronic Puritan Bennett / Draeger Evita",
        associated_pathways=["PATHWAY_ICU"],
        critical_dependencies=[
            "FiO2 Delivered Oxygen Concentration Feeds",
            "PEEP Positive End-Expiratory Pressure Monitoring",
            "Apnea and High Peak Inspiratory Pressure Alarms"
        ],
        source_dataset="eICU respiratoryCharting.csv.gz",
        operational_status="ONLINE",
        active_threat_level="NOMINAL"
    )
}

class DependencyGraphService:
    @staticmethod
    def get_all_assets() -> List[Dict[str, Any]]:
        return [a.model_dump() for a in DIGITAL_HEALTHCARE_ASSETS.values()]

    @staticmethod
    def get_asset(asset_id: str) -> Optional[Dict[str, Any]]:
        asset = DIGITAL_HEALTHCARE_ASSETS.get(asset_id)
        return asset.model_dump() if asset else None

    @staticmethod
    def build_cartography_graph() -> Dict[str, Any]:
        nodes = []
        links = []

        for a in DIGITAL_HEALTHCARE_ASSETS.values():
            nodes.append({
                "id": a.id,
                "label": a.name,
                "group": "ASSET",
                "category": a.category,
                "status": a.operational_status,
                "threat": a.active_threat_level,
                "ip": a.ip_address,
                "port": a.port,
                "dataset": a.source_dataset
            })

            for pathway_id in a.associated_pathways:
                links.append({
                    "source": a.id,
                    "target": pathway_id,
                    "type": "DEPENDS_ON",
                    "relationship": "Underpins Clinical Workflow"
                })

        pathway_defs = [
            {"id": "PATHWAY_ED", "label": "Emergency Intake & Resuscitation", "group": "PATHWAY"},
            {"id": "PATHWAY_ICU", "label": "Critical Care / Intensive Care Unit", "group": "PATHWAY"},
            {"id": "PATHWAY_LAB", "label": "Clinical Diagnostics & Laboratory", "group": "PATHWAY"},
            {"id": "PATHWAY_PHARM", "label": "Inpatient Pharmacy & eMAR", "group": "PATHWAY"},
            {"id": "PATHWAY_SURG", "label": "Surgical & Perioperative Services", "group": "PATHWAY"}
        ]
        for p in pathway_defs:
            nodes.append(p)

        return {
            "nodes": nodes,
            "links": links,
            "total_nodes": len(nodes),
            "total_links": len(links),
            "derivation": "MIMIC-IV, eICU, and ONC Health IT documented dependencies"
        }

dependency_graph_service = DependencyGraphService()

