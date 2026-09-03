# 🛡️ Securox — Autonomous Cyber Risk Intelligence Platform for Smart Cities

> **Production-grade MVP** demonstrating AI-driven threat detection, digital twin simulation, explainable AI, and autonomous response for smart city infrastructure.

---

## 🌟 Key Features

| Feature | Implementation |
|---|---|
| **Real-time anomaly detection** | Isolation Forest (scikit-learn) — 10-feature vector per event |
| **Time-series attack prediction** | LSTM-style RNN (NumPy) with 5-step horizon forecast |
| **Behavioural clustering** | DBSCAN — identifies coordinated attacker groups |
| **Dynamic risk scoring** | Composite 5-factor engine (0–100 scale) with propagation graph |
| **Digital Twin** | SVG-rendered smart city with live cascading failure simulation |
| **Explainable AI (XAI)** | Rule-based SHAP-lite — human-readable per-alert explanations |
| **Autonomous Response** | Playbook engine: DDoS / Insider / Botnet / Exfiltration |
| **Attack Simulation** | 4 realistic scenario generators (DDoS, Insider, IoT, Exfil) |
| **Real-time streaming** | WebSocket broadcast — zero-poll live dashboard |
| **Attack Timeline Replay** | Scrubable time-series replay of the full event history |

---

## 🗂️ Project Structure

```
sentinelai/
├── backend/
│   ├── main.py                    ← FastAPI gateway + WebSocket hub
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── auth/
│   │   └── jwt_auth.py            ← JWT + RBAC
│   ├── database/
│   │   └── store.py               ← In-memory async store (swap → MongoDB)
│   ├── ml/
│   │   ├── anomaly_detector.py    ← Isolation Forest
│   │   ├── lstm_predictor.py      ← RNN time-series predictor
│   │   └── clustering.py         ← DBSCAN behavioural clustering
│   ├── services/
│   │   ├── risk_engine.py         ← Composite risk scorer
│   │   ├── digital_twin.py        ← Smart city simulation
│   │   ├── response_engine.py     ← Autonomous response playbooks
│   │   └── ingestion.py           ← Feature engineering
│   └── simulation/
│       ├── attack_scenarios.py    ← 4 attack generators
│       └── data_generator.py      ← Normal baseline traffic
├── frontend/
│   └── index.html                 ← Full dashboard (vanilla JS + Chart.js)
├── docker-compose.yml
├── nginx.conf
├── start.sh                       ← Linux/Mac quick-start
└── start.bat                      ← Windows quick-start
```

---

## ⚡ Quick Start (3 steps)

### Option A — Local Python (Recommended for dev)

**Prerequisites:** Python 3.9+

```bash
# 1. Clone / extract project
cd sentinelai

# 2. Run start script
chmod +x start.sh
./start.sh          # Linux / macOS

# Windows:
start.bat
```

Then open **http://localhost:8000** in your browser.

---

### Option B — Docker

```bash
docker compose up --build
```

- Dashboard: http://localhost:80
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

---

