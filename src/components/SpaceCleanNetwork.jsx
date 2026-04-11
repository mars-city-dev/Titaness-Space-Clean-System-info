import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Wifi,
  Radio,
  Navigation,
  Box,
  AlertTriangle,
  History,
  HardDrive
} from 'lucide-react';

// --- Sub-Components ---

const StatusCard = ({ label, value, color, icon: Icon, trend }) => (
  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl backdrop-blur-md shadow-lg transition-all hover:border-slate-700">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3 text-slate-500">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      {trend && <span className={`text-[9px] font-mono ${trend.startsWith('+') ? 'text-cyan-400' : 'text-rose-400'}`}>{trend}</span>}
    </div>
    <div className={`text-2xl font-mono ${color}`}>{value}</div>
  </div>
);

const DebrisItem = ({ item, isSelected, onClick }) => (
  <div 
    onClick={() => onClick(item)}
    className={`p-4 cursor-pointer transition-all border-l-2 mb-2 group ${
      isSelected 
        ? 'bg-cyan-500/10 border-cyan-400 shadow-[inset_4px_0_15px_-5px_rgba(34,211,238,0.3)]' 
        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-600'
    }`}
  >
    <div className="flex justify-between items-start mb-1">
      <div className={`text-xs font-mono tracking-tighter ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>{item.id}</div>
      <div className={`text-[9px] px-1.5 py-0.5 rounded border ${
        item.risk === 'High' ? 'border-amber-500/50 text-amber-500 bg-amber-500/5' : 'border-slate-700 text-slate-500'
      }`}>
        {item.risk} RISK
      </div>
    </div>
    <div className="text-[10px] text-slate-500 flex items-center gap-2 uppercase tracking-wide">
      <Box size={10} /> {item.type}
    </div>
    <div className="mt-2 flex items-center gap-4 text-[9px] font-mono text-slate-400">
      <span>ALT: {item.orbit}</span>
      <span>VEL: {item.velocity}km/s</span>
    </div>
  </div>
);

// --- The 3D Tactical Engine Component ---

const TacticalGrid = ({ selectedTarget, status }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      angle += 0.002;

      // Draw Orbital Shells
      ctx.strokeStyle = '#1e293b';
      ctx.setLineDash([5, 10]);
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, i * 70, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw Earth Core (Stylized)
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 50);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      // Draw Simulated Debris Particles
      const debrisCount = 40;
      for (let i = 0; i < debrisCount; i++) {
        const radius = 60 + (i * 8);
        const speed = 0.005 / (radius / 100);
        const currentAngle = angle * (i % 2 === 0 ? 1 : -1) + (i * 0.5);
        const x = centerX + Math.cos(currentAngle) * radius;
        const y = centerY + Math.sin(currentAngle) * radius;

        ctx.fillStyle = i % 15 === 0 ? '#fbbf24' : '#475569';
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Highlight Selected Target
        if (selectedTarget && i === 12) {
          ctx.strokeStyle = status === 'CYAN' ? '#22d3ee' : '#fbbf24';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.stroke();
          
          // Target Line to Center
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = status === 'CYAN' ? 'rgba(34,211,238,0.1)' : 'rgba(251,191,36,0.1)';
          ctx.stroke();
        }
      }

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [selectedTarget, status]);

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={800} 
      className="w-full h-full object-contain pointer-events-none opacity-60"
    />
  );
};

// --- Main Component ---

const SpaceCleanNetwork = ({ onBack }) => {
  const [selectedDebris, setSelectedDebris] = useState(null);
  const [status, setStatus] = useState('AMBER'); // AMBER or CYAN
  const [viewMode, setViewMode] = useState('GLOBAL'); // GLOBAL or TACTICAL
  const [log, setLog] = useState([
    '[SYSTEM] Space Clean Network Initialized.', 
    '[MdEC] Syncing with Orbital Blockchain...',
    '[OISL] Laser Link Established with TCU-Alpha.'
  ]);
  const [time, setTime] = useState(new Date().toISOString());

  // Expanded Data-Driven Debris Grid
  const junkGrid = useMemo(() => [
    { id: 'SDEC-24-LEO-A4F2', type: 'Titan IIIC Stage', orbit: '840km', velocity: '7.42', risk: 'High', inc: '28.5°', mass: '2400kg' },
    { id: 'SDEC-24-LEO-B9C1', type: 'Dead Comms Sat', orbit: '450km', velocity: '7.65', risk: 'Medium', inc: '51.6°', mass: '850kg' },
    { id: 'SDEC-24-LEO-X009', type: 'Fairing Fragment', orbit: '610km', velocity: '7.55', risk: 'Low', inc: '98.2°', mass: '120kg' },
    { id: 'SDEC-24-LEO-F552', type: 'NASA Toolbox (Legacy)', orbit: '400km', velocity: '7.71', risk: 'High', inc: '51.6°', mass: '12kg' },
    { id: 'SDEC-25-GEO-R772', type: 'Rocket Body', orbit: '35780km', velocity: '3.07', risk: 'Medium', inc: '0.1°', mass: '1800kg' },
    { id: 'SDEC-25-LEO-H112', type: 'De-funct CubeSat', orbit: '520km', velocity: '7.60', risk: 'Low', inc: '45.0°', mass: '4kg' },
  ], []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toISOString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAcquire = () => {
    if (!selectedDebris) return;
    setStatus('CYAN');
    setLog(prev => [`[GNC] ACQUIRE COMMAND RECEIVED for ${selectedDebris.id}`, `[SAFETY] CONSENSUS RELAY CLOSED.`, ...prev]);
    setTimeout(() => {
      setLog(prev => [`[MdEC] Forensic M-ID Mapped to blockchain.`, `[CAPTURE] Synchronization loop @ 0.001 rad/s.`, ...prev]);
    }, 1500);
  };

  const resetStatus = () => {
    setStatus('AMBER');
    setLog(prev => ['[SYSTEM] Operational Status Reset to AMBER.', '[SAFETY] Hardware Interlock Engaged.', ...prev]);
  };

  return (
    <div className="min-h-screen bg-black text-slate-300 font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* --- Top Nav --- */}
      <nav className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-cyan-500 rounded-sm flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(6,182,212,0.5)]">T</div>
            <div className="font-bold tracking-tighter text-xl text-white">TITANESS <span className="text-cyan-400 font-light italic">SCN</span></div>
          </button>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div className="flex gap-4">
            <button 
              onClick={() => setViewMode('GLOBAL')}
              className={`text-[10px] font-bold tracking-widest px-3 py-1 rounded transition-colors ${viewMode === 'GLOBAL' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >GLOBAL GRID</button>
            <button 
              onClick={() => setViewMode('TACTICAL')}
              className={`text-[10px] font-bold tracking-widest px-3 py-1 rounded transition-colors ${viewMode === 'TACTICAL' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >TACTICAL POV</button>
          </div>
        </div>
        
        <div className="flex items-center gap-8 font-mono text-[9px] tracking-widest text-slate-500 uppercase">
          <div className="flex items-center gap-2">
            <Radio size={12} className={status === 'CYAN' ? 'text-cyan-400' : 'text-amber-500'} />
            LINK_STRENGTH: <span className="text-slate-200">98.2%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'CYAN' ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-amber-400 animate-pulse'}`}></div>
            {status} MODE
          </div>
          <div className="text-slate-200">{time.split('T')[1].split('.')[0]} UTC</div>
        </div>
      </nav>

      <div className="p-6 grid grid-cols-12 gap-6 h-[calc(100vh-64px)]">
        
        {/* --- Left Column: Junk Grid Data --- */}
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <Database size={14} /> Tracking Registry
            </h2>
            <div className="text-[9px] font-mono text-cyan-500 bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/20">{junkGrid.length} ASSETS</div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
            {junkGrid.map(item => (
              <DebrisItem 
                key={item.id} 
                item={item} 
                isSelected={selectedDebris?.id === item.id}
                onClick={setSelectedDebris}
              />
            ))}
          </div>
          
          {/* Quick Filters */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-2">
            <button className="text-[9px] font-bold border border-slate-800 py-2 rounded hover:bg-slate-800 transition-colors uppercase tracking-widest text-slate-500">Filter: High Risk</button>
            <button className="text-[9px] font-bold border border-slate-800 py-2 rounded hover:bg-slate-800 transition-colors uppercase tracking-widest text-slate-500">Sort: Altitude</button>
          </div>
        </div>

        {/* --- Center: The 3D Junk Grid Visualization --- */}
        <div className="col-span-6 flex flex-col gap-6">
          <div className="flex-1 bg-slate-900/20 rounded-3xl border border-slate-800/40 relative overflow-hidden group shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
            
            {/* Tactical Canvas Component */}
            <div className="absolute inset-0 flex items-center justify-center">
              <TacticalGrid selectedTarget={selectedDebris} status={status} />
            </div>

            {/* UI Overlays */}
            <div className="absolute inset-0 p-10 flex flex-col justify-between pointer-events-none">
              <div className="flex justify-between items-start">
                <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                  <div className="flex items-center gap-3 mb-1">
                    <Navigation size={14} className="text-cyan-400" />
                    <span className="text-[10px] font-bold tracking-[0.3em] text-cyan-400/70">ORBITAL VECTORING</span>
                  </div>
                  <h1 className="text-5xl font-extralight text-white tracking-tighter leading-none">
                    {selectedDebris ? selectedDebris.id : "SCANNING_VOID"}
                  </h1>
                  {selectedDebris && (
                    <div className="flex gap-4 mt-4 font-mono text-[10px] text-slate-400">
                      <div className="flex flex-col">
                        <span className="text-slate-600 uppercase text-[8px] mb-1">Inclination</span>
                        <span className="text-white">{selectedDebris.inc}</span>
                      </div>
                      <div className="w-[1px] h-6 bg-slate-800 mt-2" />
                      <div className="flex flex-col">
                        <span className="text-slate-600 uppercase text-[8px] mb-1">Mass Class</span>
                        <span className="text-white">{selectedDebris.mass}</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedDebris && (
                  <div className="bg-black/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
                     <div className="flex items-center gap-3 mb-4">
                       <Eye size={14} className="text-cyan-400" />
                       <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Edge Pose Confidence</span>
                     </div>
                     <div className="flex items-end gap-1 h-8">
                       {[0.4, 0.6, 0.8, 0.9, 0.7, 0.85, 0.95].map((h, i) => (
                         <div key={i} className="w-1.5 bg-cyan-400/20 rounded-t-sm relative overflow-hidden">
                           <div className="absolute bottom-0 w-full bg-cyan-400" style={{ height: `${h * 100}%` }} />
                         </div>
                       ))}
                     </div>
                     <div className="mt-3 text-right font-mono text-xl text-cyan-400">95.4<span className="text-[10px] opacity-50 ml-1">%</span></div>
                  </div>
                )}
              </div>

              {/* Central Targeting Reticle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-64 h-64 border border-cyan-500/5 rounded-full flex items-center justify-center">
                  <div className="absolute inset-0 border border-cyan-500/10 rounded-full animate-ping [animation-duration:4s]"></div>
                  <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-cyan-500/40 tracking-widest">00.00°N</div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-cyan-500/40 tracking-widest">00.00°S</div>
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="flex justify-between items-end">
                <div className="bg-black/60 p-4 rounded-xl border border-slate-800/50 backdrop-blur-md">
                   <div className="flex items-center gap-2 mb-2">
                     <History size={12} className="text-slate-500" />
                     <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Historical TLE Drift</span>
                   </div>
                   <div className="text-[10px] font-mono text-rose-400">Δ -0.42km / Period</div>
                </div>

                <button 
                  onClick={status === 'AMBER' ? handleAcquire : resetStatus}
                  disabled={!selectedDebris}
                  className={`pointer-events-auto group relative flex flex-col items-center gap-3 py-6 px-16 rounded-2xl transition-all duration-500 border-2 overflow-hidden shadow-2xl ${
                    !selectedDebris ? 'opacity-20 grayscale cursor-not-allowed border-slate-800' :
                    status === 'CYAN' 
                      ? 'bg-cyan-500 text-black border-cyan-300 scale-105' 
                      : 'bg-transparent text-amber-500 border-amber-500/50 hover:border-amber-400 hover:bg-amber-400/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {status === 'CYAN' ? <Unlock size={24} strokeWidth={2.5} /> : <Lock size={24} strokeWidth={2.5} />}
                    <span className="text-2xl font-black tracking-[0.15em] uppercase">
                      {status === 'CYAN' ? 'Release Control' : 'Acquire Target'}
                    </span>
                  </div>
                  <div className="text-[9px] font-mono font-black tracking-[0.2em] uppercase opacity-70">
                    {status === 'CYAN' ? 'SDEC CONSENSUS VERIFIED' : 'SECURE HARDWARE INTERLOCK ACTIVE'}
                  </div>
                  {status === 'CYAN' && <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none"></div>}
                </button>

                <div className="bg-black/60 p-4 rounded-xl border border-slate-800/50 backdrop-blur-md text-right">
                   <div className="flex items-center gap-2 mb-2 justify-end">
                     <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Local Link</span>
                     <Wifi size={12} className="text-slate-500" />
                   </div>
                   <div className="text-[10px] font-mono text-cyan-400">EOS_MESH_STABLE</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Right Column: Telemetry & Chain of Custody --- */}
        <div className="col-span-3 flex flex-col gap-6 overflow-hidden">
          <div className="space-y-4">
            <StatusCard label="N2 Reserve" value="84.22%" color="text-cyan-400" icon={Zap} trend="+0.2% Regen" />
            <StatusCard label="Sync Variance" value="0.0012 rad" color="text-white" icon={Activity} trend="-4% Error" />
            <StatusCard label="Active Nodes" value="09" color="text-white" icon={Target} />
          </div>

          {/* Sub-Panel: Operational Log */}
          <div className="flex-1 bg-slate-900/20 border border-slate-800/50 rounded-2xl flex flex-col overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center justify-between">
              <div className="flex items-center gap-2"><Activity size={14} /> Mission Journal</div>
              <button className="text-cyan-400 hover:underline">Export</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 font-mono text-[10px] leading-relaxed custom-scrollbar bg-black/40">
              {log.map((line, i) => (
                <div key={i} className={`mb-3 pb-3 border-b border-slate-800/30 last:border-0 ${
                  line.includes('[SYSTEM]') ? 'text-slate-500' : 
                  line.includes('[GNC]') ? 'text-cyan-400' : 
                  line.includes('[CAPTURE]') ? 'text-cyan-200' : 'text-slate-300'
                }`}>
                  <div className="flex items-center justify-between opacity-30 mb-1">
                    <span>SDEC_LOG_{800 - i}</span>
                    <span>{time.split('T')[1].split('.')[0]}</span>
                  </div>
                  <div className="pl-2 border-l border-slate-700/50">{line}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Panel: Chain of Custody */}
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex items-center gap-4">
             <div className="p-2 bg-cyan-500 rounded text-black">
               <HardDrive size={18} />
             </div>
             <div>
               <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">MdEC Ledger</div>
               <div className="text-[9px] text-cyan-400/60 font-mono truncate w-40">0x4F2A...9B31_VERIFIED</div>
             </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
};

export default SpaceCleanNetwork;
