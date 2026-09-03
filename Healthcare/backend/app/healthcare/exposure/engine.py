"""
CAREGUARD — Care Pathway Operational Exposure Engine
Calculates the operational degradation state of clinical workflows when
underlying digital assets or dependencies are compromised.
States: NORMAL, DEGRADED, SEVERELY DEGRADED, UNAVAILABLE, INSUFFICIENT TELEMETRY.
Zero Synthetic Data Policy.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.healthcare.pathways.engine import CARE_PATHWAYS
from app.healthcare.dependencies.graph import DIGITAL_HEALTHCARE_ASSETS
from app.detection.healthcare_detectors import healthcare_detector_engine

class PathwayExposureState(BaseModel):
    pathway_id: str
    pathway_name: str
    exposure_score: int  # 0 - 100
    degradation_state: str
    clinical_impact_note: str
    active_threat_ids: List[str]
    underlying_impacted_assets: List[str]
    source_dataset: str

class OperationalExposureEngine:
    """
    Translates observed cyber threats and asset compromises into
    clinical care pathway operational exposure and degradation states.
    """
    def calculate_exposures(self) -> List[Dict[str, Any]]:
        threats = healthcare_detector_engine.run_all_detections()
        exposures = []

        # Map asset compromises
        asset_threat_map: Dict[str, List[Dict[str, Any]]] = {}
        for t in threats:
            target = t.get("targeted_asset_id")
            if target:
                asset_threat_map.setdefault(target, []).append(t)

        for p_id, pathway in CARE_PATHWAYS.items():
            # Find relevant threats
            relevant_threats = []
            impacted_assets = []
            total_threat_weight = 0

            for asset_id in pathway.primary_assets:
                if asset_id in asset_threat_map:
                    impacted_assets.append(asset_id)
                    for th in asset_threat_map[asset_id]:
                        relevant_threats.append(th["event_id"])
                        sev = th.get("severity", "MEDIUM")
                        if sev == "CRITICAL":
                            total_threat_weight += 40
                        elif sev == "HIGH":
                            total_threat_weight += 25
                        else:
                            total_threat_weight += 15

            # Calculate score scaled by pathway clinical acuity weight
            raw_score = int(min(100, total_threat_weight * pathway.clinical_acuity_weight))

            if raw_score >= 70:
                deg_state = "SEVERELY DEGRADED"
                clinical_note = "Potential patient-safety impact: Critical. Immediate care delivery relies on paper/manual overrides. STAT response required."
            elif raw_score >= 40:
                deg_state = "DEGRADED"
                clinical_note = "Healthcare service availability may be affected. Workflow latency elevated; secondary digital verification offline."
            elif raw_score > 0:
                deg_state = "ELEVATED VULNERABILITY"
                clinical_note = "Operational continuity risk increased. Digital perimeter probe detected; clinical operations remain nominal."
            else:
                deg_state = "NORMAL"
                clinical_note = "All clinical dependencies and telemetry streams operational within nominal baselines."

            exposures.append(PathwayExposureState(
                pathway_id=p_id,
                pathway_name=pathway.name,
                exposure_score=raw_score,
                degradation_state=deg_state,
                clinical_impact_note=clinical_note,
                active_threat_ids=relevant_threats,
                underlying_impacted_assets=impacted_assets,
                source_dataset=pathway.source_dataset
            ).model_dump())

        return exposures

operational_exposure_engine = OperationalExposureEngine()

