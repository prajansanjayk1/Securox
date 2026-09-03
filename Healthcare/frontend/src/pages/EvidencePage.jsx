import React, { useState } from 'react';
import { Database, ShieldCheck, CheckCircle2, AlertTriangle, Eye, RefreshCw, Zap, Radio, FileText, Search } from 'lucide-react';
import { api } from '../services/api';

export const EvidencePage = ({ datasets, cyberInventory, cyberOverview }) => {
  const [activeTab, setActiveTab] = useState('clinical');
  const [selectedTable, setSelectedTable] = useState('triage');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const cyberFiles = cyberInventory?.files || [];
  const filteredCyberFiles = cyberFiles.filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return f.file_name.toLowerCase().includes(q) ||
           f.dataset_domain.toLowerCase().includes(q) ||
           f.file_type.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Auditable Evidence, Data Lineage &amp; Provenance Ledger</span>
          </h2>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30">
            Zero Synthetic Data Guarantee
          </span>
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1">
          Complete auditability. Every operational milestone and cyber detection is traceable to authentic clinical and cybersecurity datasets.
        </p>
      </div>

      {/* Dataset Family Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('cyber')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'cyber'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cybersecurity Datasets ({cyberFiles.length} Files Indexed)</span>
        </button>

        <button
          onClick={() => setActiveTab('clinical')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'clinical'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Clinical Healthcare Datasets (MIMIC &bull; eICU &bull; ONC)</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* CYBERSECURITY DATASETS TAB */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'cyber' && (
        <div className="space-y-4">
          {/* Summary Box */}
          {cyberOverview && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Total Files Indexed</span>
                <strong className="text-white text-base font-mono">{cyberOverview.total_files_discovered} files</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Total Flow Records</span>
                <strong className="text-cyan-300 text-base font-mono">{cyberOverview.total_records_indexed?.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Attack Signatures</span>
                <strong className="text-amber-300 text-base font-mono">{cyberOverview.ciciomt2024_attack_categories?.length} categories</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Physical IoMT PCAPs</span>
                <strong className="text-teal-300 text-base font-mono">{cyberOverview.monitored_iomt_devices_count} captures</strong>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter files by name, type, or dataset domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <span className="text-xs font-mono text-slate-500">
              Showing {filteredCyberFiles.length} of {cyberFiles.length} files
            </span>
          </div>

          {/* Files Table */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0B1528] shadow-lg">
            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    <th className="py-2.5 px-4">File Name</th>
                    <th className="py-2.5 px-4">File Type</th>
                    <th className="py-2.5 px-4">Dataset Domain</th>
                    <th className="py-2.5 px-4 text-right">Size</th>
                    <th className="py-2.5 px-4 text-center">Derivation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCyberFiles.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2 px-4 text-white font-bold">{f.file_name}</td>
                      <td className="py-2 px-4 text-slate-300">{f.file_type}</td>
                      <td className="py-2 px-4 text-cyan-400/90">{f.dataset_domain}</td>
                      <td className="py-2 px-4 text-right text-slate-400">
                        {(f.file_size_bytes / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {f.derivation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CLINICAL DATASETS TAB */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'clinical' && (
        <div className="space-y-6">
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
                <p className="text-slate-400 font-sans text-xs">{ds.careguard_role}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-300 border-t border-slate-800/80">
                  <div>Source: <strong className="text-white">{ds.source}</strong></div>
                  <div>Years: <strong className="text-white">{ds.collection_years}</strong></div>
                </div>
              </div>
            ))}
          </div>

          {/* Table Selector & Sample Records */}
          <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
                  Interactive Clinical Sample Record Viewer
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Inspecting authentic table records (First 6 rows loaded live from disk)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedTable}
                  onChange={(e) => fetchRecords(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs font-mono text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {availableTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Reading authentic records from disk archive...</span>
              </div>
            ) : error ? (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-xs font-mono text-rose-300">
                {error}
              </div>
            ) : records.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-slate-500">
                No records observed in table sample.
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-black/40">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase sticky top-0 border-b border-slate-800">
                      <tr>
                        {Object.keys(records[0] || {}).map((k) => (
                          <th key={k} className="py-2 px-3 whitespace-nowrap">
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {records.map((rec, i) => (
                        <tr key={i} className="hover:bg-slate-900/40">
                          {Object.values(rec).map((v, j) => (
                            <td key={j} className="py-2 px-3 whitespace-nowrap text-slate-300">
                              {v === null || v === undefined ? (
                                <span className="text-slate-600">null</span>
                              ) : (
                                String(v)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
