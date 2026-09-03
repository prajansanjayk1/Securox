import React from 'react';
import { Server, Database, ShieldAlert, Cpu, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const HealthITPage = ({ healthIt }) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            <span>Health-IT Infrastructure &amp; SMART-on-FHIR API Ecosystem</span>
          </h2>
          <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/30">
            ONC Certified Standards
          </span>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Hospital Electronic Health Record linkages, SMART-on-FHIR marketplace applications, and clinical data interoperability derived from ONC open data.
        </p>
      </div>

      {/* Security Advisory */}
      {healthIt?.api_security_advisory && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs font-mono space-y-1">
          <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>FHIR API Security Advisory: {healthIt.api_security_advisory.status}</span>
          </div>
          <p className="text-slate-300 font-sans">{healthIt.api_security_advisory.risk_summary}</p>
          <div className="text-emerald-400 pt-1">
            <strong>Prescribed Safeguard: </strong>{healthIt.api_security_advisory.mitigation}
          </div>
        </div>
      )}

      {/* Stats & Market Share */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Certified EHR Market */}
        <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-4 shadow-lg">
          <span className="text-xs font-mono uppercase tracking-wider text-white font-bold block">
            Certified Hospital EHR Infrastructure (CHPL)
          </span>
          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 block mb-1">Dominant Certified EHR Platforms:</span>
              <div className="flex flex-wrap gap-1.5">
                {healthIt?.certified_ehr_market?.primary_platforms.map((p, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 font-bold">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Certification Baselines:</span>
              <div className="flex flex-wrap gap-1.5">
                {healthIt?.certified_ehr_market?.certification_editions.map((e, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Supported Interoperability Standards:</span>
              <div className="flex flex-wrap gap-1.5">
                {healthIt?.certified_ehr_market?.standards_supported.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SMART-on-FHIR Software Ecosystem */}
        <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-4 shadow-lg">
          <span className="text-xs font-mono uppercase tracking-wider text-white font-bold block">
            SMART-on-FHIR Software Ecosystem Profile
          </span>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Total Analyzed Certified Apps:</span>
              <span className="font-bold text-white">8,089 Registered Applications</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Hospital Facility CHPL Linkages:</span>
              <span className="font-bold text-white">68,447 Verified Linkages</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">AHA Interoperability Respondents:</span>
              <span className="font-bold text-white">625 Hospitals Surveyed</span>
            </div>
          </div>
        </div>

      </div>

      {/* Raw Sample Records from ONC */}
      {healthIt?.sample_ecosystem_apps && healthIt.sample_ecosystem_apps.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-3 shadow-lg">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
            Observed SMART-on-FHIR App Record Sample (ecosystem-apps-software-marketplace-history.csv)
          </span>
          <pre className="p-3 rounded-xl bg-black/50 border border-slate-800 text-[10px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
            {JSON.stringify(healthIt.sample_ecosystem_apps[0], null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
};

