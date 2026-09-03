# CAREGUARD — Academic Limitations & Operational Boundaries

## 1. Dataset Scope & Demarcations

1. **Demo Dataset Boundaries**:
   * The MIMIC-IV Clinical Demo (v2.2) and MIMIC-IV-ED Demo (v2.2) contain 100 authentic patient records (222 ED stays, 140 ICU stays). While preserving exact database schemas, table relationships, and temporal distributions, full-scale hospital simulations require the credentialed PhysioNet database.
   * eICU CRD Demo contains 2,520 ICU patient stays from 20 hospital centers. Telemetry parameters represent real physiological measurements, but physical raw network packet captures (PCAP) are not included in the original PhysioNet distribution.

2. **Network-to-Clinical Bridge**:
   * Because public hospital datasets do not distribute live network PCAPs alongside patient records due to HIPAA compliance and patient privacy laws, CAREGUARD links network-level attack vectors to digital assets based on documented healthcare IT architectures (HL7 v2 over MLLP, SMART-on-FHIR REST over TLS, IEEE 11073 medical device communication).

---

## 2. Patient Safety Language Boundaries

* **Non-Clinical Policy**: CAREGUARD is explicitly an **infrastructure and cybersecurity intelligence platform**, NOT a diagnostic medical device or clinical decision support system.
* **Prohibited Phrasing**:
  - NEVER predicts individual patient mortality ("3 patients will die").
  - NEVER infers diagnostic outcomes from cyber events.
* **Approved Phrasing**:
  - "Potential patient-safety impact: Critical"
  - "Healthcare service availability may be affected"
  - "Critical-care digital dependency degraded"
  - "Care workflow exposure detected"
  - "Operational continuity risk increased"

---

## 3. Recommended Research Directions

1. Integration of controlled IoMT cyber testbed datasets (such as WUSTL-EHMS or ECU-IoHT) when live packet feeds are available in the workspace.
2. Federated clinical telemetry validation across regional hospital health information exchanges (HIEs).

