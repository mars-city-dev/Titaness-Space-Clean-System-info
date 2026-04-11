import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Target, 
  Activity, 
  Lock, 
  Unlock, 
  Zap, 
  Globe, 
  Database,
  Eye,
  Crosshair,
  Layout
} from 'lucide-react';
import JunkGrid from './components/JunkGrid';
import PoseEngine from './components/PoseEngine';
import MdECLedger from './components/MdECLedger';
import SpaceCleanNetwork from './components/SpaceCleanNetwork';

import { fetchDebrisData } from './utils/tle';
import { generateMID } from './utils/mdec';

// --- Components ---

const StatusCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-md shadow-lg">
    <div className="flex items-center gap-3 mb-2 text-slate-400">
      <Icon size={16} />
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </div>
    <div className={`text-2xl font-mono ${color}`}>{value}</div>
  </div>
);

const DebrisItem = ({ item, isSelected, onClick }) => (
  <div 
    onClick={() => onClick(item)}
    className={`p-3 cursor-pointer transition-all border-l-4 mb-2 flex justify-between items-center ${
      isSelected 
        ? 'bg-cyan-500/10 border-cyan-400' 
        : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
    }`}
  >
    <div>
      <div className="text-sm font-mono text-slate-100">{item.id}</div>
      <div className="text-[10px] text-slate-500 uppercase">{item.type} | {item.orbit}</div>
    </div>
    <div className={`text-xs font-bold ${item.risk === 'High' ? 'text-amber-400' : 'text-slate-400'}`}>
      {item.risk} Risk
    </div>
  </div>
);

