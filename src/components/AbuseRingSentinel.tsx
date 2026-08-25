import React, { useState } from 'react';
import { MOCK_ABUSE_RING } from '../services/mlEngine';
import type { AbuseRingNode } from '../types/risk';
import { 
  Network, 
  ShieldAlert, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';

export const AbuseRingSentinel: React.FC = () => {
  const { nodes, edges } = MOCK_ABUSE_RING;
  const [selectedNode, setSelectedNode] = useState<AbuseRingNode>(nodes[0]);
  const [isBlacklisted, setIsBlacklisted] = useState<boolean>(false);

  // Position nodes in a 2D radial layout
  const nodePositions = [
    { id: 'RING-ACC-1', x: 180, y: 120 },
    { id: 'RING-ACC-2', x: 180, y: 260 },
    { id: 'RING-ACC-3', x: 180, y: 400 },
    { id: 'RING-ACC-4', x: 180, y: 520 },
    { id: 'RING-DEV-1', x: 420, y: 190 },
    { id: 'RING-PH-1', x: 420, y: 350 },
    { id: 'RING-UPI-1', x: 650, y: 160 },
    { id: 'RING-ADDR-1', x: 650, y: 440 },
  ];

  const getNodePos = (id: string) => {
    return nodePositions.find(p => p.id === id) || { x: 300, y: 300 };
  };

  // Find connected edges for selected node
  const connectedEdges = edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);
  const connectedNodeIds = new Set([
    selectedNode.id,
    ...connectedEdges.map(e => e.source === selectedNode.id ? e.target : e.source)
  ]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Network className="w-4 h-4" />
              <span>Multi-Account Abuse-Ring Sentinel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Coordinated Fraud Graph & Ring Explorer
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Visualizes cross-account linkages sharing device fingerprints, UPI VPAs, phone numbers, and delivery addresses across Indian pin codes.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-rose-950/60 border border-rose-500/30 px-4 py-2 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <span className="text-[10px] text-rose-300 font-bold uppercase block">Active Ring Alert</span>
              <span className="text-xs font-mono font-bold text-white">Ring #IND-8812 • 4 Accounts Linked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace: Interactive Canvas Graph + Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Interactive SVG Network Graph (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Graph Neural Network Topology
              </span>
            </div>
            <div className="flex space-x-4 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Account</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Device</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> UPI VPA</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Address</span>
            </div>
          </div>

          <div className="w-full h-[550px] bg-slate-950 rounded-xl border border-slate-800/80 relative flex items-center justify-center overflow-hidden">
            <svg className="w-full h-full">
              
              {/* Draw Edges */}
              {edges.map((edge, idx) => {
                const sourcePos = getNodePos(edge.source);
                const targetPos = getNodePos(edge.target);
                const isHighlighted = connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target);

                return (
                  <g key={idx}>
                    <line
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke={isHighlighted ? '#6366f1' : '#334155'}
                      strokeWidth={isHighlighted ? 3 : 1.5}
                      strokeDasharray={edge.relationship === 'PAYS_WITH_VPA' ? '4 4' : 'none'}
                    />
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {nodes.map((node) => {
                const pos = getNodePos(node.id);
                const isSelected = selectedNode.id === node.id;
                const isConnected = connectedNodeIds.has(node.id);

                let fill = '#6366f1'; // USER - indigo
                if (node.type === 'DEVICE') fill = '#a855f7'; // purple
                if (node.type === 'PHONE') fill = '#3b82f6'; // blue
                if (node.type === 'UPI_VPA') fill = '#f59e0b'; // amber
                if (node.type === 'ADDRESS') fill = '#ef4444'; // rose

                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => {
                      setSelectedNode(node);
                      setIsBlacklisted(false);
                    }}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    {/* Outer glow ring if selected */}
                    {isSelected && (
                      <circle r={26} fill="none" stroke="#6366f1" strokeWidth={3} className="animate-pulse" />
                    )}

                    <circle 
                      r={18} 
                      fill={fill} 
                      opacity={isConnected ? 1 : 0.4} 
                      stroke="#0f172a" 
                      strokeWidth={3} 
                    />

                    {/* Risk Badge on Node */}
                    <text 
                      textAnchor="middle" 
                      dy="4" 
                      fill="#ffffff" 
                      fontSize="10" 
                      fontWeight="bold" 
                      fontFamily="monospace"
                    >
                      {node.riskScore}
                    </text>

                    {/* Node Text Label */}
                    <text 
                      textAnchor="middle" 
                      dy="34" 
                      fill={isSelected ? '#ffffff' : '#94a3b8'} 
                      fontSize="11" 
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}

            </svg>
          </div>
          <div className="mt-3 text-right text-[11px] text-slate-500">
            Click any node on the canvas to inspect entity details and relationship vectors.
          </div>
        </div>

        {/* Node Inspector & Blacklist Control Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="border-b border-slate-800 pb-4 mb-4">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono">
                {selectedNode.type} NODE DETAILED INSPECTOR
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">
                {selectedNode.label}
              </h3>
            </div>

            {/* Risk Gauge Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 mb-5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Entity Risk Score:</span>
                <span className="font-mono font-bold text-rose-400 text-base">{selectedNode.riskScore} / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${selectedNode.riskScore}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Threat Level: HIGH</span>
                <span>Flagged: YES</span>
              </div>
            </div>

            {/* Connected Graph Neighbors */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                Connected Network Edges ({connectedEdges.length}):
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {connectedEdges.map((edge, i) => {
                  const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                  const otherNode = nodes.find(n => n.id === otherId);
                  return (
                    <div key={i} className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{otherNode?.label}</span>
                      <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-950 px-2 py-0.5 rounded">
                        {edge.relationship.replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Blacklist Action Button */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <button
              onClick={() => setIsBlacklisted(true)}
              disabled={isBlacklisted}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg ${
                isBlacklisted
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              }`}
            >
              {isBlacklisted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-rose-400" />
                  <span>Abuse Ring Blacklisted Across System</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Blacklist Entire Abuse Ring</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              Enforces step-up Aadhaar OTP verification for all 4 accounts sharing this device/UPI entity.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
