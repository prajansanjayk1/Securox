import React, { useState } from 'react';
import { Database, ShieldCheck, CheckCircle2, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const EvidencePage = ({ datasets }) => {
  const [selectedTable, setSelectedTable] = useState('triage');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const availableTables = [
    { id: 'triage', label: 'triage (MIMIC-ED)', dataset: 'MIMIC-IV-ED Demo v2.2' },
    { id: 'edstays', label: 'edstays (MIMIC-ED)', dataset: 'MIMIC-IV-ED Demo v2.2' },
    { id: 'pyxis', label: 'pyxis (MIMIC-ED)', dataset: 'MIMIC-IV-ED Demo v2.2' },
    { id: 'poe', label: 'poe (MIMIC-Clinical)', dataset: 'MIMIC-IV Clinical Demo v2.2' },
    { id: 'emar', label: 'emar (MIMIC-Clinical)', dataset: 'MIMIC-IV Clinical Demo v2.2' },
    { id: 'emar_detail', label: 'emar_detail (MIMIC-Clinical)', dataset: 'MIMIC-IV Clinical Demo v2.2' },
    { id: 'labevents', label: 'labevents (MIMIC-Clinical)', dataset: 'MIMIC-IV Clinical Demo v2.2' },
    { id: 'chartevents', label: 'chartevents (MIMIC-Clinical)', dataset: 'MIMIC-IV Clinical Demo v2.2' },
    { id: 'vitalPeriodic', label: 'vitalPeriodic (eICU)', dataset: 'eICU CRD Demo v2.0.1' },
    { id: 'respiratoryCharting', label: 'respiratoryCharting (eICU)', dataset: 'eICU CRD Demo v2.0.1' },
    { id: 'infusiondrug', label: 'infusiondrug (eICU)', dataset: 'eICU CRD Demo v2.0.1' },
    { id: 'chpl_linkage', label: 'chpl_linkage (ONC)', dataset: 'ONC Health IT Data' },
    { id: 'ecosystem_apps', label: 'ecosystem_apps (ONC)', dataset: 'ONC Health IT Data' }
  ];

  const fetchRecords = async (tableName) => {
    setLoading(true);
    setError(null);
    setSelectedTable(tableName);
    try {
      const res = await api.getEvidence(tableName, 6);
      setRecords(res.data.records || []);
    } catch (e) {
      console.error('Failed to fetch table records:', e);
      setError('Unable to load records for table ' + tableName);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRecords('triage');
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Auditable Evidence, Data Lineage &amp; Provenance Ledger</span>
          </h2>
          <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/30">
            Verified Clinical Datasets
          </span>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Complete auditability. Every operational milestone and cyber prediction is traceable to its authentic source dataset.
        </p>
      </div>

      {/* Registered Datasets Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {datasets?.registered_datasets && Object.values(datasets.registered_datasets).map((ds) => (
          <div
            key={ds.id}
            className="p-4 rounded-xl border text-xs font-mono space-y-2 bg-[#0B1528] border-slate-800"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{ds.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                VERIFIED CLINICAL DATA
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Source: {ds.source}</div>
            <div className="text-[11px] text-slate-400">License: {ds.license}</div>
            <div className="text-[11px] text-slate-300 font-sans pt-1">
              <strong className="font-mono text-slate-400">Role: </strong>{ds.careguard_role}
            </div>
          </div>
        ))}
      </div>

      {/* Direct Table Evidence Inspector */}
      <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Interactive Table Record Inspector
            </span>
            <div className="text-xs font-mono text-slate-400 mt-0.5">
              Query authentic raw records directly from disk
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 max-w-xl">
            {availableTables.map((t) => (
              <button
                key={t.id}
                onClick={() => fetchRecords(t.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono cursor-pointer transition-all ${
                  selectedTable === t.id
                    ? 'bg-emerald-600 text-white font-bold shadow'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {t.id}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">
            Streaming authentic records from dataset...
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs font-mono">
            {error}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Showing {records.length} records from <strong className="text-white">{selectedTable}</strong>:</span>
            </div>
            <pre className="p-4 rounded-xl bg-black/60 border border-slate-800 text-[10px] font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-96">
              {JSON.stringify(records, null, 2)}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
};

