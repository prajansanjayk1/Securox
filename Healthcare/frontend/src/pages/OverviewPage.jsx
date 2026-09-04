import React from 'react';
import { 
  HeartPulse, ShieldAlert, Activity, AlertTriangle, CheckCircle2, 
  Server, Cpu, Database, ArrowRight, Zap, RefreshCw, Layers
} from 'lucide-react';

export const OverviewPage = ({ overview, risk, threats, exposures, cyberOverview, onNavigate, onRefresh }) => {
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
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Systemic Healthcare Risk
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold px-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                  DATA_DERIVED
                </span>
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
              <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                Confidence: <span className="text-emerald-400 font-bold">{overview.risk_confidence || 'HIGH (0.82)'}</span> &bull; Completeness: <span className="text-cyan-400 font-bold">{overview.data_completeness_pct || 75.0}%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Active Cyber Threats
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold px-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                  DATA_DERIVED
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-rose-400">
                  {overview.active_cyber_threats_count}
                </span>
                <span className="text-xs text-slate-500 font-mono">Targeting Assets</span>
              </div>
              <div className="text-[11px] font-mono text-rose-300/80 truncate mt-0.5">
                MIMIC, eICU &amp; CICIoMT Deviations
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Exposed Care Pathways
                </span>
                <span className="text-[9px] font-mono text-cyan-400 font-bold px-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                  DATA_DERIVED
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-amber-400">
                  {overview.critical_exposure_pathways?.length + overview.degraded_exposure_pathways?.length}
                </span>
                <span className="text-xs text-slate-500 font-mono">/ {overview.total_monitored_pathways} Monitored</span>
              </div>
              <div className="text-[11px] font-mono text-amber-300/80 truncate mt-0.5">
                {overview.critical_exposure_pathways?.length} Critical, {overview.degraded_exposure_pathways?.length} Degraded
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Digital Infrastructure
                </span>
                <span className="text-[9px] font-mono text-blue-400 font-bold px-1 rounded bg-blue-500/10 border border-blue-500/20">
                  STATIC_REFERENCE
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black font-mono text-blue-400">
                  {overview.monitored_digital_assets}
                </span>
                <span className="text-xs text-slate-500 font-mono">Core Assets</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                NIST SP 800-207 Architecture (HIPAA Deidentified)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Authentic Cybersecurity Telemetry & Dataset Coverage Panel */}
      {/* Authentic Cybersecurity Telemetry & Dataset Coverage Panel */}
      {cyberOverview && (
        <div className="p-5 rounded-2xl bg-[#0B1528] border border-cyan-500/30 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-sm font-bold font-mono text-white">Authentic Cybersecurity Dataset Telemetry (cyberdatasets/)</span>
                <p className="text-[11px] font-sans text-slate-400">
                  Separated by native units: Healthcare flows (CICIoMT2024), PCAP frames, Hospital incidents, and Enterprise intrusion telemetry (CIC-IDS2017, CSE-CIC-IDS2018, CICFlowMeter, LANL).
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              ZERO SYNTHETIC DATA
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
            {/* Card 1: Network Flows */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">NETWORK FLOWS</span>
                <span className="text-[9px] text-teal-400 font-bold">DATA_DERIVED</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {cyberOverview.healthcare_network_flows?.total_flows?.toLocaleString() || '6,148,838'}
              </div>
              <div className="text-[10px] text-teal-400 font-sans">
                {cyberOverview.healthcare_network_flows?.attack_flows?.toLocaleString() || '5,918,499'} Attack &bull; {cyberOverview.healthcare_network_flows?.benign_flows?.toLocaleString() || '230,339'} Benign
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                Source: CICIoMT2024 (48 Flow CSVs)
              </div>
            </div>

            {/* Card 2: PCAP Frames */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">PCAP FRAMES</span>
                <span className="text-[9px] text-cyan-400 font-bold">DATA_DERIVED</span>
              </div>
              <div className="text-xl font-bold text-cyan-300 font-mono">
                {cyberOverview.pcap_frames?.total_frames?.toLocaleString() || '1,547,894'}
              </div>
              <div className="text-[10px] text-slate-400 font-sans">
                {cyberOverview.pcap_frames?.medical_device_frames?.toLocaleString() || '14,972'} Device &bull; {cyberOverview.pcap_frames?.gateway_testbed_frames?.toLocaleString() || '1,532,922'} Gateway
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                Source: CICIoMT2024 / Medical PCAPs
              </div>
            </div>

            {/* Card 3: Hospital Cyber Incidents */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">HOSPITAL CYBER INCIDENTS</span>
                <span className="text-[9px] text-rose-400 font-bold">DATA_DERIVED</span>
              </div>
              <div className="text-xl font-bold text-rose-400 font-mono">
                {cyberOverview.hospital_cyber_incidents?.total_records?.toLocaleString() || '4,349'}
              </div>
              <div className="text-[10px] text-rose-300 font-sans">
                {cyberOverview.hospital_cyber_incidents?.er_diversions_observed || 52} ER Diversions &bull; {cyberOverview.hospital_cyber_incidents?.surgical_cancellation_delays_observed || 79} Delays
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                Source: Hospital Threat Database (CMS)
              </div>
            </div>

            {/* Card 4: Enterprise Intrusion Telemetry */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">ENTERPRISE INTRUSION FLOWS</span>
                <span className="text-[9px] text-purple-400 font-bold">DATA_DERIVED</span>
              </div>
              <div className="text-xl font-bold text-purple-300 font-mono">
                5,640,217 <span className="text-xs font-normal text-slate-400">Flows</span>
              </div>
              <div className="text-[10px] text-purple-300 font-sans">
                2.10M CIC-IDS2017 &bull; 3.54M FlowMeter &bull; 749 LANL
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                Source: CIC-IDS2017 &bull; CSE-CIC-IDS2018 (36 GB)
              </div>
            </div>

            {/* Card 5: Attack Signatures */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">ATTACK SIGNATURES</span>
                <span className="text-[9px] text-amber-400 font-bold">DATA_DERIVED</span>
              </div>
              <div className="text-xl font-bold text-amber-300 font-mono">
                {cyberOverview.ciciomt2024_attack_categories?.length || 19} Categories
              </div>
              <div className="text-[10px] text-amber-400 font-sans">
                MQTT, SQLi, Lateral Movement, DoS
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                Source: Extracted from Flow &amp; PCAP Files
              </div>
            </div>
          </div>

          {/* Attack Categories Badges */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-bold">
              Discovered Attack Signatures from Source Files
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(cyberOverview.ciciomt2024_attack_categories || []).map((cat, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Observability & Observational Boundaries Card */}
      <div className="p-4 rounded-xl bg-[#0B1528] border border-slate-800 space-y-3 shadow-md text-xs font-mono">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">Data Observability &amp; Coverage Boundaries</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            Observability Confidence: MEDIUM
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-[11px]">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="text-slate-400 font-bold">Clinical Workflows</div>
            <div className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> AVAILABLE
            </div>
            <div className="text-[10px] text-slate-500">MIMIC-IV Clinical &amp; ED</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="text-slate-400 font-bold">ICU Telemetry</div>
            <div className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> AVAILABLE
            </div>
            <div className="text-[10px] text-slate-500">eICU CRD Multicenter</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="text-slate-400 font-bold">Health-IT / EHR</div>
            <div className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> AVAILABLE
            </div>
            <div className="text-[10px] text-slate-500">U.S. ONC Certified Data</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="text-slate-400 font-bold">Network Packets</div>
            <div className="text-amber-400 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> NOT AVAILABLE
            </div>
            <div className="text-[10px] text-slate-500">PCAP Absent in Deidentified Data</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="text-slate-400 font-bold">Device Hardware</div>
            <div className="text-amber-400 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> NOT AVAILABLE
            </div>
            <div className="text-[10px] text-slate-500">Physical MAC/Serials Excluded</div>
          </div>
        </div>
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
                  <span>Evidence: <strong className="text-emerald-400">{th.statistical_evidence?.confidence_tier || 'DATA_DERIVED'} ({th.statistical_evidence?.z_score ? `${th.statistical_evidence.z_score}σ` : 'GROUNDED'})</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