### Option C — Manual

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Open `frontend/index.html` in your browser (or navigate to http://localhost:8000).

---

## 🔐 Demo Credentials

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Full access |
| `analyst` | `admin123` | Read-only |

Authentication is optional for the demo — the API allows unauthenticated access in viewer mode.

---

## 📡 API Reference

Once running, full interactive docs at: **http://localhost:8000/docs**

### Key Endpoints

```
GET  /api/alerts            → Recent alerts (filterable by severity)
GET  /api/alerts/stats      → Severity distribution
GET  /api/risk/history      → Rolling risk score history
GET  /api/risk/city         → Aggregated city-wide risk
GET  /api/risk/lstm         → LSTM 5-step forecast
GET  /api/twin/state        → Digital twin live state
POST /api/twin/reset        → Reset twin to baseline
POST /api/simulate          → Launch attack simulation
GET  /api/simulate/scenarios→  Available scenarios
GET  /api/clusters          → DBSCAN cluster summary
GET  /api/mitigations       → Recent response plans
GET  /api/stats             → System statistics
WS   /ws                    → Real-time event stream
POST /api/auth/login        → JWT authentication
```

### Launch a Simulation (curl)

```bash
curl -X POST http://localhost:8000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"scenario":"ddos","target_asset":"traffic_system","duration":25}'
```

---

## 🧠 ML Architecture

### 1. Isolation Forest (Anomaly Detection)
- Trained on 3,000 synthetic normal-baseline events at startup
- 10-feature vector: request rate, unique IPs, payload size, error rate, geo-anomaly score, hour (sin/cos encoding), port entropy, packet variance, connection duration
- Returns: `is_anomaly`, `anomaly_score` (0–1), and SHAP-lite explanation

### 2. LSTM Predictor (Time Series)
- Sliding window of 20 observations → 5-step horizon prediction
- NumPy-based RNN cell (production: swap for Keras/PyTorch LSTM)
- Outputs: predicted risk trajectory, trend label (escalating/stable/de-escalating), confidence

### 3. DBSCAN Clustering (Behavioural)
- 8-feature device/IP profiles (request count, endpoints, error ratio, bytes, session duration, port variety, hour)
- Cluster -1 = outlier/suspicious
- Re-clusters every 20 new profiles for computational efficiency

### 4. Risk Engine (Composite Scoring)
```
Risk Score = (
  anomaly_score    × 0.35 +
  lstm_prediction  × 0.25 +
  propagation_risk × 0.15 +
  threat_intel     × 0.15 +
  cluster_outliers × 0.10
) × asset_criticality_weight
```

---

## 🌆 Digital Twin

The SVG digital twin renders 8 interconnected smart city assets. Attack propagation uses BFS through a dependency graph:

```
Power Grid → [Water Supply, Healthcare, Traffic, Comms]
Traffic    → [Emergency Services, Transit]
Comms      → [Finance, Emergency Services]
```

Each compromised node attenuates severity to neighbours by 40–60% per hop, creating realistic cascading failure patterns.

---

## ⚡ Attack Scenarios

| Scenario | Target | Behaviour |
|---|---|---|
| **DDoS** | Traffic System | Volumetric SYN flood ramp: 1× → 10× over 25 steps |
| **Insider Threat** | Finance | Off-hours access, sudo escalation, bulk data export |
| **IoT Botnet** | Power Grid | Mirai-style: 50-device fleet with C2 callbacks |
| **Data Exfiltration** | Healthcare | Slow-and-low: growing outbound transfers to C2 |

---

## 🤖 Autonomous Response Playbooks

### DDoS
1. Rate-limit ingress (100 req/s threshold)
2. Auto-block attacker IP ranges (60 min TTL)
3. Activate CDN shield (under-attack mode)
4. SOC P1 alert

### Insider Threat
1. Suspend affected credentials
2. Isolate node to quarantine VLAN
3. Capture memory dump + disk image
4. Escalate to CISO

### IoT Botnet
1. Block C2 domains via DNS filter
2. Isolate IoT VLAN
3. Rate-limit IoT gateway
4. Trigger firmware audit

### Data Exfiltration
1. Block large outbound transfers (DLP > 50 MB)
2. Revoke affected API tokens
3. Enable TLS deep inspection
4. Notify compliance team

---

## 🔄 WebSocket Event Types

```json
{ "type": "init",             "data": { twin, alerts, history } }
{ "type": "alert",            "data": { ...alert_object } }
{ "type": "risk_update",      "data": { ...risk_assessment } }
{ "type": "twin_update",      "data": { assets, events } }
{ "type": "mitigation",       "data": { ...response_plan } }
{ "type": "propagation",      "data": { events, origin, scenario } }
{ "type": "simulation_start", "data": { scenario, target } }
{ "type": "simulation_end",   "data": { scenario, target } }
```

---

## 🚀 Production Roadmap

To evolve this MVP to full production:

1. **Database**: Replace `database/store.py` with Motor (async MongoDB) or TimescaleDB
2. **LSTM**: Replace NumPy RNN with Keras `LSTM` layers trained on real attack datasets (NSL-KDD, CICIDS2017)
3. **Message broker**: Add Kafka between ingestion and ML services for true microservice decoupling
4. **SHAP**: Replace rule-based explanations with `shap.TreeExplainer` on the Isolation Forest
5. **Graph ML**: Add PyTorch Geometric for graph-based anomaly detection on the dependency graph
6. **Threat Intel**: Integrate with real threat feeds (MISP, VirusTotal, Shodan)
7. **Authentication**: Replace in-memory users with LDAP / OAuth2 (Keycloak)
8. **Kubernetes**: Add Helm chart for K8s deployment with horizontal pod autoscaling

---

## 🏆 Innovation Highlights

- **Digital Twin + Propagation Graph**: Visual cascading failure simulation unique to smart city context
- **Multi-model fusion**: 3 ML models (IF + LSTM + DBSCAN) fused into a single composite risk score
- **Zero-dependency frontend**: Pure HTML/CSS/JS dashboard — no React build step, no CDN dependencies beyond Chart.js
- **Streaming pipeline**: WebSocket → real-time updates without polling
- **XAI-first**: Every alert ships with a human-readable explanation for operator trust

---

## 📄 License

MIT — Free to use, modify, and deploy.

---

*Built with ❤️ using FastAPI, scikit-learn, and vanilla JavaScript.*
