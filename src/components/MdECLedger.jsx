import React from 'react';
import { Database, Shield, Clock, Hash } from 'lucide-react';

const MdECLedger = ({ entries }) => {
  return (
    <div className="flex flex-col h-full bg-slate-950/50 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Database className="text-cyan-400" />
            MdEC <span className="text-cyan-400">Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Immutable Chain-of-Custody // SDEC Network</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">Block Height</div>
            <div className="text-sm font-mono text-cyan-400">#42,069</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">Sync Status</div>
            <div className="text-sm font-mono text-green-500">HOMEOSTASIS</div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-500 tracking-tighter">
              <th className="pb-4 font-bold"><Clock size={12} className="inline mr-2" /> Timestamp</th>
              <th className="pb-4 font-bold"><Target size={12} className="inline mr-2" /> Object ID</th>
              <th className="pb-4 font-bold"><Hash size={12} className="inline mr-2" /> M-ID Serial</th>
              <th className="pb-4 font-bold"><Shield size={12} className="inline mr-2" /> Verification</th>
            </tr>
          </thead>
          <tbody className="text-sm font-mono">
            {entries.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-20 text-center text-slate-600 uppercase tracking-widest text-xs">
                  No Verified Transfers in Current Epoch
                </td>
              </tr>
            ) : (
              entries.map((entry, i) => (
                <tr key={i} className="border-b border-slate-900/50 hover:bg-white/5 transition-colors">
                  <td className="py-4 text-slate-400">{entry.timestamp}</td>
                  <td className="py-4 text-white">{entry.objectId}</td>
                  <td className="py-4 text-cyan-400">{entry.mid}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-[10px] uppercase font-bold">
                      Verified
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Supporting Icons (Lucide replacement if needed)
import { Target } from 'lucide-react';

export default MdECLedger;
