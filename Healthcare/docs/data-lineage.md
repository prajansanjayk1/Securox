# CAREGUARD — Transparent Data Lineage & Audit Ledger

## 1. End-to-End Lineage Flow

Every operational metric, degradation state, and security alert in CAREGUARD is auditable back to its raw dataset record.

```
RAW FILE ON DISK
      │
      ▼
STREAMING CHUNK LOADER (`backend/app/data/loaders/`)
      │
      ▼
DATA SANITIZER (`backend/app/data/normalizers/sanitizer.py`)
      │
      ▼
ANOMALY DETECTION ENGINE (`backend/app/detection/`)
      │
      ▼
CARE PATHWAY SHADOW (`backend/app/healthcare/pathways/`)
      │
      ▼
SYSTEMIC RISK & BLAST RADIUS (`backend/app/healthcare/risk/`)
      │
      ▼
REST API & AUDIT TABLE INSPECTOR (`/api/evidence`)
```

---

## 2. Table-to-Pathway Lineage Mapping

| Dataset Table | Source Archive | Ingested Features | Dependent Care Pathway | Observed Role |
| :--- | :--- | :--- | :--- | :--- |
| `edstays.csv.gz` | `mimic-iv-ed-demo-2.2.zip` | `stay_id`, `arrival_transport`, `disposition` | Emergency Intake (`PATHWAY_ED`) | Handoff volume and ambulance transport arrivals. |
| `triage.csv.gz` | `mimic-iv-ed-demo-2.2.zip` | `acuity`, `heartrate`, `o2sat`, `chiefcomplaint` | Emergency Intake (`PATHWAY_ED`) | Emergency Severity Index (ESI 1-5) acuity scoring. |
| `pyxis.csv.gz` | `mimic-iv-ed-demo-2.2.zip` | `charttime`, `name`, `gsn` | Emergency Intake (`PATHWAY_ED`) & Inpatient Pharmacy (`PATHWAY_PHARM`) | Automated medication cabinet dispense transactions. |
| `poe.csv.gz` | `mimic-iv-clinical-database-demo-2.2.zip` | `order_type`, `order_subtype`, `field_name` | Inpatient Pharmacy (`PATHWAY_PHARM`) & Core EHR | Physician Provider Order Entry transaction velocity. |
| `emar_detail.csv.gz` | `mimic-iv-clinical-database-demo-2.2.zip` | `reason_for_no_barcode`, `administration_type` | Inpatient Pharmacy (`PATHWAY_PHARM`) | Barcode medication administration verification auditing. |
| `vitalPeriodic.csv.gz` | `eicu-collaborative-research-database-demo-2.0.1.zip` | `heartrate`, `sao2`, `temperature`, `systemicmean` | Critical Care ICU (`PATHWAY_ICU`) | Continuous bedside physiological monitor feeds. |
| `respiratoryCharting.csv.gz` | `eicu-collaborative-research-database-demo-2.0.1.zip` | `respchartvaluelabel`, `respchartvalue` | Critical Care ICU (`PATHWAY_ICU`) | Mechanical ventilator pressure and FiO2 telemetry. |
| `infusiondrug.csv.gz` | `eicu-collaborative-research-database-demo-2.0.1.zip` | `drugname`, `drugrate`, `infusionrate` | Critical Care ICU (`PATHWAY_ICU`) | Smart IV infusion pump vasoactive drug delivery. |
| `chpl-linkage.csv` | `hospital-promoting-interoperability-chpl-linkage.csv` | `Vendor_Name`, `CHPL_ID`, `Facility_Name` | Health-IT Infrastructure | Certified hospital EHR vendor footprint (Epic, Cerner). |
| `ecosystem-apps.csv` | `ecosystem-apps-software-marketplace-history.csv` | `App_Name`, `App_Category`, `Developer` | Health-IT Infrastructure | SMART-on-FHIR external API attack surface. |

---

## 3. Strict Synthetic Data Audit
* **Audit Script**: Evaluated with zero synthetic fallback.
* **Exclusion Enforcement**: `healthcare_dataset.csv.zip` was identified containing synthetic Faker names (`Bobby JacksOn`, `LesLie TErRy`) and was **permanently excluded** from all loaders.

