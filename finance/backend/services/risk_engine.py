"""
Securox — Risk Intelligence Engine
Computes a dynamic composite risk score (0–100) per smart-city asset.

Score = weighted combination of:
  • Anomaly severity     (from Isolation Forest)
  • Asset criticality   (static weights per asset type)
  • Propagation risk    (graph-based blast-radius estimate)
  • Historical trend    (LSTM predicted peak)
  • Active threat intel (live threat flags)
"""

import logging
import math
from datetime import datetime, timezone
from typing import Literal

logger = logging.getLogger("securox.risk")

# ── asset criticality weights ─────────────────────────────────────────────────
ASSET_CRITICALITY: dict[str, float] = {
    # Tier 0 — Critical Infrastructure
    "power_grid":          1.00,
    "core_banking":        0.98,
    "payment_gateway":     0.97,
    "tax_portal":          0.96,
    "banking_api":         0.95,
    # Tier 1 — High Criticality
    "upi_gateway":         0.90,
    "fastag_infra":        0.88,
    "metro_payment":       0.86,
    "utility_billing":     0.84,
    "identity_provider":   0.82,
    # Tier 2 — Important Services
    "water_supply":        0.78,
    "healthcare":          0.75,
    "traffic_system":      0.70,
    "citizen_auth":        0.72,
    "emergency_svcs":      0.88,
    "citizen_services":    0.72,
    # Tier 3 — Supporting Infrastructure
    "iot_gateways":        0.45,
    "unknown":             0.50,
}

# Propagation adjacency (which assets a compromised one can spread to)
PROPAGATION_GRAPH: dict[str, list[str]] = {
    "power_grid":        ["core_banking", "water_supply", "traffic_system"],
    "core_banking":      ["payment_gateway", "banking_api", "tax_portal"],
    "payment_gateway":   ["upi_gateway", "fastag_infra", "metro_payment"],
    "tax_portal":        ["citizen_auth", "utility_billing"],
    "banking_api":       ["upi_gateway", "identity_provider"],
    "upi_gateway":       ["citizen_services"],
    "fastag_infra":      ["traffic_system"],
    "metro_payment":     ["traffic_system"],
    "utility_billing":   ["water_supply"],
    "identity_provider": ["citizen_auth"],
    "water_supply":      ["healthcare"],
    "healthcare":        [],
    "traffic_system":    ["emergency_svcs"],
    "citizen_auth":      ["citizen_services"],
    "emergency_svcs":    [],
    "citizen_services":  [],
    "iot_gateways":      [],
}

RiskCategory = Literal["CATASTROPHIC", "CRITICAL", "HIGH", "MODERATE", "LOW", "NORMAL"]


def _propagation_multiplier(asset: str) -> float:
    """
    BFS blast-radius: count how many downstream assets could be affected.
    Returns a multiplier in [1.0, 1.5].
    """
    visited = set()
    queue   = list(PROPAGATION_GRAPH.get(asset, []))
    while queue:
        node = queue.pop()
        if node not in visited:
            visited.add(node)
            queue.extend(PROPAGATION_GRAPH.get(node, []))
    return round(1.0 + min(len(visited) / 8.0, 0.5), 4)


def categorise(score: float) -> RiskCategory:
    if score >= 90:  return "CATASTROPHIC"
    if score >= 75:  return "CRITICAL"
    if score >= 60:  return "HIGH"
    if score >= 40:  return "MODERATE"
    if score >= 20:  return "LOW"
    return "NORMAL"


def confidence_from_sources(n_sources: int, anomaly_certainty: float) -> float:
    """Higher confidence with more corroborating data sources."""
    source_factor = min(n_sources / 4.0, 1.0)
    return round(0.4 + 0.6 * source_factor * anomaly_certainty, 3)


