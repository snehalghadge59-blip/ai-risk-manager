import { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { TestSetMetrics } from './components/TestSetMetrics';
import { ReturnRiskScorer } from './components/ReturnRiskScorer';
import { ChargebackResponder } from './components/ChargebackResponder';
import { AbuseRingSentinel } from './components/AbuseRingSentinel';
import { generateTestSet, evaluateModel } from './services/mlEngine';
import { ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'test-set' | 'return-scorer' | 'chargeback' | 'abuse-ring'>('test-set');

  // Generate 10,000 held-out synthetic test dataset once
  const dataset = useMemo(() => {
    return generateTestSet(10000);
  }, []);

  // Compute baseline evaluation results for navbar stats ticker
  const baselineEval = useMemo(() => {
    return evaluateModel(dataset, 0.65, 250);
  }, [dataset]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalSamples={dataset.length}
        netSavings={baselineEval.financials.netSavings}
      />

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'test-set' && <TestSetMetrics dataset={dataset} />}
        {activeTab === 'return-scorer' && <ReturnRiskScorer />}
        {activeTab === 'chargeback' && <ChargebackResponder />}
        {activeTab === 'abuse-ring' && <AbuseRingSentinel />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-300">SentinelRisk AI</span>
            <span>— Defense-Only Merchant Loss Prevention Platform</span>
          </div>
          <p className="text-slate-500">
            Built for Indian BFSI & E-Commerce • Measured Precision, Recall & Cost Matrix
          </p>
        </div>
      </footer>

    </div>
  );
}

export default App;
