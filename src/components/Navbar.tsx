import React from 'react';
import { ShieldCheck, BarChart3, RotateCcw, FileText, Network, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'test-set' | 'return-scorer' | 'chargeback' | 'abuse-ring';
  setActiveTab: (tab: 'test-set' | 'return-scorer' | 'chargeback' | 'abuse-ring') => void;
  totalSamples: number;
  netSavings: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalSamples,
  netSavings
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('test-set')}>
            <div className="bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  SentinelRisk <span className="text-emerald-400 font-extrabold">AI</span>
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Defense-Only
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Merchant Loss Defense Engine • Indian E-Commerce & BFSI
              </p>
            </div>
          </div>

          {/* Key Metric Ticker */}
          <div className="hidden lg:flex items-center space-x-6 bg-slate-950/60 border border-slate-800/80 px-4 py-1.5 rounded-xl">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs text-slate-400">Held-Out Test Set:</span>
              <span className="text-xs font-semibold text-slate-200">{totalSamples.toLocaleString()} Samples</span>
            </div>
            <div className="h-4 w-px bg-slate-800"></div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Net Rupee Protected:</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                ₹{(netSavings / 100000).toFixed(2)} Lakhs
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('test-set')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'test-set'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Test Set Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('return-scorer')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'return-scorer'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return-Risk Scorer</span>
            </button>

            <button
              onClick={() => setActiveTab('chargeback')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'chargeback'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Chargeback Auto-Responder</span>
            </button>

            <button
              onClick={() => setActiveTab('abuse-ring')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'abuse-ring'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Abuse-Ring Sentinel</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
