# CAREGUARD — Cyber-to-Care Healthcare Security Intelligence Platform

[![Healthcare Security](https://img.shields.io/badge/Domain-Healthcare_Cybersecurity-rose)](https://github.com)
[![Data Policy](https://img.shields.io/badge/Data_Policy-100%25_Organic_Data-emerald)](https://physionet.org)
[![NIST](https://img.shields.io/badge/Compliance-NIST_SP_800--207-blue)](https://csrc.nist.gov)
[![Python](https://img.shields.io/badge/Backend-FastAPI-teal)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-purple)](https://vitejs.dev)

---

## 1. Executive Mission

**CAREGUARD** is an institutional-grade healthcare cybersecurity intelligence platform built from scratch to answer the fundamental question:

> *"How can a healthcare organization detect cyber risk early, understand which healthcare services are exposed, determine the operational consequences, and prioritize a safe response?"*

CAREGUARD introduces the **Cyber-to-Care Paradigm**:

$$\text{Cyber Threat / Telemetry Anomaly} \longrightarrow \text{Healthcare IT Asset} \longrightarrow \text{Healthcare Dependency} \longrightarrow \text{Care Pathway} \longrightarrow \text{Operational Exposure} \longrightarrow \text{Continuity-Aware Response}$$

---

## 2. Zero Synthetic Data Policy (Non-Negotiable)

CAREGUARD is built exclusively on organic, authentic healthcare datasets present in the workspace:

| Dataset | Provenance | Record Count | Operational Role |
| :--- | :--- | :--- | :--- |
| **MIMIC-IV-ED Demo v2.2** | Beth Israel Deaconess Medical Center / PhysioNet | 5,873 entries (6 tables) | Grounding for Emergency Intake Care Pathway & Pyxis automated dispensing cabinet telemetry. |
| **MIMIC-IV Clinical Demo v2.2** | Beth Israel Deaconess Medical Center / MIT LCP | 988,321 entries (12 tables) | Grounding for Inpatient Pharmacy, Provider Order Entry (POE), eMAR barcode verification & ICU care. |
| **eICU CRD Demo v2.0.1** | Philips Healthcare & MIT LCP (20 US Hospitals) | 4,206,128 entries (10 tables) | Multicenter critical care baseline, mechanical ventilator telemetry, and smart IV infusion pumps. |
| **ONC Health IT Data** | U.S. Office of the National Coordinator / CMS | 76k+ facilities & apps | Certified hospital EHR linkages (Epic, Cerner), SMART-on-FHIR APIs, and AHA interoperability survey. |
| **Kaggle Synthetic Dataset** | Kaggle Community (`healthcare_dataset.csv.zip`) | 10,000 Faker records | **PERMANENTLY EXCLUDED**: Contains fake names (`Bobby JacksOn`). Zero application usage. |

---

## 3. Platform Architecture

```
d:\Smart Horizon\Healthcare\
├── datasets/                      # Authentic Organic Datasets (Single Source of Truth)
├── backend/
│   ├── app/
│   │   ├── api/                   # REST API Endpoints (/api/overview, /threats, /assets, /pathways, etc.)
│   │   ├── core/                  # Settings, CORS, zero-synthetic validation
│   │   ├── data/
│   │   │   ├── loaders/           # Streaming memory-efficient loaders for MIMIC-IV, eICU & ONC
│   │   │   ├── normalizers/       # NaN-safe JSON record sanitization
│   │   │   └── provenance/        # Provenance registry & evidence dossiers
│   │   ├── detection/             # Authentic anomaly detectors (POE bursts, Pyxis surges, IoMT drops)
│   │   ├── healthcare/
│   │   │   ├── pathways/          # 5 Care Pathway Shadows (ED, ICU, Labs, Pharmacy, Surgical)
│   │   │   ├── dependencies/      # Cyber Care Cartography Graph Topology
│   │   │   ├── exposure/          # Operational Degradation Calculation Engine
│   │   │   ├── blast_radius.py    # Cascading failure depth & continuity safeguards
│   │   │   ├── risk/              # Explainable Risk Engine (NIST SP 800-30 / ISO 27799)
│   │   │   ├── devices/           # Connected IoMT & Bedside Medical Device Engine
│   │   │   └── health_it/         # SMART-on-FHIR & Certified EHR Interoperability Engine
│   │   └── main.py                # FastAPI Application Entrypoint
│   ├── tests/                     # Comprehensive automated test suite (14/14 tests passing)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Healthcare SOC Views (Overview, Cartography, Threats, Pathways, etc.)
│   │   ├── services/api.js        # Axios REST client
│   │   ├── App.jsx                # Master Healthcare Security Navigation & Layout
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── datasets.md                # Comprehensive dataset inventory
│   ├── architecture.md            # System architecture & topology
│   ├── methodology.md             # Anomaly detection & evaluation methodology
│   ├── data-lineage.md            # End-to-end evidence lineage
│   └── limitations.md             # Honest academic limitations & boundaries
├── run_careguard.py               # Single-command launcher
└── README.md
```

---

## 4. Key Functional Capabilities

1. **Cyber Care Cartography (Signature View)**:  
   Interactive visual dependency topology mapping:
   $$\text{Cyber Threat} \longrightarrow \text{Digital Healthcare Asset} \longrightarrow \text{Clinical Dependency} \longrightarrow \text{Care Pathway} \longrightarrow \text{Operational Exposure}$$

2. **Care Pathway Shadows**:  
   Models the 5 authentic clinical workflows: Emergency Intake, Critical Care ICU, Clinical Diagnostics & Labs, Inpatient Pharmacy/eMAR, and Surgical Services.

3. **Operational Degradation States**:  
   Derived from real telemetry: `NORMAL`, `DEGRADED`, `SEVERELY DEGRADED`, `UNAVAILABLE`, `INSUFFICIENT TELEMETRY`.

4. **Cascade Blast Radius Engine**:  
   Evaluates cascading failure depth across clinical services if any asset fails, recommending life-safety preserving continuity actions.

5. **Connected Medical Devices (IoMT)**:  
   Monitors continuous bedside vital streams, mechanical ventilator parameters, and smart IV infusion pumps.

6. **Explainable Risk Engine**:  
   Answers *WHY?*, *WHAT WAS OBSERVED?*, *WHICH ASSET?*, *WHICH CARE WORKFLOW?*, *HOW CALCULATED?* under strict non-clinical language guidelines.

7. **Continuity-Aware Incident Response**:  
   One-click mitigation safeguards: Read-Only FHIR Throttle, Offline Pyxis Mode, Bedside Monitor LAN Isolation, and Telephone STAT Panic Lab Protocol.

8. **Auditable Data Lineage & Table Inspector**:  
   Allows SOC analysts and evaluators to query raw records directly from disk across all ingested tables.

---

## 5. Verification & Test Execution

### Backend Automated Test Suite
```bash
cd backend
python -m pytest tests/test_careguard.py -v
```
**Result**: `14 passed in 1.28s (100% Success)`

### Frontend Production Build
```bash
cd frontend
npm run build
```
**Result**: `✓ 1654 modules transformed. Built in 2.07s. Zero compilation errors.`

---

## 6. How to Run the Platform

You can launch both the FastAPI backend and Vite frontend with a single command:

```powershell
cd "d:\Smart Horizon\Healthcare"
python run_careguard.py
```

* **Healthcare Security SOC UI**: [http://localhost:5173](http://localhost:5173)
* **Interactive OpenAPI Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Systemic Risk REST Endpoint**: [http://127.0.0.1:8000/api/risk](http://127.0.0.1:8000/api/risk)
* **Cartography Dependency Endpoint**: [http://127.0.0.1:8000/api/dependencies](http://127.0.0.1:8000/api/dependencies)

