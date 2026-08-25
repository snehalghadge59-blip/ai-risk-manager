import React, { useState, useMemo } from 'react';
import type { EvaluationResult, SyntheticSample } from '../types/risk';
import { evaluateModel } from '../services/mlEngine';
import { 
  Sliders, 
  Target, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  BarChart,
  Layers,
  Search,
  Check,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart as ReBarChart, 
  Bar, 
  Cell
} from 'recharts';

interface TestSetMetricsProps {
  dataset: SyntheticSample[];
}

export const TestSetMetrics: React.FC<TestSetMetricsProps> = ({ dataset }) => {
  const [threshold, setThreshold] = useState<number>(0.65);
  const [costPerFP, setCostPerFP] = useState<number>(250);
  const [sampleFilter, setSampleFilter] = useState<'ALL' | 'TP' | 'FP' | 'FN' | 'TN'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Evaluate model on held-out dataset whenever threshold or FP cost changes
  const evalResult: EvaluationResult = useMemo(() => {
    return evaluateModel(dataset, threshold, costPerFP);
  }, [dataset, threshold, costPerFP]);

  // Filter dataset for the sample explorer table
  const filteredSamples = useMemo(() => {
    return dataset.filter(sample => {
      const isPredicted = sample.predictedProbability >= threshold;
      const isActual = sample.groundTruthFraud;

      let categoryMatch = true;
      if (sampleFilter === 'TP') categoryMatch = isPredicted && isActual;
      if (sampleFilter === 'FP') categoryMatch = isPredicted && !isActual;
      if (sampleFilter === 'FN') categoryMatch = !isPredicted && isActual;
      if (sampleFilter === 'TN') categoryMatch = !isPredicted && !isActual;

      const searchMatch = searchTerm === '' || 
        sample.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.itemCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sample.lossCategory.toLowerCase().includes(searchTerm.toLowerCase());

      return categoryMatch && searchMatch;
    }).slice(0, 50); // limit to top 50 for fast rendering
  }, [dataset, threshold, sampleFilter, searchTerm]);

  const financialsData = [
    { name: 'Prevented Fraud', amount: evalResult.financials.preventedLoss / 100000, fill: '#10b981' },
    { name: 'False Alarm Cost', amount: evalResult.financials.falsePositiveCost / 100000, fill: '#f59e0b' },
    { name: 'Missed Loss', amount: evalResult.financials.missedFraudLoss / 100000, fill: '#ef4444' },
    { name: 'Net Savings', amount: evalResult.financials.netSavings / 100000, fill: '#6366f1' },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <BarChart className="w-4 h-4" />
              <span>Held-Out Test Set Validation • 10,000 Verified Samples</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Model Performance & Financial Cost Matrix
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Strictly defense-only validation on standard held-out data. Tune the decision threshold to maximize merchant net revenue while minimizing customer friction costs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setThreshold(0.35)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                threshold === 0.35 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              🎯 Max Recall (0.35)
            </button>
            <button
              onClick={() => setThreshold(0.50)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                threshold === 0.50 
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              ⚖️ Balanced (0.50)
            </button>
            <button
              onClick={() => setThreshold(0.65)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                threshold === 0.65 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              💰 Profit-Max (0.65)
            </button>
            <button
              onClick={() => setThreshold(0.80)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                threshold === 0.80 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              🛡️ High Precision (0.80)
            </button>
          </div>
        </div>
      </div>

      {/* Threshold & Cost Controls Lab */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Decision Threshold (Cutoff):
            </label>
            <span className="font-mono font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800 px-2.5 py-0.5 rounded text-sm">
              {threshold.toFixed(2)}
            </span>
          </div>
          <input 
            type="range" 
            min="0.10" 
            max="0.90" 
            step="0.01" 
            value={threshold} 
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
            <span>0.10 (High Sensitivity / Catch All)</span>
            <span>0.50 (Standard)</span>
            <span>0.90 (High Precision / Low Friction)</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              False-Positive Cost Penalty (per false alarm):
            </label>
            <span className="font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-0.5 rounded text-sm">
              ₹{costPerFP}
            </span>
          </div>
          <input 
            type="range" 
            min="50" 
            max="1000" 
            step="25" 
            value={costPerFP} 
            onChange={(e) => setCostPerFP(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
            <span>₹50 (Low Friction Cost)</span>
            <span>₹250 (Support & Verif Overhead)</span>
            <span>₹1,000 (High Friction Penalty)</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Precision */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>PRECISION</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {(evalResult.precision * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Flagged cases that are true fraud
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${evalResult.precision * 100}%` }}></div>
          </div>
        </div>

        {/* Recall */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>RECALL</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {(evalResult.recall * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total actual fraud captured
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${evalResult.recall * 100}%` }}></div>
          </div>
        </div>

        {/* F1-Score */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>F1-SCORE</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {(evalResult.f1Score * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Harmonic mean of P & R
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-400 h-full rounded-full" style={{ width: `${evalResult.f1Score * 100}%` }}></div>
          </div>
        </div>

        {/* ROC-AUC */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>ROC - AUC</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {evalResult.rocAuc.toFixed(3)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Discriminative power
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-400 h-full rounded-full" style={{ width: `${evalResult.rocAuc * 100}%` }}></div>
          </div>
        </div>

        {/* Net Savings */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden col-span-1 sm:col-span-2">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold mb-2">
            <span>NET RUPEE SAVINGS</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
              ROI: {evalResult.financials.roiRatio}x
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            ₹{(evalResult.financials.netSavings / 100000).toFixed(2)} <span className="text-lg text-emerald-300/80 font-normal">Lakhs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Prevented Loss (₹{(evalResult.financials.preventedLoss / 100000).toFixed(2)}L) - False Alarms (₹{(evalResult.financials.falsePositiveCost / 100000).toFixed(2)}L)
          </p>
        </div>

      </div>

      {/* Visual Analytics Grid: ROC Curve & Financial Breakdown & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ROC Curve Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>ROC Curve (TPR vs FPR)</span>
              <span className="text-xs text-indigo-400 font-mono">AUC = {evalResult.rocAuc.toFixed(3)}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              True Positive Rate vs False Positive Rate across decision thresholds.
            </p>
          </div>
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evalResult.rocCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="fpr" stroke="#94a3b8" label={{ value: 'FPR (False Pos Rate)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
                <YAxis stroke="#94a3b8" label={{ value: 'TPR (Recall)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(val: any) => [val, 'Rate']}
                />
                <Line type="monotone" dataKey="tpr" stroke="#6366f1" strokeWidth={3} dot={{ r: 3, fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Loss Matrix Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Financial Impact Matrix (₹ Lakhs)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Net financial outcomes comparing prevented loss vs false positive friction.
            </p>
          </div>
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={financialsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(val: any) => [`₹${val.toFixed(2)} Lakhs`, 'Value']}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {financialsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2x2 Confusion Matrix */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span>Confusion Matrix</span>
              <span className="text-xs text-slate-400 font-mono">Total = {evalResult.totalSamples.toLocaleString()}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Held-out dataset breakdown at threshold <span className="text-indigo-400 font-mono font-bold">{threshold.toFixed(2)}</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            
            {/* True Positives */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
                <span>TRUE POSITIVE (TP)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-white font-mono">
                  {evalResult.confusionMatrix.truePositives.toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-300/80 font-medium">
                  Fraud Prevented
                </div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-emerald-900/60 pt-1 font-mono">
                Saved: ₹{(evalResult.financials.preventedLoss / 100000).toFixed(2)}L
              </div>
            </div>

            {/* False Positives */}
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
                <span>FALSE POSITIVE (FP)</span>
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-white font-mono">
                  {evalResult.confusionMatrix.falsePositives.toLocaleString()}
                </div>
                <div className="text-[11px] text-amber-300/80 font-medium">
                  False Alarms / Friction
                </div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-amber-900/60 pt-1 font-mono">
                Cost: ₹{(evalResult.financials.falsePositiveCost / 100000).toFixed(2)}L
              </div>
            </div>

            {/* False Negatives */}
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-400 text-xs font-semibold">
                <span>FALSE NEGATIVE (FN)</span>
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-white font-mono">
                  {evalResult.confusionMatrix.falseNegatives.toLocaleString()}
                </div>
                <div className="text-[11px] text-rose-300/80 font-medium">
                  Missed Fraud Losses
                </div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-rose-900/60 pt-1 font-mono">
                Loss: ₹{(evalResult.financials.missedFraudLoss / 100000).toFixed(2)}L
              </div>
            </div>

            {/* True Negatives */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>TRUE NEGATIVE (TN)</span>
                <Check className="w-4 h-4 text-slate-400" />
              </div>
              <div className="my-2">
                <div className="text-2xl font-black text-white font-mono">
                  {evalResult.confusionMatrix.trueNegatives.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Legitimate Approved
                </div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-700/60 pt-1 font-mono">
                Clean Orders
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Held-Out Sample Explorer Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-400" />
              Held-Out Test Sample Explorer
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect individual sample rows from the 10,000 synthetic test dataset evaluated at threshold <span className="font-mono font-bold text-indigo-400">{threshold.toFixed(2)}</span>.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
              <input
                type="text"
                placeholder="Search Order, City..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none w-32 sm:w-44 placeholder-slate-500"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setSampleFilter('ALL')}
                className={`px-2.5 py-1 rounded font-medium ${sampleFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setSampleFilter('TP')}
                className={`px-2.5 py-1 rounded font-medium ${sampleFilter === 'TP' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                TP (Fraud Prevented)
              </button>
              <button
                onClick={() => setSampleFilter('FP')}
                className={`px-2.5 py-1 rounded font-medium ${sampleFilter === 'FP' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                FP (False Alarm)
              </button>
              <button
                onClick={() => setSampleFilter('FN')}
                className={`px-2.5 py-1 rounded font-medium ${sampleFilter === 'FN' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                FN (Missed Loss)
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">City / Tier</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Model Score</th>
                <th className="py-3 px-4">Ground Truth</th>
                <th className="py-3 px-4">Loss Category</th>
                <th className="py-3 px-4">Evaluation Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredSamples.map((sample) => {
                const isPredicted = sample.predictedProbability >= threshold;
                const isActual = sample.groundTruthFraud;

                let badge = <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">TN</span>;
                if (isPredicted && isActual) {
                  badge = <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">TP (Caught Fraud)</span>;
                } else if (isPredicted && !isActual) {
                  badge = <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">FP (False Alarm)</span>;
                } else if (!isPredicted && isActual) {
                  badge = <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-bold">FN (Missed Fraud)</span>;
                }

                return (
                  <tr key={sample.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{sample.orderId}</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">{sample.itemCategory}</td>
                    <td className="py-3 px-4 font-sans">
                      {sample.city} <span className="text-[10px] text-slate-500">({sample.tierCity})</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">₹{sample.orderValue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${sample.predictedProbability >= threshold ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {(sample.predictedProbability * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {sample.groundTruthFraud ? (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> FRAUD
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> CLEAN
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400">
                      {sample.lossCategory.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 font-sans">{badge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-right text-xs text-slate-500">
          Showing top {filteredSamples.length} matching rows of {dataset.length.toLocaleString()} total test dataset records.
        </div>
      </div>

    </div>
  );
};