const App = () => {
  const [view, setView] = useState('console'); // 'console' or 'ledger'
  const [selectedDebris, setSelectedDebris] = useState(null);
  const [junkGrid, setJunkGrid] = useState([]);
  const [status, setStatus] = useState('AMBER'); // AMBER or CYAN
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState(['[SYSTEM] Space Clean Network Initialized.', '[MdEC] Syncing with Blockchain...']);
  const [time, setTime] = useState(new Date().toISOString());
  const [telemetry, setTelemetry] = useState({ propellant: '84.2%', syncError: '0.002 rad/s' });
  const [ledgerEntries, setLedgerEntries] = useState([]);

  // Fetch Live TLE Data
  useEffect(() => {
    const initData = async () => {
      setLog(prev => [`[SYSTEM] Fetching live TLE data from CelesTrak...`, ...prev]);
      const data = await fetchDebrisData('active', 30);
      const mappedData = data.map(d => ({
        id: d.name,
        type: 'Satellite',
        orbit: 'LEO',
        risk: Math.random() > 0.7 ? 'High' : 'Medium',
        status: 'Untracked',
        tle1: d.line1,
        tle2: d.line2
      }));
      setJunkGrid(mappedData);
      setLoading(false);
      setLog(prev => [`[SYSTEM] Found ${mappedData.length} active orbital targets.`, ...prev]);
    };
    initData();
  }, []);

  // WebSocket Telemetry Connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTelemetry({
        propellant: `${data.propellant}%`,
        syncError: `${data.syncError} rad/s`
      });
      setTime(data.utc);
    };

    ws.onerror = () => {
      // Fallback if server is not running
      const timer = setInterval(() => setTime(new Date().toISOString()), 1000);
      return () => clearInterval(timer);
    };

    return () => ws.close();
  }, []);

  const handleAcquire = () => {
    if (!selectedDebris) return;
    setStatus('CYAN');
    setLog(prev => [`[GNC] ACQUIRE COMMAND RECEIVED for ${selectedDebris.id}`, ...prev]);
    
    const newMID = generateMID();
    setTimeout(() => {
      setLog(prev => [`[MdEC] M-ID Generation Successful: ${newMID}`, ...prev]);
      setLedgerEntries(prev => [{
        timestamp: new Date().toISOString().split('T')[1].split('.')[0],
        objectId: selectedDebris.id,
        mid: newMID
      }, ...prev]);
    }, 2000);
  };

  const resetStatus = () => {
    setStatus('AMBER');
    setLog(prev => ['[SYSTEM] Operational Status Reset to AMBER.', ...prev]);
  };

  return (
    <div className="min-h-screen bg-black text-slate-300 font-sans selection:bg-cyan-500/30">
      {/* --- Top Nav --- */}
      <nav className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center text-black font-black">T</div>
          <div className="font-bold tracking-tighter text-xl text-white">TITANESS <span className="text-cyan-400 font-light">CONSOLE</span></div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setView('console')}
            className={`px-4 py-1 text-[10px] brand-font uppercase tracking-widest rounded border transition-all ${view === 'console' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' : 'border-slate-800 hover:border-slate-600'}`}
          >
            Console View
          </button>
          <button 
            onClick={() => setView('ledger')}
            className={`px-4 py-1 text-[10px] brand-font uppercase tracking-widest rounded border transition-all ${view === 'ledger' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' : 'border-slate-800 hover:border-slate-600'}`}
          >
            MdEC Ledger
          </button>
          <button 
            onClick={() => setView('scn')}
            className={`px-4 py-1 text-[10px] brand-font uppercase tracking-widest rounded border transition-all ${view === 'scn' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' : 'border-slate-800 hover:border-slate-600'}`}
          >
            Space Clean Network
          </button>
        </div>

        <div className="flex items-center gap-8 font-mono text-[10px] tracking-widest text-slate-500 uppercase">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'CYAN' ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-amber-400 animate-pulse'}`}></div>
            {status} OPERATIONAL
          </div>
          <div>LOCATION: MARS CITY LABS // CAMARILLO, CA</div>
          <div>UTC: {time.split('T')[1]?.split('.')[0]}</div>
        </div>
      </nav>

      {view === 'scn' ? (
        <SpaceCleanNetwork onBack={() => setView('console')} />
      ) : (
        <div className="p-6 h-[calc(100vh-64px)] overflow-hidden">
          
          {view === 'ledger' ? (
            <MdECLedger entries={ledgerEntries} />
          ) : (
            <div className="grid grid-cols-12 gap-6 h-full">
              {/* --- Left Column: Junk Grid --- */}
              <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Database size={14} /> Global Junk Grid
                </h2>
                <div className="text-[10px] text-cyan-400">{junkGrid.length} Targets</div>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="h-40 flex items-center justify-center text-xs opacity-20 uppercase tracking-[0.3em]">Synching...</div>
                ) : junkGrid.map(item => (
                  <DebrisItem 
                    key={item.id} 
                    item={item} 
                    isSelected={selectedDebris?.id === item.id}
                    onClick={setSelectedDebris}
                  />
                ))}
              </div>
            </div>

            {/* --- Center: 3D Visualization / Simulation --- */}
            <div className="col-span-6 bg-slate-900/30 rounded-2xl border border-slate-800/50 relative overflow-hidden group">
              {/* Conditional 3D Render: Global Grid vs Pose Estimation */}
              <div className="absolute inset-0">
                {status === 'CYAN' && selectedDebris ? (
                  <PoseEngine targetId={selectedDebris.id} status={status} />
                ) : (
                  <JunkGrid selectedDebris={selectedDebris} />
                )}
              </div>

              <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between items-start">
                  <div className="pointer-events-auto">
                    <h1 className="text-4xl font-light text-white leading-tight">
                      {selectedDebris ? selectedDebris.id : "AWAITING TARGET"}
                    </h1>
                    <p className="text-cyan-400 font-mono text-sm tracking-widest mt-2">
                      {selectedDebris ? `ORBIT: ${selectedDebris.orbit} / TYPE: ${selectedDebris.type}` : "SELECT OBJECT FROM GRID"}
                    </p>
                  </div>
                  {selectedDebris && (
                    <div className="bg-black/50 border border-cyan-500/30 p-4 rounded-xl backdrop-blur-md pointer-events-auto">
                       <div className="text-[10px] uppercase text-slate-500 mb-2">Pose Confidence</div>
                       <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
                         <div className="w-3/4 h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
                       </div>
                    </div>
                  )}
                </div>

                {/* Viewport Reticle (only shows if not in Pose mode) */}
                {status !== 'CYAN' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <Crosshair size={100} strokeWidth={0.5} className="text-cyan-500/20" />
                    <div className="absolute w-[400px] h-[400px] border border-cyan-500/10 rounded-full animate-pulse"></div>
                  </div>
                )}

                {/* Bottom Controls */}
                <div className="flex justify-center gap-6 items-end pointer-events-auto">
                  <button 
                    onClick={status === 'AMBER' ? handleAcquire : resetStatus}
                    disabled={!selectedDebris}
                    className={`group relative flex flex-col items-center gap-4 py-6 px-12 rounded-2xl transition-all duration-500 border overflow-hidden ${
                      !selectedDebris ? 'opacity-30 grayscale cursor-not-allowed' :
                      status === 'CYAN' 
                        ? 'bg-cyan-500 text-black border-cyan-400 px-16' 
                        : 'bg-transparent text-amber-500 border-amber-500 hover:bg-amber-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {status === 'CYAN' ? <Unlock size={24} /> : <Lock size={24} />}
                      <span className="text-xl font-bold tracking-[0.2em] uppercase">
                        {status === 'CYAN' ? 'Release Control' : 'Acquire Target'}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono tracking-widest uppercase opacity-60">
                      {status === 'CYAN' ? 'SDEC CONSENSUS ACTIVE' : 'AWAITING HUMAN AUTHORIZATION'}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* --- Right Column: Telemetry & Logs --- */}
            <div className="col-span-3 flex flex-col gap-6 overflow-hidden">
              <div className="grid grid-cols-1 gap-4">
                <StatusCard label="Propellant" value={telemetry.propellant} color="text-cyan-400" icon={Zap} />
                <StatusCard label="Sync Error" value={telemetry.syncError} color="text-slate-100" icon={Activity} />
                <StatusCard label="Fleet Status" value="4 VESTA | 1 TCU" color="text-slate-100" icon={Target} />
              </div>

              <div className="flex-1 bg-black/50 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
                <div className="p-3 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Activity size={12} /> System Telemetry
                </div>
                <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed custom-scrollbar text-[10px]">
                  {log.map((line, i) => (
                    <div key={i} className={`mb-1 ${line.includes('[SYSTEM]') ? 'text-slate-500' : line.includes('[GNC]') ? 'text-cyan-400' : 'text-slate-300'}`}>
                      <span className="opacity-30 mr-2">{time.split('T')[1]?.split('.')[0]}</span> {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default App;
