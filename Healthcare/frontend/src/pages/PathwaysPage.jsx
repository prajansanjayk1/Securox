import React from 'react';
import { HeartPulse, Layers, AlertTriangle, CheckCircle2, Server, Database } from 'lucide-react';

export const PathwaysPage = ({ pathways, exposures }) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-rose-500" />
          <span>Care Pathway Shadows &amp; Operational Degradation</span>
        </h2>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Live digital twin of hospital clinical workflows, tracking operational exposure and degradation states across authentic dataset milestones.
        </p>
      </div>

      {/* Pathways List */}
      <div className="space-y-4">
        {pathways.map((p) => {
          const exp = exposures.find((e) => e.pathway_id === p.id) || {};
          const degradationState = exp.degradation_state || 'NORMAL';
          const exposureScore = exp.exposure_score || 0;

          return (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-4 shadow-lg"
            >
              {/* Top Pathway Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-mono text-white">{p.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      degradationState === 'SEVERELY DEGRADED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      degradationState === 'DEGRADED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {degradationState}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    {p.description}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Operational Exposure</div>
                  <div className={`text-xl font-black font-mono ${
                    exposureScore >= 70 ? 'text-rose-400' :
                    exposureScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {exposureScore} <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Acuity & Grounding Evidence Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500">Clinical Acuity Weight: </span>
                  <span className="text-slate-200 font-bold">{p.clinical_acuity_weight}</span>
                </div>
                <div>
                  <span className="text-slate-500">Observed Volume: </span>
                  <span className="text-emerald-400 font-bold">{p.observed_volume_metric}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">Source: </span>
                  <span className="text-slate-300">{p.source_dataset.split(' ')[0]}</span>
                </div>
              </div>

              {/* Milestones Flow */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  Clinical Milestones &amp; Underlying Digital Dependencies
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {p.milestones.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-white">
                        <span className="truncate">{m.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">{m.clinical_purpose}</p>
                      <div className="text-[10px] text-amber-400 pt-1 border-t border-slate-800">
                        Dependency: {m.underlying_digital_dependency}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate">
                        Field: {m.observed_table_field}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Impact Advisory */}
              {exp.clinical_impact_note && (
                <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300">Clinical Impact Assessment: </strong>
                    {exp.clinical_impact_note}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

