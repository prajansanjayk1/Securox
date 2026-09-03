import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Lock, AlertTriangle, CheckCircle2, RefreshCw, Info, ArrowRight, Clock } from 'lucide-react';
import { api } from '../services/api';

const LIFECYCLE_STAGES = [
  "DETECTED",
  "TRIAGED",
  "ACKNOWLEDGED",
  "CONTAINMENT_PLANNED",
  "ACTION_LOGGED",
  "VERIFICATION",
  "RESOLVED"
];

export const ResponsePage = ({ targetAssetId = null }) => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [operatorNotes, setOperatorNotes] = useState('Enforced by authorized SOC operator under clinical continuity protocol.');
  const [actionLog, setActionLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchIncidents = async () => {
    try {
      const res = await api.getIncidents();
      setIncidents(res.data || []);
      if (!selectedIncident && res.data?.length > 0) {
        setSelectedIncident(res.data[0]);
      }
    } catch (e) {
      console.error('Failed to load incidents:', e);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleExecuteResponse = async (assetId, actionType, incidentId) => {
    setLoading(true);
    try {
      const res = await api.executeResponse(assetId, actionType, operatorNotes, incidentId);
      setNotification(res.data);
      setActionLog((prev) => [res.data, ...prev]);
      await fetchIncidents();
      setTimeout(() => setNotification(null), 8000);
    } catch (e) {
      console.error('Failed to log response action:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStage = async (incidentId, currentStage) => {
    const currentIndex = LIFECYCLE_STAGES.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex >= LIFECYCLE_STAGES.length - 1) return;
    const nextStage = LIFECYCLE_STAGES[currentIndex + 1];

    setLoading(true);
    try {
      await api.advanceIncidentStage(incidentId, nextStage, `Stage advanced to ${nextStage} by operator.`);
      await fetchIncidents();
    } catch (e) {
      console.error('Failed to advance incident stage:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>Healthcare Incident Lifecycle &amp; Logged Response Console</span>
          </h2>
          <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
            Simulated SOC — Intent Logging
          </span>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Structured 7-stage incident lifecycle tracking and continuity safeguard intent logging. Does not claim automated physical actuator enforcement.
        </p>
      </div>

      {/* Honest Boundary Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono flex items-start gap-2.5 text-slate-300">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-white uppercase tracking-wider block text-[11px]">Actuator Observability &amp; Enforcement Notice</strong>
          <span className="text-slate-400 font-sans leading-relaxed text-[11px]">
            In accordance with research integrity principles, operator actions are recorded as <strong>LOGGED_INTENT</strong> in a non-production demonstration environment. Verification is marked <strong>NOT_AVAILABLE</strong> unless a physical telemetry state change is genuinely observed.
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-start gap-3 shadow-xl">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono space-y-1">
            <div className="font-bold text-white uppercase tracking-wider">
              {notification.status}: {notification.asset_name}
            </div>
            <div>Recorded Action: <strong className="text-white">{notification.action_type}</strong></div>
            <div className="text-slate-300">Execution Mode: <strong className="text-amber-300">{notification.execution_classification}</strong></div>
            <div className="text-emerald-400 font-bold">{notification.disclaimer}</div>
          </div>
        </div>
      )}

      {/* Active Incidents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
            Active Healthcare Incidents ({incidents.length} Detected)
          </span>
          <button
            onClick={fetchIncidents}
            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {incidents.map((inc) => {
            const currentStageIndex = LIFECYCLE_STAGES.indexOf(inc.lifecycle_stage);
            return (
              <div
                key={inc.incident_id}
                className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-4 shadow-lg"
              >
                {/* Incident Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">{inc.incident_id}</span>
                      <span className="text-sm font-bold font-mono text-white">{inc.title}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        inc.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        inc.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      Target: <strong className="text-white">{inc.targeted_asset_name}</strong> | Detected via: <span className="text-teal-400">{inc.detected_evidence?.dataset}</span>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-slate-500">
                    Updated: {new Date(inc.updated_at).toLocaleTimeString()}
                  </div>
                </div>

                {/* 7-Stage Lifecycle Stepper */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Incident Lifecycle Progression
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1 text-[10px] font-mono">
                    {LIFECYCLE_STAGES.map((stage, idx) => {
                      const isDone = idx < currentStageIndex;
                      const isCurrent = idx === currentStageIndex;
                      return (
                        <div
                          key={stage}
                          className={`p-2 rounded text-center font-bold border ${
                            isCurrent
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow'
                              : isDone
                              ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-900/40 text-slate-600 border-slate-800'
                          }`}
                        >
                          {stage}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Operational Evidence & Recommended Safeguard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-slate-400 uppercase text-[10px] font-bold block">Observed Evidence</span>
                    <div className="text-slate-300 font-sans">{inc.detected_evidence?.metric}</div>
                    {inc.detected_evidence?.z_score && (
                      <div className="text-amber-300 text-[11px]">Statistical Z-Score: +{inc.detected_evidence.z_score}σ (N={inc.detected_evidence.sample_size})</div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-teal-400 uppercase text-[10px] font-bold block">Recommended Continuity Safeguard</span>
                    <div className="font-bold text-white">{inc.recommended_action?.title}</div>
                    <div className="text-slate-400 font-sans text-[11px]">{inc.recommended_action?.description}</div>
                  </div>
                </div>

                {/* Actions & Lifecycle Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleExecuteResponse(inc.targeted_asset_id, inc.recommended_action?.action_type, inc.incident_id)}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Log Safeguard Intent</span>
                  </button>

                  {currentStageIndex < LIFECYCLE_STAGES.length - 1 && (
                    <button
                      onClick={() => handleAdvanceStage(inc.incident_id, inc.lifecycle_stage)}
                      disabled={loading}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Advance to {LIFECYCLE_STAGES[currentStageIndex + 1]}</span>
                    </button>
                  )}
                </div>

                {/* Incident History Log */}
                {inc.response_history?.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[10px] font-mono">
                    <span className="text-slate-500 uppercase tracking-wider block font-bold">Logged Operator History</span>
                    {inc.response_history.map((h, i) => (
                      <div key={i} className="p-2 rounded bg-black/40 border border-slate-800 flex items-center justify-between text-slate-300">
                        <span>{h.action_type}: {h.title} (Execution: {h.execution_classification})</span>
                        <span className="text-slate-500">{new Date(h.logged_at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