class RiskEngine:
    """
    Multidimensional Composite Risk Intelligence Engine.
    Calculates Cyber Risk, Financial Risk, Infrastructure Risk, and Overall Composite Risk.
    """

    def compute(
        self,
        asset: str,
        anomaly_score: float,          # 0–1 from Ensemble Anomaly Detector
        predicted_peak: float,         # 0–100 from LSTM
        n_outlier_ips: int,            # from DBSCAN
        active_threat_flags: list[str],
        financial_anomaly_factor: float = 0.0, # 0–1
        historical_avg: float = 20.0,  # rolling 24-hour average
    ) -> dict:
        """
        Returns a full multidimensional risk assessment dict.
        """
        criticality   = ASSET_CRITICALITY.get(asset, 0.5)
        propagation   = _propagation_multiplier(asset)

        # ── Component Normalized Risk Sub-scores (0.0 to 1.0) ───────────────────
        c_cyber         = min(1.0, max(anomaly_score, (len(active_threat_flags) * 0.25)))
        c_financial     = min(1.0, max(financial_anomaly_factor, anomaly_score * (0.9 if asset in {"core_banking", "payment_gateway", "upi_gateway", "tax_portal"} else 0.4)))
        c_behavioral    = min(1.0, (n_outlier_ips * 0.15))
        c_criticality   = criticality
        c_propagation   = min(1.0, (propagation - 1.0) / 0.5)
        c_threat_intel  = min(1.0, len(active_threat_flags) * 0.3)
        c_forecast      = min(1.0, predicted_peak / 100.0)

        # ── Weighted Multidimensional Formula ────────────────────────────────────
        # R_total = 0.25*Cyber + 0.20*Financial + 0.15*Behavioral + 0.15*Criticality + 0.10*Propagation + 0.10*Intel + 0.05*Forecast
        r_total = (
            0.25 * c_cyber +
            0.20 * c_financial +
            0.15 * c_behavioral +
            0.15 * c_criticality +
            0.10 * c_propagation +
            0.10 * c_threat_intel +
            0.05 * c_forecast
        )

        overall_score = round(max(0.0, min(100.0, r_total * 100.0)), 1)
        
        # Institutional Sub-scores (0-100)
        cyber_risk_score = round(c_cyber * 100.0, 1)
        financial_risk_score = round(c_financial * 100.0, 1)
        infrastructure_risk_score = round((0.4 * c_criticality + 0.4 * c_propagation + 0.2 * c_cyber) * 100.0, 1)

        category   = categorise(overall_score)
        confidence = confidence_from_sources(
            n_sources=1 + (1 if active_threat_flags else 0) + (1 if n_outlier_ips else 0),
            anomaly_certainty=anomaly_score,
        )

        # Base financial exposure estimation in ₹ Cr
        base_exposure = {
            "core_banking": 85.0, "payment_gateway": 62.5, "tax_portal": 38.0,
            "banking_api": 50.0, "upi_gateway": 28.5, "fastag_infra": 14.2,
            "metro_payment": 11.8, "utility_billing": 16.0, "identity_provider": 22.0
        }.get(asset, 8.0)
        
        estimated_exposure_cr = round(base_exposure * (financial_risk_score / 100.0), 2)

        return {
            "asset":                    asset,
            "risk_score":               overall_score,
            "overall_risk":             overall_score,
            "cyber_risk":               cyber_risk_score,
            "financial_risk":           financial_risk_score,
            "infrastructure_risk":      infrastructure_risk_score,
            "risk_category":            category,
            "confidence":               confidence,
            "criticality_weight":       criticality,
            "propagation_mult":         propagation,
            "financial_exposure_cr":    estimated_exposure_cr,
            "potentially_affected_assets": list(PROPAGATION_GRAPH.get(asset, [])),
            "component_scores": {
                "cyber":         round(c_cyber * 100, 1),
                "financial":     round(c_financial * 100, 1),
                "behavioral":    round(c_behavioral * 100, 1),
                "criticality":   round(c_criticality * 100, 1),
                "propagation":   round(c_propagation * 100, 1),
                "threat_intel":  round(c_threat_intel * 100, 1),
                "forecast":      round(c_forecast * 100, 1),
            },
            "active_threat_flags":      active_threat_flags,
            "timestamp":                datetime.now(timezone.utc).isoformat(),
        }

    def city_aggregate(self, asset_scores: list[dict]) -> dict:
        """
        Roll up per-asset scores into a single city-wide institutional risk overview.
        """
        if not asset_scores:
            return {
                "overall_score": 0, "cyber_risk": 0, "financial_risk": 0, "infrastructure_risk": 0,
                "category": "NORMAL", "financial_exposure_cr": 0.0, "assets_at_risk": 0
            }

        scores       = [a.get("risk_score", 0) for a in asset_scores]
        cyber_scores = [a.get("cyber_risk", 0) for a in asset_scores]
        fin_scores   = [a.get("financial_risk", 0) for a in asset_scores]
        infra_scores = [a.get("infrastructure_risk", 0) for a in asset_scores]
        exposures    = [a.get("financial_exposure_cr", 0.0) for a in asset_scores]

        max_score = max(scores)
        avg_score = sum(scores) / len(scores)
        city_score = round(max_score * 0.6 + avg_score * 0.4, 1)

        city_cyber = round(max(cyber_scores) * 0.6 + (sum(cyber_scores)/len(cyber_scores)) * 0.4, 1)
        city_fin   = round(max(fin_scores) * 0.6 + (sum(fin_scores)/len(fin_scores)) * 0.4, 1)
        city_infra = round(max(infra_scores) * 0.6 + (sum(infra_scores)/len(infra_scores)) * 0.4, 1)
        total_exposure = round(sum(exposures), 2)

        return {
            "overall_score":          city_score,
            "cyber_risk":             city_cyber,
            "financial_risk":         city_fin,
            "infrastructure_risk":    city_infra,
            "category":               categorise(city_score),
            "financial_exposure_cr":  total_exposure,
            "max_asset_score":        max_score,
            "avg_asset_score":        round(avg_score, 1),
            "assets_at_risk":         sum(1 for s in scores if s >= 40),
            "critical_assets":        [a["asset"] for a in asset_scores if a.get("risk_score", 0) >= 75],
        }


# ── module singleton ──────────────────────────────────────────────────────────
risk_engine = RiskEngine()
