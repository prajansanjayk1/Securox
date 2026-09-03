"""
CAREGUARD — Explainable Healthcare Cyber Risk Engine
Translates cyber telemetry anomalies into explainable clinical risk scores.
Strictly adheres to defensible non-clinical patient-safety language:
"Potential patient-safety impact: Critical"
"Healthcare service availability may be affected"
"Critical-care digital dependency degraded"
"Care workflow exposure detected"
"Operational continuity risk increased"
Zero Synthetic Data Policy.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.healthcare.exposure.engine import operational_exposure_engine
from app.detection.healthcare_detectors import healthcare_detector_engine
from app.healthcare.pathways.engine import CARE_PATHWAYS

class ExplainableRiskResponse(BaseModel):
    composite_risk_score: int  # 0 - 100
    risk_tier: str  # NOMINAL, ELEVATED, HIGH, CRITICAL_EMERGENCY
    evaluated_pathways_count: int
    active_threats_count: int
    operational_advisory: str
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

        # Build explainable risk drivers answering:
        # WHY? WHAT WAS OBSERVED? WHICH ASSET? WHICH CARE WORKFLOW?
        drivers = []
        for th in threats:
            drivers.append({
                "threat_title": th["title"],
                "severity": th["severity"],
                "targeted_asset": th["targeted_asset_id"],
                "observed_metric": th["observed_metric"],
                "affected_pathways": th["affected_pathways"],
                "evidence_dataset": th["evidence_dataset"]
            })

        return ExplainableRiskResponse(
            composite_risk_score=composite_score,
            risk_tier=tier,
            evaluated_pathways_count=len(exposures),
            active_threats_count=len(threats),
            operational_advisory=advisory,
            risk_drivers=drivers,
            calculation_formula="Composite = Sum(Pathway_Exposure * Acuity_Weight) / Sum(Acuity_Weights)"
        ).model_dump()

healthcare_risk_engine = HealthcareRiskEngine()

