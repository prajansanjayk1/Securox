import React from 'react';
import { Activity, Radio, AlertTriangle, CheckCircle2, ShieldAlert, Cpu, Info } from 'lucide-react';

export const MedicalDevicesPage = ({ devices }) => {
  const categories = devices?.categories || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            <span>Clinical Medical Telemetry (IoMT) Parameter Streams</span>
          </h2>
          <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/30">
            {devices?.monitored_telemetry_categories || 3} Monitored Telemetry Streams
          </span>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Surveillance of physiological telemetry, mechanical ventilator settings, and smart infusion delivery grounded in authentic eICU and MIMIC-IV clinical records.
        </p>
      </div>

      {/* Observational Boundary Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono flex items-start gap-2.5 text-slate-300">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-white uppercase tracking-wider block text-[11px]">Hardware Inventory Observability Boundary</strong>
          <span className="text-slate-400 font-sans leading-relaxed text-[11px]">
            Under HIPAA Safe Harbor deidentification, physical hardware MAC addresses, asset tags, and IP switch telemetry are absent from source research archives. CAREGUARD monitors genuine patient clinical telemetry parameter streams without inventing fabricated device counts.
          </span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.category_id}
            className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-4 shadow-lg"
          >
            {/* Category Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-white">{cat.name}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    cat.operational_status === 'TELEMETRY_ANOMALY_DETECTED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {cat.operational_status}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Protocol: <strong className="text-slate-200">{cat.protocol}</strong></span>
                  <span>
                    Observed Units: <strong className="text-teal-300">{cat.observed_telemetry_streams?.value} {cat.observed_telemetry_streams?.unit}</strong>
                  </span>
                  <span className="text-amber-400/90">
                    Hardware Counts: <strong className="text-amber-300">NOT AVAILABLE (Deidentified)</strong>
                  </span>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-500">
                Source: {cat.source_dataset.split('(')[0]}
              </div>
            </div>

            {/* Security Advisory */}
            <div className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2 ${
              cat.operational_status === 'TELEMETRY_ANOMALY_DETECTED'
                ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                : 'bg-slate-900/60 border-slate-800 text-slate-300'
            }`}>
              <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                cat.operational_status === 'TELEMETRY_ANOMALY_DETECTED' ? 'text-rose-400' : 'text-emerald-400'
              }`} />
              <div>
                <strong className="text-white">Clinical Continuity Advisory: </strong>
                {cat.security_advisory}
              </div>
            </div>

            {/* Live Telemetry Parameters */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Monitored Physiological Telemetry Parameters
              </span>
              <div className="flex flex-wrap gap-2">
                {cat.primary_telemetry_parameters.map((p, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 text-teal-300 border border-slate-800"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Authentic Sample Telemetry Records */}
            {cat.sample_live_records && cat.sample_live_records.length > 0 && (
              <div className="p-3 rounded-xl bg-black/50 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Authentic Real-Time Record Sample (eICU Clinical Telemetry)
                </span>
                <pre className="p-2.5 rounded-lg bg-black/60 text-[10px] font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
                  {JSON.stringify(cat.sample_live_records[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
