import React, { useState } from 'react';
import { Zap, ShieldAlert, AlertTriangle, CheckCircle2, Server, Database, ArrowRight, Eye } from 'lucide-react';

export const ThreatsPage = ({ threats, onNavigateToAsset, onNavigateToResponse }) => {
  const [selectedThreat, setSelectedThreat] = useState(threats[0] || null);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span>Observed Telemetry Anomalies &amp; Cyber Threat Signatures</span>
        </h2>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Detects authentic behavioral bursts, telemetry stream dropouts, and unauthorized cabinet access across real healthcare datasets.
        </p>
      </div>

      {/* Threats Grid & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Threats List */}
        <div className="lg:col-span-2 space-y-3">
          {threats.map((th) => {
            const isSelected = selectedThreat?.event_id === th.event_id;
            return (
              <div
                key={th.event_id}
                onClick={() => setSelectedThreat(th)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono bg-black/40 p-2.5 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-slate-500">Observed: </span>
                    <span className="text-rose-300 font-bold">{th.observed_metric}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Baseline: </span>
                    <span className="text-emerald-400">{th.baseline_metric}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] font-mono pt-1 text-slate-400">
                  <span>Target: <strong className="text-white">{th.targeted_asset_id}</strong></span>
                  <span>Confidence: <strong className="text-emerald-400">{(th.confidence_score * 100).toFixed(1)}%</strong></span>
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
                Threat Evidence Dossier
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                AUTHENTIC EVIDENCE
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

              {/* Impacted Pathways */}
              <div>
                <span className="text-slate-500 block mb-1">Impacted Care Pathways:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedThreat.affected_pathways.map((p, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Raw Record JSON */}
              <div>
                <span className="text-slate-500 block mb-1">Raw Sample Record:</span>
                <pre className="p-3 rounded-xl bg-black/60 border border-slate-800 text-[10px] text-emerald-300 overflow-x-auto leading-relaxed">
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
                  <span>Enforce Continuity Safeguard</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

