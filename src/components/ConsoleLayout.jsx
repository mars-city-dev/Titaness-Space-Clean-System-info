import React, { useState } from 'react';
import { Shield, Radio, Database, Activity, Lock, Unlock, Cpu, Globe } from 'lucide-react';
import { generateMID } from '../utils/mdec';

export const Header = () => (
  <header className="console-header glass">
    <div className="flex items-center gap-4">
      <div className="brand-font text-2xl font-bold flex items-center gap-2">
        <Shield className="text-cyan-primary" size={28} />
        <span>Titaness <span className="text-cyan-primary">SCN</span></span>
      </div>
      <div className="h-6 w-[1px] bg-white/10 mx-4" />
      <div className="text-sm opacity-60 brand-font">SDEC-NET-ROADMAP-01 // CONSORTIUM CONSOLE</div>
    </div>
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-end">
        <span className="text-[10px] opacity-40 brand-font">SYSTEM STATUS</span>
        <span className="text-cyan-primary text-xs brand-font">NOMINAL // 72 BPM</span>
      </div>
      <div className="w-10 h-10 rounded-full border border-cyan-primary/30 flex items-center justify-center pulse-cyan">
        <div className="w-2 h-2 rounded-full bg-cyan-primary" />
      </div>
    </div>
  </header>
);

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'grid', icon: Globe, label: 'Junk Grid' },
    { id: 'telemetry', icon: Radio, label: 'Telemetry' },
    { id: 'blockchain', icon: Database, label: 'MdEC Ledger' },
    { id: 'gnc', icon: Cpu, label: 'GNC Brain' },
  ];

  return (
    <aside className="console-sidebar glass border-r">
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 p-3 rounded transition-all brand-font text-sm ${
              activeTab === item.id 
                ? 'bg-cyan-primary/10 text-cyan-primary border-l-2 border-cyan-primary' 
                : 'hover:bg-white/5 text-secondary'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="mt-auto p-4 glass-amber rounded border-amber-500/20">
        <div className="text-[10px] text-amber-primary mb-2 flex items-center gap-2">
          <Activity size={12} />
          REMEDIATION QUEUE
        </div>
        <div className="text-xs opacity-60">12 Pending Verifications</div>
      </div>
    </aside>
  );
};

export const StatusBar = () => {
  const [locked, setLocked] = useState(true);

  return (
    <div className="console-status glass border-l">
      <h3 className="brand-font text-xs opacity-60 mb-2">Tactical Overlay</h3>
      
      <div className="space-y-4">
        <div className="p-3 bg-white/5 rounded border border-white/10">
          <div className="text-[10px] opacity-50 mb-1">SELECTED DEBRIS</div>
          <div className="text-cyan-primary text-sm font-mono truncate">COSMOS 2251-DEB</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
            <div>ALT: 780KM</div>
            <div>VEL: 7.5KM/S</div>
          </div>
        </div>

        <div className="p-3 bg-white/5 rounded border border-white/10">
          <div className="text-[10px] opacity-50 mb-1">M-ID STATUS</div>
          <div className="text-amber-primary text-xs font-mono">UNASSIGNED</div>
          <button 
            className="mt-3 w-full py-2 bg-amber-primary/20 hover:bg-amber-primary/30 text-amber-primary text-[10px] brand-font rounded transition-colors"
            onClick={() => alert(`Generated: ${generateMID()}`)}
          >
            MINT MdEC TOKEN
          </button>
        </div>
      </div>

      <div className="mt-auto">
        <div className="text-[10px] opacity-60 mb-2 text-center">KINETIC DOCKING AUTH</div>
        <div 
          className="relative h-12 rounded-full overflow-hidden flex items-center px-1"
          style={{ background: locked ? 'var(--amber-glow)' : 'var(--cyan-glow)', border: `1px solid ${locked ? 'var(--amber-primary)' : 'var(--cyan-primary)'}` }}
        >
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 ${locked ? 'translate-x-0 bg-amber-primary' : 'translate-x-[280px] bg-cyan-primary'}`}
            onClick={() => setLocked(!locked)}
          >
            {locked ? <Lock size={16} color="black" /> : <Unlock size={16} color="black" />}
          </div>
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] brand-font font-bold ${locked ? 'text-amber-primary' : 'text-cyan-primary'}`}>
            {locked ? 'SLIDE TO AUTHORIZE' : 'DOCKING AUTHORIZED'}
          </div>
        </div>
      </div>
    </div>
  );
};
