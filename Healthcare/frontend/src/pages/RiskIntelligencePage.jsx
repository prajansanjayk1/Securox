import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Info, HelpCircle, Layers, Cpu, Check, X } from 'lucide-react';

export const RiskIntelligencePage = ({ risk }) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>Explainable Healthcare Cyber Risk Intelligence</span>
          </h2>
          <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30">
            NIST SP 800-30 &amp; ISO 27799
          </span>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Rigorous, explainable translation of digital anomalies, asset criticality, and care pathway exposure into clinical risk. Non-clinical patient-safety terminology enforced.
        </p>
      </div>

      {/* Top Risk Score Summary */}
      {risk && (
        <div className="p-6 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Systemic Healthcare Cyber Risk Score
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className={`text-4xl font-black font-mono ${
                  risk.composite_risk_score >= 70 ? 'text-rose-400' :
                  risk.composite_risk_score >= 40 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {risk.composite_risk_score}
                </span>
                <span className="text-sm font-mono text-slate-500">/ 100</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {risk.risk_tier.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 space-y-1">
              <div>Evaluated Pathways: <strong className="text-white">{risk.evaluated_pathways_count}</strong></div>
              <div>Active Deviations: <strong className="text-rose-400">{risk.active_threats_count}</strong></div>
              <div>Uncertainty: <strong className="text-amber-400 font-bold">{risk.uncertainty_level || 'MEDIUM'}</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs font-mono flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white uppercase tracking-wider">Operational Clinical Advisory</span>
              <p className="text-slate-300 font-sans leading-relaxed">{risk.operational_advisory}</p>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Checklist vs Missing Observables Grid */}
      {risk && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Verified Evidence Checklist */}
          <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-3 shadow-lg">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Evidence Inputs (Observed Data)</span>
            </span>
            <div className="space-y-2">
              {(risk.evidence_checklist || []).map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between text-white font-bold">
                    <span>{item.criterion}</span>
                    <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">VERIFIED</span>
                  </div>
                  <p className="text-slate-300 font-sans text-[11px] leading-relaxed">{item.detail}</p>
                  <div className="text-[10px] text-slate-500">Source: {item.source}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Observables & Uncertainty Justification */}
          <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-3 shadow-lg">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>Unobservable Telemetry &amp; Uncertainty Boundaries</span>
            </span>
            <div className="space-y-2">
              {(risk.missing_evidence || []).map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between text-white font-bold">
                    <span>{item.observable}</span>
                    <span className="text-amber-400 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded">NOT AVAILABLE</span>
                  </div>
                  <p className="text-slate-300 font-sans text-[11px] leading-relaxed">{item.rationale}</p>
                  <div className="text-[10px] text-teal-400">Mitigation: {item.mitigation}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Explainable Attribution: The "WHY?" Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Explainable Risk Attribution — Answering "WHY?"</span>
        </h3>

        <div className="space-y-3">
          {risk?.risk_drivers?.map((driver, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-3 shadow-lg"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white">{driver.threat_title}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    driver.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    driver.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    {driver.severity}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
                  <span>Target: <strong className="text-slate-200">{driver.targeted_asset}</strong></span>
                  {driver.z_score !== null && driver.z_score !== undefined && (
                    <span className="text-amber-300">Z: +{driver.z_score}σ (N={driver.sample_size})</span>
                  )}
                </div>
              </div>

              {/* 4-Question Explainable Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block uppercase text-[10px]">What was observed?</span>
                  <span className="text-rose-300 font-bold">{driver.observed_metric}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block uppercase text-[10px]">Which asset is affected?</span>
                  <span className="text-white font-bold">{driver.targeted_asset}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block uppercase text-[10px]">Exposed Care Pathways</span>
                  <span className="text-amber-300 font-bold">{driver.affected_pathways.join(', ')}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block uppercase text-[10px]">Evidence Grounding</span>
                  <span className="text-slate-300 truncate">{driver.evidence_dataset.split('(')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
