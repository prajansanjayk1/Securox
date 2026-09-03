import React, { useState } from 'react';
import { Zap, ShieldAlert, AlertTriangle, CheckCircle2, Server, Database, ArrowRight, Eye, ShieldCheck, Info } from 'lucide-react';

export const ThreatsPage = ({ threats, onNavigateToAsset, onNavigateToResponse }) => {
  const [selectedThreat, setSelectedThreat] = useState(threats[0] || null);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Observed Operational Deviations &amp; Statistical Anomaly Signatures</span>
          </h2>
          <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/30">
            Z-Score Statistical Detection
          </span>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Detects authentic behavioral bursts, telemetry stream latency gaps, and unauthorized dispensing access derived from real healthcare records.
        </p>
      </div>

      {/* Data Limitation & Observational Boundary Banner */}
      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs font-mono flex items-start gap-2.5 text-amber-300">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-amber-200 uppercase tracking-wider block text-[11px]">Observational Boundary Notice</strong>
          <span className="text-slate-300 font-sans leading-relaxed text-[11px]">
            Statistical rate anomalies are computed directly from authentic timestamped records. Network-level packet capture traces (PCAP/NetFlow) are not present in public clinical archives. Compromise is therefore assessed from operational velocity, not packet payloads.
          </span>
        </div>
      </div>

      {/* Threats Grid & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Threats List */}
        <div className="lg:col-span-2 space-y-3">
          {threats.map((th) => {
            const isSelected = selectedThreat?.event_id === th.event_id;
            const stat = th.statistical_evidence || {};
            const confTier = stat.confidence_tier || 'MEDIUM';

            return (
              <div
                key={th.event_id}
                onClick={() => setSelectedThreat(th)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-slate-900 border-rose-500/80 shadow-lg shadow-rose-950/40'
                    : 'bg-[#0B1528] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{th.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {th.detection_type}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    th.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    th.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    {th.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {th.description}
                </p>

                {/* Computed Statistical Evidence Box */}
                <div className="p-3 rounded-lg bg-black/40 border border-slate-800/80 text-[11px] font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Observed Metric:</span>
                    <span className="text-rose-300 font-bold">{th.observed_metric}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-800/60 text-[10px]">
                    <span className="text-slate-400">Sample Size: <strong className="text-white">N={stat.sample_size || 'N/A'}</strong></span>
                    {stat.z_score !== null && stat.z_score !== undefined && (
                      <span className="text-slate-400">Z-Score: <strong className="text-amber-300">+{stat.z_score}σ</strong></span>
                    )}
                    {stat.baseline_mean !== null && stat.baseline_mean !== undefined && (
                      <span className="text-slate-400">Baseline Mean: <strong className="text-emerald-400">{stat.baseline_mean} {stat.unit}</strong></span>
                    )}
                    <span className="text-slate-400">Confidence Tier: <strong className={`font-bold ${confTier === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}`}>{confTier}</strong></span>
                  </div>
                </div>

                {/* Path Decoupling Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-rose-400 font-bold block mb-0.5">ATTACK PATH VECTOR</span>
                    <span className="text-slate-300 font-sans">{th.attack_path?.exploit_vector || 'Operational deviation'}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-teal-400 font-bold block mb-0.5">HEALTHCARE IMPACT PATH</span>
                    <span className="text-slate-300 font-sans">{th.impact_path?.care_service || 'Clinical delivery'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] font-mono pt-1 text-slate-400">
                  <span>Target: <strong className="text-white">{th.targeted_asset_id}</strong></span>
                  <span className="text-slate-500 text-[10px]">{th.evidence_dataset}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Deep Evidence Inspector */}
        {selectedThreat && (
          <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-4 shadow-xl sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Anomaly Evidence Dossier
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                {selectedThreat.derivation || 'DATA_DERIVED'}
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-slate-500">Event ID: </span>
                <span className="text-white font-bold">{selectedThreat.event_id}</span>
              </div>
              <div>
                <span className="text-slate-500">Source Dataset: </span>
                <div className="text-slate-300 font-sans mt-0.5">{selectedThreat.evidence_dataset}</div>
              </div>
              <div>
                <span className="text-slate-500">Target Asset: </span>
                <span className="text-rose-400 font-bold">{selectedThreat.targeted_asset_id}</span>
              </div>

              {/* Attack Path Details */}
              {selectedThreat.attack_path && (
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-1">
                  <span className="text-rose-400 font-bold block uppercase text-[10px]">Attack Side Telemetry</span>
                  <div className="text-[11px] text-slate-300 font-sans">
                    <strong>Vector: </strong>{selectedThreat.attack_path.exploit_vector}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    <strong>Network Telemetry: </strong>{selectedThreat.attack_path.network_packet_telemetry}
                  </div>
                </div>
              )}

              {/* Impact Path Details */}
              {selectedThreat.impact_path && (
                <div className="p-2.5 rounded-lg bg-teal-950/20 border border-teal-500/30 space-y-1">
                  <span className="text-teal-400 font-bold block uppercase text-[10px]">Healthcare Impact Side</span>
                  <div className="text-[11px] text-slate-300 font-sans">
                    <strong>Affected Dependency: </strong>{selectedThreat.impact_path.affected_dependency}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    <strong>Operational Exposure: </strong>{selectedThreat.impact_path.operational_exposure}
                  </div>
                </div>
              )}

              {/* Impacted Pathways */}
              <div>
                <span className="text-slate-500 block mb-1">Impacted Care Pathways:</span>
                <div className="flex flex-wrap gap-1">
                  {(selectedThreat.impact_path?.pathways_exposed || []).map((p, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Raw Record JSON */}
              <div>
                <span className="text-slate-500 block mb-1">Authentic Record Evidence:</span>
                <pre className="p-3 rounded-xl bg-black/60 border border-slate-800 text-[10px] text-emerald-300 overflow-x-auto leading-relaxed max-h-48">
                  {JSON.stringify(selectedThreat.sample_evidence, null, 2)}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => onNavigateToResponse(selectedThreat.targeted_asset_id)}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Log Continuity Response Intent</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
