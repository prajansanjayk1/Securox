import React, { useState } from 'react';
import { Activity, Radio, AlertTriangle, CheckCircle2, ShieldAlert, Cpu, Info, FileCode, Play } from 'lucide-react';

export const MedicalDevicesPage = ({ devices, cyberDevices }) => {
  const categories = devices?.categories || [];
  const pcapDevices = cyberDevices?.devices || devices?.authentic_medical_device_pcaps || [];
  const [selectedPcap, setSelectedPcap] = useState(pcapDevices[0] || null);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-400" />
            <span>Connected Medical Device (IoMT) Telemetry &amp; Real PCAP Captures</span>
          </h2>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30">
            {pcapDevices.length} Real Medical Device PCAPs Loaded
          </span>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Surveillance of authentic Bluetooth Low Energy medical sensor captures (pulse oximeters, blood pressure, ECG armbands) from CICIoMT2024 and clinical ICU telemetry from eICU.
        </p>
      </div>

      {/* Observational Boundary Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono flex items-start gap-2.5 text-slate-300">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-white uppercase tracking-wider block text-[11px]">Authentic Device Identification Grounding</strong>
          <span className="text-slate-400 font-sans leading-relaxed text-[11px]">
            Device models and clinical roles are derived strictly from authentic physical packet captures in <code className="text-teal-300">cyberdatasets/</code> (Checkme O2, Checkme BP2A, Lookee O2, SleepU, Wellue, COOSPO, Powerlabs). CAREGUARD never invents fictitious vendor counts.
          </span>
        </div>
      </div>

      {/* Real IoMT Medical Device PCAPs Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Authentic Physical IoMT Medical Device Packet Traces ({pcapDevices.length} PCAPs)</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Protocol: Bluetooth HCI (Linktype 201) / BLE Medical Profiles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pcapDevices.map((dev, idx) => {
            const isAttack = dev.file_name.includes('DoS');
            return (
              <div
                key={idx}
                onClick={() => setSelectedPcap(dev)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                  selectedPcap?.file_name === dev.file_name
                    ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/40'
                    : isAttack
                    ? 'bg-[#12080D] border-rose-900/60 hover:border-rose-700'
                    : 'bg-[#0B1528] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">{dev.device_name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{dev.device_category}</span>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isAttack
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  }`}>
                    {isAttack ? 'ATTACK TRACE' : 'BENIGN PCAP'}
                  </span>
                </div>

                <div className="text-[11px] font-sans text-slate-300 leading-snug">
                  {dev.clinical_role}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono p-2 rounded bg-black/40 border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block">Frames Parsed</span>
                    <strong className="text-white">{dev.packet_count?.toLocaleString()} pkts</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Arrival Rate</span>
                    <strong className={isAttack ? 'text-rose-400 font-bold' : 'text-teal-300'}>
                      {dev.packets_per_sec} pkts/s
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duration</span>
                    <span className="text-slate-300">{dev.duration_seconds}s</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">File Size</span>
                    <span className="text-slate-300">{(dev.file_size_bytes / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 truncate flex items-center justify-between">
                  <span>File: <strong className="text-slate-400">{dev.file_name}</strong></span>
                  <span className="text-emerald-400">DATA_DERIVED</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected PCAP Packet Inspector */}
      {selectedPcap && selectedPcap.sample_packets?.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0B1528] border border-cyan-500/30 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Raw Packet Inspection: {selectedPcap.device_name} ({selectedPcap.file_name})
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              Linktype {selectedPcap.linktype} (Bluetooth HCI)
            </span>
          </div>

          <div className="space-y-2">
            {selectedPcap.sample_packets.map((pkt, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[11px] font-mono space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Frame #{pkt.packet_index} | Length: {pkt.length} bytes (Wire: {pkt.orig_length}B)</span>
                  <span className="text-slate-500">{new Date(pkt.timestamp * 1000).toISOString()}</span>
                </div>
                <div className="text-emerald-300/90 break-all font-mono text-[10px]">
                  Raw Payload Hex: {pkt.hex_preview}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Care Stream Surveillance (eICU Streams) */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-400" />
          <span>Multicenter ICU Clinical Telemetry Streams (eICU CRD Grounding)</span>
        </span>

        <div className="grid grid-cols-1 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.category_id}
              className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-3 shadow-lg"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-800 pb-2">
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
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-500">
                  Source: {cat.source_dataset?.split('(')[0]}
                </div>
              </div>

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
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
