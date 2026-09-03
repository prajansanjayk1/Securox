import React from 'react';
import { 
  HeartPulse, ShieldAlert, Activity, AlertTriangle, CheckCircle2, 
  Server, Cpu, Database, ArrowRight, Zap, RefreshCw, Layers
} from 'lucide-react';

export const OverviewPage = ({ overview, risk, threats, exposures, onNavigate, onRefresh }) => {
  return (
    <div className="space-y-6">
      
      {/* Top Banner Ribbon */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-blue-950/40 border border-rose-500/20 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-inner">
                <HeartPulse className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-white font-mono">
                    CAREGUARD
                  </h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    CYBER-TO-CARE DIGITAL TWIN
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Real-time cyber risk intelligence connecting digital hospital assets, clinical dependencies &amp; operational care pathway exposure
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resync Telemetry</span>
          </button>
        </div>

        {/* Global Operational Metrics Ribbon */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Systemic Healthcare Risk
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-black font-mono ${
                  overview.composite_risk_score >= 70 ? 'text-rose-400' :
                  overview.composite_risk_score >= 40 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {overview.composite_risk_score}
                </span>
                <span className="text-xs text-slate-500 font-mono">/ 100</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                {overview.risk_tier.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Active Cyber Threats
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-rose-400">
                  {overview.active_cyber_threats_count}
                </span>
                <span className="text-xs text-slate-500 font-mono">Targeting Assets</span>
              </div>
              <div className="text-[11px] font-mono text-rose-300/80 truncate mt-0.5">
                POE, Bedside &amp; BCMA Gateways
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Exposed Care Pathways
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-amber-400">
                  {overview.critical_exposure_pathways.length + overview.degraded_exposure_pathways.length}
                </span>
                <span className="text-xs text-slate-500 font-mono">/ {overview.total_monitored_pathways} Monitored</span>
              </div>
              <div className="text-[11px] font-mono text-amber-300/80 truncate mt-0.5">
                {overview.critical_exposure_pathways.length} Critical, {overview.degraded_exposure_pathways.length} Degraded
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Digital Infrastructure
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-blue-400">
                  {overview.monitored_digital_assets}
                </span>
                <span className="text-xs text-slate-500 font-mono">Core Assets</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                EHR, LIS, eMAR, IoMT &amp; FHIR
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Operational Advisory Alert */}
      {overview && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Clinical Infrastructure Advisory
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {overview.operational_advisory}
            </p>
          </div>
        </div>
      )}

      {/* Quick Cyber-to-Care Exposure Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Care Pathway Operational Exposure */}
        <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-rose-400" />
              <h2 className="text-sm font-bold font-mono text-white">
                Care Pathway Operational Exposure
              </h2>
            </div>
            <button
              onClick={() => onNavigate('pathways')}
              className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View Shadows</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {exposures.map((exp) => (
              <div
                key={exp.pathway_id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{exp.pathway_name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    exp.degradation_state === 'SEVERELY DEGRADED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    exp.degradation_state === 'DEGRADED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {exp.degradation_state}
                  </span>
                </div>
                
                {/* Exposure Bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      exp.exposure_score >= 70 ? 'bg-rose-500' :
                      exp.exposure_score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${exp.exposure_score}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Exposure Score: <strong className="text-white">{exp.exposure_score}/100</strong></span>
                  <span className="truncate">Source: {exp.source_dataset.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Detected Cyber Threats */}
        <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold font-mono text-white">
                Active Telemetry Anomalies &amp; Threats
              </h2>
            </div>
            <button
              onClick={() => onNavigate('threats')}
              className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Threats</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {threats.slice(0, 4).map((th) => (
              <div
                key={th.event_id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{th.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    th.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                    th.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    {th.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{th.description}</p>
                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Target: <strong className="text-slate-300">{th.targeted_asset_id}</strong></span>
                  <span>Confidence: <strong className="text-emerald-400">{(th.confidence_score * 100).toFixed(1)}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

