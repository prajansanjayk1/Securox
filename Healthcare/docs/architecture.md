# CAREGUARD — System Architecture & Cyber-to-Care Paradigm

## 1. Architectural Philosophy

**CAREGUARD** is an institutional-grade healthcare cybersecurity intelligence platform built on the **Cyber-to-Care Paradigm**:

$$\text{Cyber Threat} \longrightarrow \text{Healthcare Digital Asset} \longrightarrow \text{Healthcare Dependency} \longrightarrow \text{Care Pathway} \longrightarrow \text{Operational Exposure} \longrightarrow \text{Continuity Safeguard}$$

Unlike generic security dashboards that display abstract IP alerts or isolated vulnerability scores, CAREGUARD translates cyber telemetry anomalies into **clinical care workflow exposure**, enabling hospital leaders to protect patient life safety during active attacks.

---

## 2. End-to-End System Topology

```
+-----------------------------------------------------------------------------+
|                               AUTHENTIC DATASETS                            |
|                                                                             |
|   MIMIC-IV-ED Demo v2.2             MIMIC-IV Clinical Demo          eICU CRD Demo v2.0.1    |
|   (Emergency Stays, Triage,         (POE Orders, eMAR Scans,        (Bedside Monitors,      |
|    Pyxis Cabinets, Vitals)           Lab Events, Chartevents)        Ventilators, Pumps)    |
|               \                                |                               /            |
|                \                               |                              /             |
|                 +------------------------------+-----------------------------+              |
|                                                |                                            |
|                                                v                                            |
|                                      ONC HEALTH-IT DATASETS                                 |
|                                (CHPL Linkages, SMART-on-FHIR Apps)                          |
+------------------------------------------------+--------------------------------------------+
                                                 |
                                                 v
+---------------------------------------------------------------------------------------------+
|                                      CAREGUARD BACKEND                                      |
|                                                                                             |
|   STREAMING LOADERS              ANOMALY DETECTORS                 CARE PATHWAY SHADOWS     |
|   • mimic_ed_loader              • POE Velocity Burst              • Emergency Intake       |
|   • mimic_clinical_loader        • Pyxis Dispensing Surge          • Critical Care ICU      |
|   • eicu_loader                  • IoMT Telemetry Dropout          • Clinical Labs          |
|   • onc_loader                   • BCMA Barcode Bypass Surge       • Inpatient Pharmacy     |
|                                  • SMART-on-FHIR Probe             • Surgical Services      |
|                                                |                                            |
|                                                v                                            |
|                                    CYBER CARE CARTOGRAPHY                                   |
|                               • Dependency Graph Topology                                   |
|                               • Cascade Blast Radius Engine                                 |
|                               • Explainable Risk Calculation                                |
|                               • Continuity Safeguards                                       |
+------------------------------------------------+--------------------------------------------+
                                                 |
                                      REST API (/api/*)
                                                 |
                                                 v
+---------------------------------------------------------------------------------------------+
|                                      CAREGUARD FRONTEND                                     |
|                                (React + Vite + Tailwind CSS)                                |
|                                                                                             |
|   [Overview]       [Cartography]    [Threats]        [Pathways]       [Blast Radius]        |
|   Systemic Risk    Dependency Map   Anomaly Feed     Shadow Matrix    Cascade Explorer      |
|                                                                                             |
|   [Devices]        [Health-IT]      [Risk Model]     [Evidence]       [Response]            |
|   IoMT Telemetry   FHIR Ecosystem   Explainable WHY  Table Inspector  Continuity Actions    |
+---------------------------------------------------------------------------------------------+
```

---

## 3. Core Engine Components

### 3.1 Data Ingestion & Sanitization Layer (`backend/app/data/`)
* **Streaming Memory-Efficient Loaders**: Direct decompression and chunk-based streaming of gzip CSVs (`.csv.gz`) inside zip archives.
* **Sanitization Guarantee**: Automated conversion of floating-point `NaN`, `Inf`, and `-Inf` to JSON-compliant `None`, preventing serialization exceptions.
* **Zero Synthetic Data Mandate**: Pure rejection of Faker or synthetic datasets.

### 3.2 Healthcare Anomaly Detection Engine (`backend/app/detection/`)
* **Statistical Rate Anomaly**: Z-score and sliding-window rate tracking across Provider Order Entry (`poe.csv.gz`) and Pyxis automated dispensing cabinets (`pyxis.csv.gz`).
* **Medical Device Telemetry Integrity**: Real-time packet loss, frame freeze, and physiological bound checking across continuous monitor streams (`vitalPeriodic.csv.gz`) and mechanical ventilator settings (`respiratoryCharting.csv.gz`).
* **Closed-Loop Verification Auditing**: Anomaly surges in barcode medication verification omission reasons (`emar_detail.csv.gz`).

### 3.3 Cyber Care Cartography Topology (`backend/app/healthcare/dependencies/`)
Represents the hospital's digital infrastructure as a directional dependency graph connecting 7 core digital assets to 5 care pathways.

### 3.4 Cascade Blast Radius Engine (`backend/app/healthcare/blast_radius.py`)
Computes cascading failure depth if any asset fails, determining:
1. Affected clinical care pathways.
2. Directly impacted clinical milestones.
3. Propagation severity (`CRITICAL_CASCADE`, `HIGH_CASCADE`, `MODERATE_CASCADE`).
4. Prescribed continuity safeguard action to prevent life-safety disruption.

### 3.5 Explainable Risk Engine (`backend/app/healthcare/risk/`)
Computes systemic risk using NIST SP 800-30 Rev 1 and ISO 27799 frameworks:
$$\text{Composite Risk} = \frac{\sum (\text{Pathway Exposure Score} \times \text{Clinical Acuity Weight})}{\sum \text{Clinical Acuity Weights}}$$
Strictly enforces non-clinical patient-safety language ("Potential patient-safety impact: Critical", "Healthcare service availability may be affected").

