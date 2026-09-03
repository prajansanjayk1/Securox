# CAREGUARD — Scientific Methodology & Evaluation Framework

## 1. Anomaly Detection Grounding

All detection mechanisms in CAREGUARD are developed directly against the empirical distributions of the ingested organic datasets.

### 1.1 Provider Order Entry (POE) Velocity Burst Detection
* **Source**: MIMIC-IV Clinical Database (`hosp/poe.csv.gz`).
* **Method**: Rolling time-window transaction velocity estimation.
* **Baseline Distribution**: In authentic hospital operations, POE order generation follows diurnal staffing patterns. Order arrival rate $\lambda_t$ is modeled via Poisson distribution.
* **Anomaly Criterion**:
  $$Z_{\text{poe}} = \frac{\lambda_t - \mu_{\text{dept}}}{\sigma_{\text{dept}}} > 3.5$$
  When $Z > 3.5$, an automated order flood targeting the Core EHR Gateway is flagged.

### 1.2 Connected Medical Device (IoMT) Telemetry Dropout Detection
* **Source**: eICU Collaborative Research Database (`vitalPeriodic.csv.gz` & `respiratoryCharting.csv.gz`).
* **Method**: Sequence gap and frame desynchronization tracking across IEEE 11073 streams.
* **Anomaly Criterion**: Unacknowledged TCP retransmissions exceeding 12 consecutive frames or out-of-physiological-range values (e.g. $\text{SaO}_2 < 40\%$ without hemodynamic collapse flags) indicates network-layer packet scrubbing or sensor manipulation.

### 1.3 Barcode Verification Omission Spike Detection
* **Source**: MIMIC-IV Clinical Database (`hosp/emar_detail.csv.gz`).
* **Method**: Rate of `reason_for_no_barcode` occurrences per 100 dispense events.
* **Anomaly Criterion**: When manual bypasses exceed $4\times$ the historical baseline (typically $\le 3\%$), a high-risk closed-loop medication verification anomaly is flagged.

---

## 2. Care Pathway Operational Exposure Calculation

For each care pathway $P_j$, operational exposure $E(P_j) \in [0, 100]$ is calculated as:

$$E(P_j) = \min\left(100, \sum_{A_i \in \text{Assets}(P_j)} W(T(A_i)) \times \omega(P_j)\right)$$

Where:
* $A_i$ are the digital healthcare assets underpinning pathway $P_j$.
* $W(T(A_i))$ is the cumulative threat weight for attacks targeting asset $A_i$ ($35$ for CRITICAL, $25$ for HIGH, $15$ for MEDIUM).
* $\omega(P_j)$ is the clinical acuity weight ($1.0$ for Emergency and ICU, $0.90$ for Pharmacy, $0.85$ for Laboratory).

### Degradation State Transitions:
* $E(P_j) \ge 75 \implies$ **SEVERELY DEGRADED** (Critical manual fallback protocols engaged).
* $45 \le E(P_j) < 75 \implies$ **DEGRADED** (Digital latency; partial manual overrides).
* $0 < E(P_j) < 45 \implies$ **ELEVATED VULNERABILITY** (Perimeter probe; core services nominal).
* $E(P_j) = 0 \implies$ **NORMAL** (Full telemetry active).
* Unobserved metrics $\implies$ **INSUFFICIENT TELEMETRY** (Never fabricated).

---

## 3. Cascade Blast Radius Traversal

For any compromised digital asset $A_k$, the blast radius graph traversal computes:
1. **Direct Impact (Depth 1)**: All clinical milestones $M \in P_j$ whose explicit digital dependency matches $A_k$.
2. **Secondary Exposure (Depth 2)**: Associated pathways that rely on cross-service handoffs from $A_k$.
3. **Continuity Safeguard Selection**: Selects containment actions that decouple network communication while preserving bedside audible alarms and physical medication dispensing.

