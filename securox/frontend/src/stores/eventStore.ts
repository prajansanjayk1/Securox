import { wsClient } from '../services/websocket';
import { Alert, Incident, CityRiskMetric } from '../types/soc';

interface EventState {
  isConnected: boolean;
  alerts: Alert[];
  incidents: Incident[];
  cityRisk: number; // 0 - 100
  activeThreatCount: number;
  lastEventTimestamp: string;
}

let state: EventState = {
  isConnected: false,
  alerts: [],
  incidents: [],
  cityRisk: 28.5,
  activeThreatCount: 3,
  lastEventTimestamp: new Date().toISOString(),
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

let initialized = false;

export const eventStore = {
  getState(): EventState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  init(): void {
    if (initialized) return;
    initialized = true;

    wsClient.connect();

    wsClient.on('_status', (payload: { connected: boolean }) => {
      state = { ...state, isConnected: payload.connected };
      notify();
    });

    wsClient.on('alert', (payload: any) => {
      const alertData = payload?.data || payload;
      if (!alertData || !alertData.id) return;
      const normalizedAlert: Alert = {
        id: alertData.id,
        timestamp: alertData.timestamp || new Date().toISOString(),
        asset: alertData.asset || 'SYSTEM',
        attack_type: alertData.scenario || alertData.payload?.detection_rule || alertData.attack_type || 'Attack Detection',
        severity: alertData.severity || 'CRITICAL',
        anomaly_score: alertData.anomaly_score ?? 0.94,
        status: alertData.status || 'DETECTED',
        description: alertData.description || alertData.payload?.detection_rule || alertData.scenario || 'Real-time detection event',
      };
      // Prevent duplicates
      const exists = state.alerts.some((a) => a.id === normalizedAlert.id);
      if (!exists) {
        state = {
          ...state,
          alerts: [normalizedAlert, ...state.alerts.slice(0, 99)],
          activeThreatCount: state.activeThreatCount + 1,
          lastEventTimestamp: new Date().toISOString(),
        };
        notify();
      }
    });

    wsClient.on('risk_update', (payload: any) => {
      const data = payload?.data || payload;
      const risk = data.city_score ?? data.risk_score ?? state.cityRisk;
      state = {
        ...state,
        cityRisk: Math.round(Number(risk) * 10) / 10,
        lastEventTimestamp: new Date().toISOString(),
      };
      notify();
    });

    wsClient.on('incident_update', (payload: any) => {
      const incData = payload?.data || payload;
      if (!incData || !incData.id) return;
      const normalizedInc: Incident = {
        id: incData.id,
        incident_id: incData.id,
        title: incData.title || `${incData.domain || 'SYSTEM'} Zero-Trust Threat Intercepted`,
        asset: incData.asset || 'CORE_NODE',
        severity: incData.severity || 'CRITICAL',
        attack_type: incData.attack_type || 'Zero-Trust Intrusion',
        status: (incData.status || 'DETECTED').toUpperCase(),
        detected_at: incData.timestamp || incData.detected_at || new Date().toISOString(),
        summary: incData.summary || incData.description || `Autonomous containment: ${incData.attack_type || 'threat'} on ${incData.asset}`,
      };
      const existingIdx = state.incidents.findIndex((i) => i.id === normalizedInc.id);
      let updated: Incident[];
      if (existingIdx >= 0) {
        updated = [...state.incidents];
        updated[existingIdx] = normalizedInc;
      } else {
        updated = [normalizedInc, ...state.incidents];
      }
      state = {
        ...state,
        incidents: updated,
        lastEventTimestamp: new Date().toISOString(),
      };
      notify();
    });

    wsClient.on('demo_center_step', (payload: any) => {
      const data = payload?.data || payload;
      if (!data) return;
      let changed = false;

      // Sync risk score
      if (data.risk?.current_score !== undefined) {
        state = { ...state, cityRisk: Number(data.risk.current_score) };
        changed = true;
      }

      // If detection stage has alert, sync to alerts
      const detectionAlert = data.stage_data?.DETECTION;
      if (detectionAlert && detectionAlert.id) {
        const exists = state.alerts.some((a) => a.id === detectionAlert.id);
        if (!exists) {
          const normAlert: Alert = {
            id: detectionAlert.id,
            timestamp: detectionAlert.timestamp || new Date().toISOString(),
            asset: detectionAlert.asset || data.category || 'SYSTEM',
            attack_type: detectionAlert.scenario || detectionAlert.payload?.detection_rule || 'Attack Detection',
            severity: detectionAlert.severity || 'CRITICAL',
            anomaly_score: detectionAlert.anomaly_score ?? 0.94,
            status: 'DETECTED',
            description: detectionAlert.payload?.detection_rule || detectionAlert.scenario,
          };
          state = {
            ...state,
            alerts: [normAlert, ...state.alerts.slice(0, 99)],
            activeThreatCount: state.activeThreatCount + 1,
          };
          changed = true;
        }
      }

      // If active incident exists, sync to incidents
      if (data.active_incident && data.active_incident.id) {
        const inc = data.active_incident;
        const normInc: Incident = {
          id: inc.id,
          incident_id: inc.id,
          title: inc.title || `${inc.domain || data.category} Zero-Trust Threat Intercepted`,
          asset: inc.asset || 'CORE_NODE',
          severity: inc.severity || 'CRITICAL',
          attack_type: inc.attack_type || 'Zero-Trust Intrusion',
          status: (inc.status || 'DETECTED').toUpperCase(),
          detected_at: inc.timestamp || new Date().toISOString(),
          summary: inc.summary || `Autonomous containment on ${inc.asset}`,
        };
        const idx = state.incidents.findIndex((i) => i.id === normInc.id);
        if (idx >= 0) {
          const updated = [...state.incidents];
          updated[idx] = normInc;
          state = { ...state, incidents: updated };
        } else {
          state = { ...state, incidents: [normInc, ...state.incidents] };
        }
        changed = true;
      }

      if (changed) {
        state = { ...state, lastEventTimestamp: new Date().toISOString() };
        notify();
      }
    });
  },

  setAlerts(alerts: Alert[]): void {
    state = { ...state, alerts };
    notify();
  },

  setIncidents(incidents: Incident[]): void {
    state = { ...state, incidents };
    notify();
  },

  setCityRisk(risk: number): void {
    state = { ...state, cityRisk: risk };
    notify();
  },
};
