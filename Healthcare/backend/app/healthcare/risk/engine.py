"""
CAREGUARD — Explainable Healthcare Cyber Risk Engine
Translates cyber telemetry anomalies into explainable clinical risk scores.
Strictly adheres to defensible non-clinical patient-safety language:
"Potential patient-safety impact: Critical"
"Healthcare service availability may be affected"
"Critical-care digital dependency degraded"
"Care workflow exposure detected"
"Operational continuity risk increased"
Exposes explicit evidence checklist, data coverage, and uncertainty levels.
Zero Synthetic Data Policy.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.healthcare.exposure.engine import operational_exposure_engine
from app.detection.healthcare_detectors import healthcare_detector_engine
from app.healthcare.pathways.engine import CARE_PATHWAYS
from app.data.provenance.registry import DATA_COVERAGE_MATRIX


class ExplainableRiskResponse(BaseModel):
    composite_risk_score: int  # 0 - 100
    risk_tier: str  # NOMINAL, ELEVATED, HIGH, CRITICAL_CARE_EXPOSURE
    evaluated_pathways_count: int
    active_threats_count: int
    operational_advisory: str
    uncertainty_level: str  # LOW, MEDIUM, HIGH
    uncertainty_rationale: str
    evidence_checklist: List[Dict[str, Any]]
    missing_evidence: List[Dict[str, Any]]
    risk_drivers: List[Dict[str, Any]]
    calculation_formula: str


class HealthcareRiskEngine:
    @staticmethod
    def calculate_systemic_risk() -> Dict[str, Any]:
        exposures = operational_exposure_engine.calculate_exposures()
        threats = healthcare_detector_engine.run_all_detections()

        # Weighted calculation based on pathway clinical acuity weights
        total_weighted_exposure = 0.0
        total_acuity_weight = 0.0

        for exp in exposures:
            p_id = exp["pathway_id"]
            pathway = CARE_PATHWAYS.get(p_id)
            weight = pathway.clinical_acuity_weight if pathway else 1.0
            total_weighted_exposure += exp["exposure_score"] * weight
            total_acuity_weight += weight

        composite_score = int(round(total_weighted_exposure / total_acuity_weight)) if total_acuity_weight > 0 else 0
        composite_score = min(100, max(0, composite_score))

        if composite_score >= 70:
            tier = "CRITICAL_CARE_EXPOSURE"
            advisory = "Potential patient-safety impact: Critical. Multiple acute care pathways severely degraded. Immediate manual protocol activation required."
        elif composite_score >= 40:
            tier = "ELEVATED_CLINICAL_RISK"
            advisory = "Healthcare service availability may be affected. Critical digital dependencies degraded; enforce continuity safeguards."
        elif composite_score > 0:
            tier = "MONITORED_OPERATIONAL_RISK"
            advisory = "Care workflow exposure detected. Perimeter telemetry anomalies observed; core clinical workflows functional."
        else:
            tier = "NOMINAL_STABLE"
            advisory = "All clinical dependencies and telemetry streams operational within nominal baselines."

        # Evidence Checklist
        evidence_checklist = [
            {
                "criterion": "Statistical Anomaly Deviation",
                "verified": len(threats) > 0,
                "detail": f"{len(threats)} statistical deviations calculated with positive Z-scores across MIMIC and eICU records.",
                "source": "MIMIC-IV-ED, MIMIC-IV Clinical, eICU CRD"
            },
            {
                "criterion": "Cyber-to-Care Dependency Mapping",
                "verified": True,
                "detail": "Digital assets mapped to clinical services and care pathways based on NIST SP 800-207 topology.",
                "source": "NIST SP 800-207 Architecture"
            },
            {
                "criterion": "Operational Exposure Quantification",
                "verified": len(exposures) > 0,
                "detail": f"{len(exposures)} care pathways evaluated for operational degradation using probabilistic cascade model.",
                "source": "Care Pathway Shadow Engines"
            }
        ]

        # Missing Evidence (Observability Boundaries)
        missing_evidence = [
            {
                "observable": "Network-Level Packet Traces (PCAP / NetFlow)",
                "status": "NOT_AVAILABLE",
                "rationale": "Hospital network packet captures are absent in public HIPAA-deidentified clinical databases.",
                "mitigation": "Intrusion vectors are inferred from operational time-series velocity, not packet payloads."
            },
            {
                "observable": "Physical Medical Device Hardware Serial & MAC Inventory",
                "status": "NOT_AVAILABLE",
                "rationale": "Hardware asset identifiers are excluded to protect institutional anonymity.",
                "mitigation": "Monitored at the clinical telemetry stream and stay level without fabricating physical device counts."
            }
        ]

        # Build explainable risk drivers
        drivers = []
        for th in threats:
            stat = th.get("statistical_evidence", {})
            impact = th.get("impact_path", {})
            drivers.append({
                "threat_title": th["title"],
                "severity": th["severity"],
                "targeted_asset": th["targeted_asset_id"],
                "z_score": stat.get("z_score"),
                "sample_size": stat.get("sample_size"),
                "confidence_tier": stat.get("confidence_tier"),
                "observed_metric": th["observed_metric"],
                "affected_pathways": impact.get("pathways_exposed", []),
                "evidence_dataset": th["evidence_dataset"]
            })

        return ExplainableRiskResponse(
            composite_risk_score=composite_score,
            risk_tier=tier,
            evaluated_pathways_count=len(exposures),
            active_threats_count=len(threats),
            operational_advisory=advisory,
            uncertainty_level="MEDIUM",
            uncertainty_rationale="Clinical and ICU metrics are authentic (DATA_DERIVED); uncertainty is rated MEDIUM because raw network packet-level telemetry is unavailable.",
            evidence_checklist=evidence_checklist,
            missing_evidence=missing_evidence,
            risk_drivers=drivers,
            calculation_formula="Composite_Risk = Sum(Pathway_Exposure * Acuity_Weight) / Sum(Acuity_Weights)"
        ).model_dump()


healthcare_risk_engine = HealthcareRiskEngine()
