# CAREGUARD — Comprehensive Dataset Inventory & Provenance Dossier

> **Policy**: Single Source of Truth Mandate  
> **Location**: `d:/Smart Horizon/Healthcare/datasets`  
> **Standard**: Zero Synthetic Application Data — Authentic Records Only  
> **Evaluation Date**: September 2026  

---

## Executive Summary of Ingested Datasets

| Dataset File | Data Domain | Collection Provenance | Record Count | Real / Synthetic Status | CAREGUARD Intelligence Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `mimic-iv-ed-demo-2.2.zip` | Emergency Department Clinical Operations | Beth Israel Deaconess Medical Center / PhysioNet | 5,873 entries across 6 tables | **REAL / ORGANIC** | Primary evidence for Emergency Intake Care Pathway Shadow & Pyxis cabinet access profiling. |
| `mimic-iv-clinical-database-demo-2.2.zip` | Hospital Inpatient, POE, eMAR & ICU | Beth Israel Deaconess Medical Center / MIT LCP | 988,321 entries across 12 tables | **REAL / ORGANIC** | Primary evidence for Inpatient Pharmacy, Provider Order Entry (POE), eMAR barcode verification, and Bedside Physiological Telemetry. |
| `eicu-collaborative-research-database-demo-2.0.1.zip` | Multicenter Critical Care Telehealth | Philips Healthcare & MIT LCP (20 US Hospitals) | 4,206,128 entries across 10 tables | **REAL / ORGANIC** | Multicenter critical care baseline, mechanical ventilator telemetry (`respiratoryCharting`), and smart IV infusion pump delivery (`infusiondrug`). |
| `hospital-promoting-interoperability-chpl-linkage.csv` | Hospital Certified Health IT Infrastructure | U.S. Office of the National Coordinator for Health IT (ONC) / CMS | 68,447 facilities | **REAL / ORGANIC** | Establishes hospital digital footprint: CHPL certification IDs, EHR vendor market mapping (Epic, Cerner, MEDITECH). |
| `ecosystem-apps-software-marketplace-history.csv` | SMART-on-FHIR & Health-IT API Ecosystem | ONC Open Data / HealthIT.gov | 8,089 certified apps/APIs | **REAL / ORGANIC** | Establishes Health-IT API attack surface: FHIR REST endpoints, developer profiles, and interoperability integrations. |
| `EHR-vendors-count-dataset.csv` | EHR Developer Certification & Market Share | ONC Health IT Dashboard | 4,258 vendor-year records | **REAL / ORGANIC** | Health-IT vendor security context and certification edition baselines (2011, 2014, 2015 editions). |
| `aha.csv` | American Hospital Association Interoperability Survey | AHA Annual Health IT Survey / ONC | 625 regional entries (42 features) | **REAL / ORGANIC** | Regional hospital electronic clinical data exchange capabilities (Find, Send, Receive, Integrate). |
| `2015-edition-market-readiness-hospitals-and-clinicians.csv` | Certified Health IT Readiness | ONC Health IT Open Data | 709 market entries | **REAL / ORGANIC** | Certified technology baseline and interoperability compliance context. |
| `nehrs.csv` | National Electronic Health Records Survey | CDC / NCHS / ONC | 421 survey records | **REAL / ORGANIC** | Physician electronic medical record adoption and security posture baselines. |
| `Meaningful-Use-Acceleration-Scorecard.csv` | Regional Health-IT Acceleration | CMS / ONC | 209 regional records | **REAL / ORGANIC** | Longitudinal digital infrastructure maturity across US health jurisdictions. |
| `MU_REPORT.csv` | CMS EHR Incentive Program Comprehensive Provider Registry | Centers for Medicare & Medicaid Services (CMS) | 1,934,820 provider records | **REAL / ORGANIC** | National registry of healthcare provider NPIs, hospital CCNs, and health-IT certification status. |
| `healthcare_dataset.csv.zip` | Synthetic Patient Records | Kaggle Community Upload (prasad22) | 10,000 records | **SYNTHETIC / FAKE** | **STRICTLY EXCLUDED PER RULE 3**: Generated using Faker (`Bobby JacksOn`, `LesLie TErRy`). Zero application usage. |

---

## Detailed Dataset Dossiers

