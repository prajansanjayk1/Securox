import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Lock, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const ResponsePage = ({ targetAssetId = null }) => {
  const [selectedAsset, setSelectedAsset] = useState(targetAssetId || 'EHR_CORE_GATEWAY');
  const [selectedAction, setSelectedAction] = useState('RESTRICT_FHIR_API');
  const [operatorNotes, setOperatorNotes] = useState('Enforced by authorized SOC operator under clinical continuity protocol.');
  const [actionLog, setActionLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const responseActions = [
    {
      id: 'RESTRICT_FHIR_API',
      assetId: 'EHR_CORE_GATEWAY',
      title: 'Engage Read-Only FHIR API Throttle',
      desc: 'Throttles high-frequency external query bursts while ensuring clinical lookups remain available for emergency department clinicians.',
      safeguard: 'Zero disruption to acute emergency room triage and clinical lookups.'
    },
    {
      id: 'OFFLINE_PYXIS_OVERRIDE',
      assetId: 'EMAR_BCMA_SERVER',
      title: 'Authorize Offline Pyxis Dispensing Mode',
      desc: 'Switches automated medication dispensing cabinets to verified offline emergency override mode, shifting to dual-nurse verification.',
      safeguard: 'Medication administration continues without network lockout or medication delay.'
    },
    {
      id: 'ISOLATE_BEDSIDE_GATEWAY',
      assetId: 'ICU_BEDSIDE_TELEMETRY_GW',
      title: 'Isolate Bedside Monitor LAN Gateway',
      desc: 'Disconnects external monitoring gateway while maintaining local hardwire acoustic alarm annunciation at central nursing consoles.',
      safeguard: 'Prevents lateral network movement without silencing life-critical physiological alarms.'
    },
    {
      id: 'TELEPHONE_PANIC_PROTOCOL',
      assetId: 'LAB_ANALYZER_LIS',
      title: 'Engage Telephone STAT Panic Lab Broadcast',
      desc: 'Directs laboratory personnel to communicate critical panic values directly by telephone to attending physicians.',
      safeguard: 'Preserves diagnostic urgency during LIS gateway scrubbing.'
    }
  ];

  const handleExecute = async (assetId, actionType) => {
    setLoading(true);
    try {
      const res = await api.executeResponse(assetId, actionType, operatorNotes);
      setNotification(res.data);
      setActionLog((prev) => [res.data, ...prev]);
      setTimeout(() => setNotification(null), 8000);
    } catch (e) {
      console.error('Failed to execute response action:', e);
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
            <span>Continuity-Aware Incident Response Console</span>
          </h2>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            Life-Safety Preserving Actions
          </span>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Enforce selective containment safeguards that prevent lateral threat propagation while explicitly preserving life-critical healthcare connectivity.
        </p>
      </div>

      {/* Success Notification Banner */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-start gap-3 shadow-xl">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono space-y-1">
            <div className="font-bold text-white uppercase tracking-wider">
              {notification.status}: {notification.asset_name}
            </div>
            <div>Enforced Action: <strong className="text-white">{notification.action_type}</strong></div>
            <div className="text-slate-300">Safeguard: {notification.continuity_safeguard}</div>
            <div className="text-emerald-400 font-bold">{notification.patient_safety_guarantee}</div>
          </div>
        </div>
      )}

      {/* Response Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {responseActions.map((act) => (
          <div
            key={act.id}
            className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-3 shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white">{act.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {act.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {act.desc}
              </p>
              <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
                <strong>Patient Safety Safeguard: </strong>{act.safeguard}
              </div>
            </div>

            <button
              onClick={() => handleExecute(act.assetId, act.id)}
              disabled={loading}
              className="w-full mt-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Enforce Containment Safeguard</span>
            </button>
          </div>
        ))}
      </div>

      {/* Response Audit Log */}
      {actionLog.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-3 shadow-xl">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-bold">
            Live Response Action Audit Log ({actionLog.length} Actions Recorded)
          </span>
          <div className="space-y-2">
            {actionLog.map((log, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono flex flex-col md:flex-row items-start md:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white">{log.action_type} &rarr; {log.asset_name}</div>
                  <div className="text-[11px] text-slate-400">{log.continuity_safeguard}</div>
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(log.enforced_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

