import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, Network, Zap, Layers, Flame, Activity, 
  Server, ShieldAlert, Database, Lock, RefreshCw, AlertCircle
} from 'lucide-react';
import { api } from './services/api';

import { OverviewPage } from './pages/OverviewPage';
import { ThreatsPage } from './pages/ThreatsPage';
import { CartographyPage } from './pages/CartographyPage';
import { PathwaysPage } from './pages/PathwaysPage';
import { BlastRadiusPage } from './pages/BlastRadiusPage';
import { MedicalDevicesPage } from './pages/MedicalDevicesPage';
import { HealthITPage } from './pages/HealthITPage';
import { RiskIntelligencePage } from './pages/RiskIntelligencePage';
import { EvidencePage } from './pages/EvidencePage';
import { ResponsePage } from './pages/ResponsePage';

export const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [targetAssetForResponse, setTargetAssetForResponse] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Core Data States
  const [overview, setOverview] = useState(null);
  const [threats, setThreats] = useState([]);
  const [assets, setAssets] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [exposures, setExposures] = useState([]);
  const [devices, setDevices] = useState(null);
  const [healthIt, setHealthIt] = useState(null);
  const [risk, setRisk] = useState(null);
  const [datasets, setDatasets] = useState(null);
  const [cyberOverview, setCyberOverview] = useState(null);
  const [cyberDevices, setCyberDevices] = useState(null);
  const [cyberInventory, setCyberInventory] = useState(null);

  const loadPlatformData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        overviewRes,
        threatsRes,
        assetsRes,
        pathwaysRes,
        exposureRes,
        devicesRes,
        healthItRes,
        riskRes,
        datasetsRes,
        cyberOverviewRes,
        cyberDevicesRes,
        cyberInventoryRes
      ] = await Promise.all([
        api.getOverview(),
        api.getThreats(),
        api.getAssets(),
        api.getPathways(),
        api.getExposure(),
        api.getDevices(),
        api.getHealthIT(),
        api.getRisk(),
        api.getDatasets(),
        api.getCyberOverview(),
        api.getCyberDevices(),
        api.getCyberInventory()
      ]);

      setOverview(overviewRes.data);
      setThreats(threatsRes.data.threats || []);
      setAssets(assetsRes.data.assets || []);
      setPathways(pathwaysRes.data.pathways || []);
      setExposures(exposureRes.data.pathway_exposures || []);
      setDevices(devicesRes.data);
      setHealthIt(healthItRes.data);
      setRisk(riskRes.data);
      setDatasets(datasetsRes.data);
      setCyberOverview(cyberOverviewRes.data);
      setCyberDevices(cyberDevicesRes.data);
      setCyberInventory(cyberInventoryRes.data);
    } catch (err) {
      console.error('Failed to load CAREGUARD platform telemetry:', err);
      setError('Unable to synchronize with CAREGUARD backend service. Ensure FastAPI server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  const handleNavigateToResponse = (assetId) => {
    setTargetAssetForResponse(assetId);
    setActiveTab('response');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: HeartPulse },
    { id: 'cartography', label: 'Cartography', icon: Network },
    { id: 'threats', label: 'Threats', icon: Zap },
    { id: 'pathways', label: 'Care Pathways', icon: Layers },
    { id: 'blast_radius', label: 'Blast Radius', icon: Flame },
    { id: 'devices', label: 'Medical Devices', icon: Activity },
    { id: 'health_it', label: 'Health-IT & FHIR', icon: Server },
    { id: 'risk', label: 'Risk Intelligence', icon: ShieldAlert },
    { id: 'evidence', label: 'Evidence & Lineage', icon: Database },
    { id: 'response', label: 'Response', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-[#070C18] text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white font-sans">
      
      {/* Sovereign Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#070C18]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-inner">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white font-mono">
                  CAREGUARD
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  HEALTHCARE SECURITY INTELLIGENCE
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                NIST SP 800-207 Zero-Trust Digital Twin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadPlatformData}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all cursor-pointer"
              title="Resync Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="max-w-7xl mx-auto mt-3 overflow-x-auto">
          <nav className="flex items-center gap-1.5 pb-1">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                      : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'overview' && (
          <OverviewPage
            overview={overview}
            risk={risk}
            threats={threats}
            exposures={exposures}
            cyberOverview={cyberOverview}
            onNavigate={(tab) => setActiveTab(tab)}
            onRefresh={loadPlatformData}
          />
        )}

        {activeTab === 'cartography' && (
          <CartographyPage
            assets={assets}
            pathways={pathways}
            threats={threats}
            onSelectAsset={(aid) => handleNavigateToResponse(aid)}
          />
        )}

        {activeTab === 'threats' && (
          <ThreatsPage
            threats={threats}
            onNavigateToAsset={(aid) => {
              setActiveTab('cartography');
            }}
            onNavigateToResponse={handleNavigateToResponse}
          />
        )}

        {activeTab === 'pathways' && (
          <PathwaysPage
            pathways={pathways}
            exposures={exposures}
          />
        )}

        {activeTab === 'blast_radius' && (
          <BlastRadiusPage
            assets={assets}
            onNavigateToResponse={handleNavigateToResponse}
          />
        )}

        {activeTab === 'devices' && (
          <MedicalDevicesPage
            devices={devices}
            cyberDevices={cyberDevices}
          />
        )}

        {activeTab === 'health_it' && (
          <HealthITPage
            healthIt={healthIt}
          />
        )}

        {activeTab === 'risk' && (
          <RiskIntelligencePage
            risk={risk}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidencePage
            datasets={datasets}
            cyberInventory={cyberInventory}
            cyberOverview={cyberOverview}
          />
        )}

        {activeTab === 'response' && (
          <ResponsePage
            targetAssetId={targetAssetForResponse}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-[11px] font-mono text-slate-500">
        CAREGUARD &bull; Healthcare Cybersecurity Research Platform &bull; Zero Synthetic Data Policy &bull; MIMIC-IV, eICU &amp; ONC Grounding
      </footer>

    </div>
  );
};

export default App;