### 1. MIMIC-IV Emergency Department Demo (v2.2)
* **File Name**: `mimic-iv-ed-demo-2.2.zip`
* **Original Source**: Beth Israel Deaconess Medical Center, Boston, MA. Published by PhysioNet under the PhysioNet Credentialed / Demo Open License.
* **Provenance**: Authentic de-identified patient visits collected from the emergency department clinical information system between 2011 and 2019.
* **Data Type**: `REAL CLINICAL & EMERGENCY OPERATIONS DATA`
* **Key Tables & Record Counts**:
  - `edstays.csv.gz` (222 records): `subject_id`, `hadm_id`, `stay_id`, `intime`, `outtime`, `gender`, `race`, `arrival_transport` (Ambulance vs Walk-in), `disposition`.
  - `triage.csv.gz` (222 records): `stay_id`, `temperature`, `heartrate`, `resprate`, `o2sat`, `sbp`, `dbp`, `pain`, `acuity` (ESI triage acuity scale 1–5), `chiefcomplaint`.
  - `vitalsign.csv.gz` (1,038 records): `stay_id`, `charttime`, `temperature`, `heartrate`, `resprate`, `o2sat`, `sbp`, `dbp`, `rhythm`.
  - `pyxis.csv.gz` (1,082 records): `stay_id`, `charttime`, `med_rn`, `name`, `gsn_rn`, `gsn` (Automated medication dispensing cabinet transaction events).
  - `medrecon.csv.gz` (2,764 records): `stay_id`, `charttime`, `name`, `ndc`, `etc_rn`, `etccode` (Medication reconciliation transactions).
  - `diagnosis.csv.gz` (545 records): `stay_id`, `icd_code`, `icd_version`, `icd_title`.
* **Healthcare Use**: Establishes the real-world **Emergency Intake & Resuscitation Care Pathway Shadow** (Ambulance transport $\rightarrow$ Acuity triage $\rightarrow$ Bed allocation $\rightarrow$ Pyxis cabinet dispensing $\rightarrow$ Disposition).
* **Cybersecurity Use**: 
  1. Access anomaly detection on automated Pyxis medication dispensing cabinets (`pyxis.csv.gz`).
  2. Availability impact modeling: When ED triage terminals or network switches degrade, evaluate triage queue latency and acute medication access.
* **Limitations**: 100 demo patients (222 visits); timestamps are de-identified via patient-specific random offsets preserving relative temporal intervals.

---

### 2. MIMIC-IV Clinical Database Demo (v2.2)
* **File Name**: `mimic-iv-clinical-database-demo-2.2.zip`
* **Original Source**: Beth Israel Deaconess Medical Center / MIT Laboratory for Computational Physiology.
* **Provenance**: Authentic hospital-wide Electronic Health Record (EHR) and ICU information system data collected between 2008 and 2019.
* **Data Type**: `REAL CLINICAL, EHR & ICU TELEMETRY DATA`
* **Key Tables & Record Counts**:
  - `icu/chartevents.csv.gz` (668,862 records): Bedside physiological monitor telemetry items, values, warning limits, and charting timestamps.
  - `hosp/labevents.csv.gz` (107,727 records): Clinical laboratory diagnostic orders, specimen processing, results, and abnormal panic flags (`flag == 'abnormal'`).
  - `hosp/emar.csv.gz` (35,835 records) & `emar_detail.csv.gz` (72,018 records): Electronic Medication Administration Records, barcode scanning verification, administration timestamps, and omission reasons (`reason_for_no_barcode`).
  - `hosp/poe.csv.gz` (45,154 records) & `poe_detail.csv.gz` (3,795 records): Provider Order Entry transactions across hospital care departments.
  - `hosp/prescriptions.csv.gz` (18,087 records) & `hosp/pharmacy.csv.gz` (15,306 records): Inpatient pharmacy dispensing orders, doses, and pharmacy IDs.
  - `icu/icustays.csv.gz` (140 records): Intensive care unit stays, care unit transfers (`CCU`, `MICU`, `SICU`, `TSICU`), length of stay.
  - `hosp/services.csv.gz` (319 records): Clinical hospital service pathway transitions (`MED`, `SURG`, `OMED`, `TSURG`, `CSURG`).
  - `hosp/transfers.csv.gz` (1,190 records): Care unit admission and transfer events.
  - `hosp/admissions.csv.gz` (275 records): Inpatient admissions, admission locations, and discharge disposition.
