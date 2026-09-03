import React, { useState } from 'react';
import { 
  Network, Server, Layers, HeartPulse, ShieldAlert, 
  AlertTriangle, CheckCircle2, ArrowRight, Zap, Info 
} from 'lucide-react';

export const CartographyPage = ({ assets, pathways, threats, onSelectAsset }) => {
  const [selectedAssetId, setSelectedAssetId] = useState('EHR_CORE_GATEWAY');

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-rose-500" />
            <span>Cyber Care Cartography — Dependency Topology</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            NIST SP 800-207 Zero-Trust Mapping
          </span>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Visualizing end-to-end propagation: Cyber Threat &rarr; Healthcare Digital Asset &rarr; Clinical Dependency &rarr; Care Pathway &rarr; Operational Exposure.
        </p>
      </div>

      {/* 4-Stage Dependency Flow Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
        
        {/* Column 1: Cyber Threats */}
        <div className="p-4 rounded-2xl bg-[#0B1528] border border-rose-500/30 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>1. Cyber Event</span>
          </div>
          <p className="text-[10px] text-slate-500 font-sans">Observed telemetry anomalies</p>
          <div className="space-y-2">
            {threats.map((th) => (
              <div
                key={th.event_id}
                className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono space-y-1"
              >
                <div className="font-bold text-rose-300">{th.title}</div>
                <div className="text-[10px] text-slate-400">{th.detection_type}</div>
                <div className="text-[9px] text-rose-400 font-bold">Target: {th.targeted_asset_id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Digital Healthcare Assets */}
        <div className="p-4 rounded-2xl bg-[#0B1528] border border-blue-500/30 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            <Server className="w-4 h-4" />
            <span>2. Digital Asset</span>
          </div>
          <p className="text-[10px] text-slate-500 font-sans">Core clinical infrastructure</p>
          <div className="space-y-2">
            {assets.map((a) => {
              const isSelected = selectedAssetId === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedAssetId(a.id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white font-bold shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{a.name}</span>
                    <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">
                      :{a.port}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{a.ip_address}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 3: Clinical Dependencies */}
        <div className="p-4 rounded-2xl bg-[#0B1528] border border-amber-500/30 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>3. Dependency</span>
          </div>
          <p className="text-[10px] text-slate-500 font-sans">Required clinical functions</p>
          <div className="space-y-2">
            {selectedAsset?.critical_dependencies.map((dep, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300 space-y-1"
              >
                <div className="flex items-start justify-between gap-1 font-bold text-slate-200">
                  <span>{dep}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 4: Operational Care Pathways */}
        <div className="p-4 rounded-2xl bg-[#0B1528] border border-purple-500/30 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
            <HeartPulse className="w-4 h-4" />
            <span>4. Care Pathway</span>
          </div>
          <p className="text-[10px] text-slate-500 font-sans">Exposed patient care workflows</p>
          <div className="space-y-2">
            {pathways.map((p) => {
              const isAssociated = selectedAsset?.associated_pathways.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-xl border text-xs font-mono space-y-1 ${
                    isAssociated
                      ? 'bg-purple-950/30 border-purple-500/50 text-purple-200'
                      : 'bg-slate-900/30 border-slate-800/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="truncate">{p.name}</span>
                    {isAssociated && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                        EXPOSED
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] opacity-80">{p.observed_volume_metric}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Selected Asset Technical Detail Box */}
      {selectedAsset && (
        <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 text-xs font-mono space-y-3 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-base font-bold text-white uppercase">{selectedAsset.name}</span>
              <div className="text-[11px] text-slate-400 mt-0.5">Primary Vendor: {selectedAsset.primary_vendor}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold">
                {selectedAsset.protocol}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                {selectedAsset.ip_address}:{selectedAsset.port}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-300 font-sans">
            <span className="font-mono text-slate-500">Source Dataset Provenance: </span>
            <span className="font-mono text-slate-300">{selectedAsset.source_dataset}</span>
          </div>
        </div>
      )}

    </div>
  );
};

