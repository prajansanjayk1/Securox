# CAREGUARD — Scientific Methodology & Evaluation Framework

## 1. Anomaly Detection Grounding & Statistical Formulation

All detection mechanisms in CAREGUARD are computed directly against the empirical distributions of the ingested organic datasets. Hardcoded confidence scores and static threat scenarios have been completely eliminated.

### 1.1 Provider Order Entry (POE) Velocity Burst Detection
* **Source**: MIMIC-IV Clinical Database (`hosp/poe.csv.gz`).
* **Method**: Timestamped transaction rate aggregation into 1-hour windows.
* **Baseline Distribution**: Computes historical sample mean ($\mu_{\text{poe}}$) and standard deviation ($\sigma_{\text{poe}}$) across active hourly bins.
* **Anomaly Criterion**:
  $$Z_{\text{poe}} = \frac{X_{\text{observed}} - \mu_{\text{poe}}}{\sigma_{\text{poe}}}$$
  When $Z_{\text{poe}} \ge 2.5$, a high-frequency computerized order velocity burst targeting the Core EHR Gateway is flagged.
* **Confidence Tier**: High if sample size $N \ge 40$ and $|Z| \ge 3.0$; Medium if $N \ge 20$ and $|Z| \ge 2.0$; otherwise Low.

### 1.2 Connected Medical Device (IoMT) Telemetry Gap Detection
* **Source**: eICU Collaborative Research Database (`vitalPeriodic.csv.gz`).
* **Method**: Continuous inter-observation sequence offset delta ($\Delta t = t_{i} - t_{i-1}$) tracking across bedside physiological telemetry frames.
* **Anomaly Criterion**:
  $$Z_{\text{vit}} = \frac{\Delta t_{\text{max}} - \mu_{\Delta t}}{\sigma_{\Delta t}}$$
  When the inter-frame latency gap deviates significantly from nominal cadence ($Z \ge 2.0$), a bedside monitoring stream gap is flagged. Acoustic bedside alarms remain the verified local fail-safe.

### 1.3 Barcode Medication Administration (BCMA) Omission Spike Detection
* **Source**: MIMIC-IV Clinical Database (`hosp/emar_detail.csv.gz`).
* **Method**: Proportion of administrations with non-empty `reason_for_no_barcode` reason codes relative to total administered doses.
* **Anomaly Criterion**: When observed omission rate exceeds standard clinical baseline ($\mu_0 \le 1.5\%$), an operational deviation is logged.

### 1.4 Pyxis Dispensing Cabinet Surge Detection
* **Source**: MIMIC-IV-ED (`ed/pyxis.csv.gz`).
* **Method**: Hourly binning of automated medication dispensing drawer activations.
* **Anomaly Criterion**: $Z$-score exceeding $2.0\sigma$ above ward baseline indicates rapid medication access requiring charge nurse verification.

### 1.5 Health-IT Ecosystem Interoperability Pattern
* **Source**: U.S. ONC Health IT Certification & Marketplace History.
* **Method**: External API integration attack surface footprint analysis.
* **Attribution**: Classified as `REFERENCE_ANALYSIS` / `INFERRED`. Raw network-level packet telemetry is explicitly designated as `NOT_AVAILABLE`.

---

## 2. Decoupled Attack Path vs Healthcare Impact Path

CAREGUARD strictly decouples cyber threat mechanics from clinical impact propagation:

```
ATTACK PATH (Cyber Side)
  Threat Signature / Event
       ↓
  Exploit Vector (e.g., CPOE injection, cabinet rate burst)
       ↓
  Targeted Digital Asset (e.g., EHR_CORE_GATEWAY)
       ↓
  Observed Protocol (HL7 v2.x, FHIR, IEEE 11073)

HEALTHCARE IMPACT PATH (Clinical Side)
  Targeted Digital Asset
       ↓
  Clinical Dependency (e.g., Five-Rights Verification, CPOE Interface)
       ↓
  Care Delivery Service (e.g., Acute Resuscitation, Pharmacotherapy)
       ↓
  Care Pathway (e.g., Emergency Intake, Critical Care / ICU)
       ↓
  Operational Degradation State (NORMAL, DEGRADED, SEVERELY DEGRADED)
```

---

## 3. Care Pathway Operational Exposure Calculation

For each care pathway $P_j$, operational exposure score $E(P_j) \in [0, 100]$ is computed using a probabilistic cascade model based on NIST SP 800-30:

$$E(P_j) = \min\left(100, \text{round}\left(100 \times \left[1 - \prod_{k=1}^K (1 - \min(0.85, I_k \times C(A_k)))\right] \times \omega(P_j)\right)\right)$$

Where:
* $I_k = \min(1.0, \frac{|Z_k|}{3.5})$ is the normalized statistical anomaly intensity.
* $C(A_k)$ is the asset criticality weight ($1.0$ for `LIFE_CRITICAL`, $0.8$ for `HIGH_CLINICAL`, $0.5$ for `OPERATIONAL_SUPPORT`).
* $\omega(P_j)$ is the clinical pathway acuity weight ($1.0$ for Emergency & ICU, $0.90$ for Pharmacy, $0.85$ for Laboratory).

### Degradation State Transitions:
* $E(P_j) \ge 70 \implies$ **SEVERELY DEGRADED** (Immediate manual/paper protocol activation).
* $40 \le E(P_j) < 70 \implies$ **DEGRADED** (Workflow latency elevated; secondary digital verification offline).
* $0 < E(P_j) < 40 \implies$ **ELEVATED VULNERABILITY** (Perimeter anomaly observed; clinical delivery functional).
* $E(P_j) = 0 \implies$ **NORMAL** (Telemetry and dependencies nominal).

---

## 4. 7-Stage Incident Lifecycle & Honest Response Architecture

CAREGUARD implements a defensible, stateful incident lifecycle:

$$\text{DETECTED} \longrightarrow \text{TRIAGED} \longrightarrow \text{ACKNOWLEDGED} \longrightarrow \text{CONTAINMENT PLANNED} \longrightarrow \text{ACTION LOGGED} \longrightarrow \text{VERIFICATION} \longrightarrow \text{RESOLVED}$$

### Response Execution Model:
* **Execution Classification**: `LOGGED_INTENT`.
* **Environment**: `RESEARCH / SIMULATED SOC (NON-PRODUCTION)`.
* **Live Actuator Enforcement**: `False`.
* **Verification Status**: `NOT_AVAILABLE` (unless a physical hardware telemetry delta is genuinely observed).

---

## 5. Observational Boundaries & Completeness Matrix

| Domain | Status | Source | Observability Scope |
| :--- | :--- | :--- | :--- |
| **Clinical Workflows** | **AVAILABLE** | MIMIC-IV Clinical & ED | CPOE orders, eMAR administrations, triage acuity, Pyxis events |
| **ICU Physiological Telemetry** | **AVAILABLE** | eICU CRD v2.0.1 | Heart rate, SaO2, NIBP, ventilation settings, infusion rates |
| **Health-IT Certification** | **AVAILABLE** | ONC Health IT | EHR vendor profiles, SMART-on-FHIR marketplace registrations |
| **Network Packet Traces** | **NOT AVAILABLE** | *None* | PCAP/NetFlow absent from HIPAA-deidentified public archives |
| **Physical Device Inventory** | **NOT AVAILABLE** | *None* | Hardware MAC addresses, serials, and switch VLANs absent |