* **Healthcare Use**: Establishes the **Critical Care ICU**, **Inpatient Pharmacy / eMAR**, and **Clinical Diagnostics & Laboratory** Care Pathway Shadows.
* **Cybersecurity Use**:
  1. Provider Order Entry (POE) transaction velocity profiling and burst anomaly detection.
  2. Closed-Loop Barcode Medication Administration (BCMA) verification failure tracking (`reason_for_no_barcode`).
  3. LIS Laboratory diagnostic result delay and abnormal panic broadcast failure modeling.
  4. Bedside physiological monitor telemetry feed dropouts.
* **Limitations**: Sampled 100 demo subjects; preserves exact clinical schemas and event dependencies.

---

### 3. eICU Collaborative Research Database Demo (v2.0.1)
* **File Name**: `eicu-collaborative-research-database-demo-2.0.1.zip`
* **Original Source**: Philips Healthcare & MIT Laboratory for Computational Physiology.
* **Provenance**: Authentic de-identified multicenter critical care telehealth system data collected across 20 distinct US hospital centers between 2014 and 2015.
* **Data Type**: `REAL MULTICENTER CRITICAL CARE & MEDICAL DEVICE TELEMETRY`
* **Key Tables & Record Counts**:
  - `patient.csv.gz` (2,520 records): Patient ICU stays across 20 distinct hospital centers (`hospitalid`, `wardid`, `hospitaladmitsource`).
  - `vitalPeriodic.csv.gz` (1,634,960 records): High-frequency continuous bedside monitor parameters (`heartrate`, `sao2`, `temperature`, `systemicmean`).
  - `nurseCharting.csv.gz` (1,477,163 records): Real-time bedside nursing documentation.
  - `lab.csv.gz` (434,660 records): Clinical laboratory tests and panic value distributions.
  - `vitalAperiodic.csv.gz` (274,088 records): Non-invasive blood pressure and intermittent telemetry.
  - `respiratoryCharting.csv.gz` (176,089 records): Mechanical ventilator and respiratory therapy telemetry records (`airwaytype`, `fio2`, `peep`, `plateau_pressure`).
  - `medication.csv.gz` (75,604 records): Active inpatient medication administration.
  - `infusiondrug.csv.gz` (38,256 records): Continuous smart IV infusion pump delivery rates, concentrations, and vasoactive drug titrations.
* **Healthcare Use**: Establishes the multicenter **Medical Device & Connected IoMT Layer** (mechanical ventilators, continuous bedside monitors, smart infusion pumps).
* **Cybersecurity Use**:
  1. Connected Medical Device (IoMT) telemetry stream anomaly detection: Telemetry loss, out-of-range sensor manipulation, and telemetry delay.
  2. Smart infusion pump parameter validation: Rate deviation and drug concentration anomalies.
  3. Ventilator telemetry integrity monitoring.
* **Limitations**: Telehealth ICU data; physical network packets are not included; telemetry is structured at device data-point resolution.

---

### 4. ONC Health IT Infrastructure & Interoperability Datasets
* **Files**:
  - `hospital-promoting-interoperability-chpl-linkage.csv` (17.98 MB, 68,447 records)
  - `ecosystem-apps-software-marketplace-history.csv` (9.66 MB, 8,089 records)
  - `EHR-vendors-count-dataset.csv` (0.27 MB, 4,258 records)
  - `aha.csv` (0.07 MB, 625 records)
  - `2015-edition-market-readiness-hospitals-and-clinicians.csv` (0.05 MB, 709 records)
  - `Meaningful-Use-Acceleration-Scorecard.csv` (0.01 MB, 209 records)
  - `nehrs.csv` (0.05 MB, 421 records)
  - `MU_REPORT.csv` (454.10 MB, 1,934,820 records)
