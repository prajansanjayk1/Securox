import React, { useState } from 'react';
import { Flame, ShieldAlert, AlertTriangle, CheckCircle2, Server, ArrowRight } from 'lucide-react';

export const BlastRadiusPage = ({ assets, onNavigateToResponse }) => {
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || 'EHR_CORE_GATEWAY');

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  const blastMap = {
    EHR_CORE_GATEWAY: {
      severity: 'CRITICAL_CASCADE',
      priority: 'TIER_1_CRITICAL',
      pathways: ['Emergency Intake', 'Critical Care / ICU', 'Inpatient Pharmacy & eMAR', 'Clinical Diagnostics & Laboratory'],
      services: ['Provider Order Entry (POE)', 'Patient Demographics Retrieval', 'Acuity Record Sync', 'STAT Medication Review'],
      action: 'Engage Read-Only FHIR Throttle & Local Station Cache. Do NOT disconnect emergency room triage lookups.'
    },
    EMAR_BCMA_SERVER: {
      severity: 'HIGH_CASCADE',
      priority: 'TIER_1_CRITICAL',
      pathways: ['Inpatient Pharmacy & eMAR', 'Critical Care / ICU'],
      services: ['Five-Rights Barcode Verification', 'Pyxis MedStation Cabinet Dispensing', 'STAT Admin Logging'],
      action: 'Authorize Offline Pyxis Override Mode. Shift to two-nurse manual double-check for high-alert IV vasoactive meds.'
    },
    ICU_BEDSIDE_TELEMETRY_GW: {
      severity: 'CRITICAL_CASCADE',
      priority: 'TIER_1_CRITICAL',
      pathways: ['Critical Care / ICU', 'Surgical & Perioperative Services'],
      services: ['Continuous ECG Waveform Streaming', 'Continuous SaO2 Arterial Stream', 'Central Nursing Acoustic Alarms'],
      action: 'Isolate Bedside Monitor LAN Gateway while maintaining local hardwire acoustic alarms at central nursing consoles.'
    },
    LAB_ANALYZER_LIS: {
      severity: 'HIGH_CASCADE',
      priority: 'TIER_2_HIGH',
      pathways: ['Clinical Diagnostics & Laboratory', 'Emergency Intake', 'Critical Care / ICU'],
      services: ['Automated Specimen Accessioning', 'STAT Panic Value Broadcast', 'Troponin & Blood Gas Feeds'],
      action: 'Engage Telephone STAT Panic Lab Protocol. Lab technicians telephone critical blood gas/troponin values directly.'
    },
    ED_TRIAGE_TERMINAL: {
      severity: 'MODERATE_CASCADE',
      priority: 'TIER_2_HIGH',
      pathways: ['Emergency Intake & Resuscitation'],
      services: ['Emergency Severity Index (ESI) Acuity Scoring', 'Rapid Trauma Bay Registration', 'Ambulance Handoff'],
      action: 'Activate Paper Disaster Triage Tagging (START/ESI) & Local Disaster Intake Log.'
    },
    SMART_INFUSION_PUMP_GW: {
      severity: 'HIGH_CASCADE',
      priority: 'TIER_1_CRITICAL',
      pathways: ['Critical Care / ICU', 'Inpatient Pharmacy & eMAR'],
      services: ['Dose Error Reduction System (DERS) Library Sync', 'Continuous Vasoactive Infusion Telemetry', 'High-Alert Med Safeguards'],
      action: 'Maintain manual pump keypad programming using printed certified drug library binders.'
    },
    VENTILATOR_TELEMETRY_SERVER: {
      severity: 'CRITICAL_CASCADE',
      priority: 'TIER_1_CRITICAL',
      pathways: ['Critical Care / ICU'],
      services: ['FiO2 Delivered Oxygen Feeds', 'PEEP Positive End-Expiratory Monitoring', 'Apnea & High Peak Pressure Alarms'],
      action: 'Preserve standalone pneumatic ventilation. Disconnect network telemetry while maintaining local bedside audible alarms.'
    }
  };

  const currentBlast = blastMap[selectedAssetId] || blastMap['EHR_CORE_GATEWAY'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-500" />
          <span>Healthcare Cyber Blast Radius &amp; Cascade Engine</span>
        </h2>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Evaluate downstream cascading failure depth across clinical care pathways if a specific digital asset fails or is attacked.
        </p>
      </div>

      {/* Asset Selector Grid */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
          Select Healthcare Target Asset:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {assets.map((a) => {
            const isSelected = selectedAssetId === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedAssetId(a.id)}
                className={`p-3 rounded-xl border text-left font-mono text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-lg shadow-rose-950/40'
                    : 'bg-[#0B1528] text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="truncate font-bold">{a.name}</div>
                <div className="text-[10px] opacity-80 mt-1">{a.protocol.split('/')[0]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Blast Radius Details Display */}
      {selectedAsset && (
        <div className="p-6 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-6 shadow-xl">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-base font-bold font-mono text-white">{selectedAsset.name}</span>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                {selectedAsset.ip_address}:{selectedAsset.port} | {selectedAsset.protocol}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {currentBlast.severity.replace(/_/g, ' ')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {currentBlast.priority}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Impacted Pathways */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Directly Impacted Clinical Care Pathways ({currentBlast.pathways.length})
              </span>
              <div className="space-y-2">
                {currentBlast.pathways.map((pName, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-white flex items-center justify-between"
                  >
                    <span>{pName}</span>
                    <span className="text-[10px] text-amber-400 font-bold">Cascade Depth: 1</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Services at Risk */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Critical Healthcare Services at Risk
              </span>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                {currentBlast.services.map((svc, i) => (
                  <div key={i} className="text-xs font-mono text-slate-300 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{svc}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Prescribed Continuity Safeguard Action */}
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs font-mono space-y-2">
            <div className="font-bold text-rose-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Prescribed Care Continuity Mitigation Action</span>
              </span>
              <button
                onClick={() => onNavigateToResponse(selectedAsset.id)}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer transition-all shadow"
              >
                Enforce Action
              </button>
            </div>
            <p className="text-slate-200 leading-relaxed font-sans">
              {currentBlast.action}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};