* **Original Source**: U.S. Office of the National Coordinator for Health Information Technology (healthit.gov) / CMS.
* **Provenance**: Official U.S. Federal Government open data collected from certified Health IT product testing (CHPL), certified API marketplaces, and AHA annual surveys.
* **Data Type**: `REAL PUBLIC HEALTH-IT INFRASTRUCTURE & API ECOSYSTEM DATA`
* **Features & Coverage**:
  - Hospital CHPL Linkage: Links real US hospital facilities to certified EHR products (Epic Systems, Cerner Corporation, MEDITECH, Allscripts).
  - Ecosystem Apps: SMART-on-FHIR software applications, API categories (Clinical, Telehealth, Analytics, Care Coordination), developer credentials.
  - AHA Survey: Hospital electronic clinical data exchange capabilities (Find, Send, Receive, Integrate).
* **Healthcare Use**: Maps the **Health-IT Digital Infrastructure Layer** connecting hospital services to certified EHR backbones and FHIR API endpoints.
* **Cybersecurity Use**:
  1. FHIR API surface analysis: Evaluates exposure profiles of third-party certified ecosystem apps and API endpoints.
  2. Interoperability dependency mapping: Models cross-hospital clinical data exchange exposure if certified EHR gateways degrade.
* **Limitations**: Focuses on architecture, certification, and interoperability adoption; does not contain raw network pcap captures.

---

### 5. Kaggle Healthcare Dataset (EXCLUDED)
* **File Name**: `healthcare_dataset.csv.zip`
* **Source**: Kaggle community upload (prasad22).
* **Provenance**: Purely synthetic generation using the Python Faker library (`Bobby JacksOn`, `LesLie TErRy`, synthetic medical conditions, random billing amounts).
* **Data Type**: `SYNTHETIC / FAKE DATA`
* **Status**: **STRICTLY EXCLUDED PER RULE 3 (NO SYNTHETIC DATA POLICY)**.
* **Action**: Not loaded, parsed, or utilized by any engine in the CAREGUARD application.

---

## Scientific Mapping: Datasets to CAREGUARD Architecture

```
                                    AUTHENTIC DATASETS
                                             │
      ┌──────────────────────────────────────┼──────────────────────────────────────┐
      │                                      │                                      │
MIMIC-IV-ED Demo                       MIMIC-IV Clinical                       eICU Telehealth
  (222 Stays / 1k Vitals / 1k Pyxis)     (668k Vitals / 107k Labs / 35k eMAR)    (1.6M Vitals / 176k Vents / 38k Infusions)
      │                                      │                                      │
      ▼                                      ▼                                      ▼
[EMERGENCY INTAKE PATHWAY]             [INPATIENT PHARMACY & LAB PATHWAYS]    [ICU & MEDICAL DEVICE TELEMETRY]
 • Ambulance Ingress (edstays)           • Provider Order Entry (poe)           • Ventilator Telemetry (respiratoryCharting)
 • Triage Acuity ESI 1-5 (triage)        • Barcode Verification (emar)          • Smart Infusion Pumps (infusiondrug)
 • Pyxis Dispensing Cabinet (pyxis)      • Diagnostic Labs (labevents)          • High-Rate Vitals (vitalPeriodic)
      │                                      │                                      │
      └──────────────────────────────────────┼──────────────────────────────────────┘
                                             │
                                             ▼
                                  ONC HEALTH-IT DATASETS
                               (68k CHPL Linkages / 8k FHIR Apps)
                                             │
                                             ▼
                             [HEALTH-IT INFRASTRUCTURE & APIs]
                               • Certified EHR Gateways (CHPL)
                               • SMART-on-FHIR Endpoints
                               • Clinical Interoperability (AHA)
                                             │
                                             ▼
                                    CAREGUARD CORE ENGINE
                                             │
                 ┌───────────────────────────┴───────────────────────────┐
                 ▼                                                       ▼
      [CYBER-TO-CARE DEPENDENCY GRAPH]                        [CARE PATHWAY SHADOW ENGINE]
       Cyber Anomaly -> Digital Asset                          Operational Degradation:
        -> Healthcare Dependency -> Care Pathway                NORMAL -> DEGRADED -> SEVERELY DEGRADED
                 │                                                       │
                 └───────────────────────────┬───────────────────────────┘
                                             │
                                             ▼
                                  [EVIDENCE & AUDIT DOSSIER]
                                   All Insights Grounded in
                                   Real Observed Records
```

