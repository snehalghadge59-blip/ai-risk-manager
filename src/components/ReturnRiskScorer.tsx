import React, { useState } from 'react';
import type { ReturnClaimRequest, ReturnClaimAssessment } from '../types/risk';
import { assessReturnClaim } from '../services/mlEngine';
import { 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Package, 
  Scale, 
  UserCheck, 
  Sparkles
} from 'lucide-react';

export const ReturnRiskScorer: React.FC = () => {
  // Preset scenarios
  const PRESETS: { title: string; desc: string; icon: string; req: ReturnClaimRequest }[] = [
    {
      title: '📱 Empty Box Fraud Claim',
      desc: 'iPhone 15 Pro return where carrier weight scan is 0.25kg vs 1.20kg expected.',
      icon: 'iphone',
      req: {
        claimId: 'CLM-RET-8841',
        orderId: 'OD-IND-991204',
        customerName: 'Karan Sharma',
        customerPhone: '+91 9820019284',
        paymentMethod: 'COD',
        itemCategory: 'ELECTRONICS',
        itemTitle: 'Apple iPhone 15 Pro (128GB, Natural Titanium)',
        itemPrice: 124900,
        returnReason: 'Received soap bar inside sealed box',
        claimedCarrierWeightKg: 0.25,
        expectedWeightKg: 1.20,
        pastReturnRate: 0.72,
        accountAgeDays: 8,
        deviceEntropy: 0.94,
        city: 'Surat',
        pinCode: '395003',
        sharedAccountsOnDevice: 5
      }
    },
    {
      title: '👗 Fashion Wardrobing Abuse',
      desc: 'Designer Saree returned 3 days post-weekend wedding event with 84% return history.',
      icon: 'saree',
      req: {
        claimId: 'CLM-RET-7721',
        orderId: 'OD-IND-883109',
        customerName: 'Meera Kapadia',
        customerPhone: '+91 9930048102',
        paymentMethod: 'UPI',
        itemCategory: 'FASHION',
        itemTitle: 'Sabyasachi Heritage Silk Lehengha Saree',
        itemPrice: 85000,
        returnReason: 'Color slightly different than picture',
        claimedCarrierWeightKg: 2.10,
        expectedWeightKg: 2.15,
        pastReturnRate: 0.84,
        accountAgeDays: 45,
        deviceEntropy: 0.42,
        city: 'Jaipur',
        pinCode: '302001',
        sharedAccountsOnDevice: 1
      }
    },
    {
      title: '💻 Serial Returner Abuse Ring',
      desc: 'New user on shared device fingerprint claiming total return of ₹68,000.',
      icon: 'laptop',
      req: {
        claimId: 'CLM-RET-6610',
        orderId: 'OD-IND-774102',
        customerName: 'Rahul Varma',
        customerPhone: '+91 9811094012',
        paymentMethod: 'CREDIT_CARD',
        itemCategory: 'ELECTRONICS',
        itemTitle: 'ASUS ROG Strix G16 Gaming Laptop',
        itemPrice: 142000,
        returnReason: 'Performance not as expected',
        claimedCarrierWeightKg: 3.40,
        expectedWeightKg: 3.45,
        pastReturnRate: 0.90,
        accountAgeDays: 4,
        deviceEntropy: 0.96,
        city: 'Patna',
        pinCode: '800001',
        sharedAccountsOnDevice: 7
      }
    },
    {
      title: '🎧 Legitimate Customer Return',
      desc: 'Earbuds return with 100% weight match and 600+ day account history.',
      icon: 'earbuds',
      req: {
        claimId: 'CLM-RET-1102',
        orderId: 'OD-IND-110942',
        customerName: 'Ananya Roy',
        customerPhone: '+91 9871029381',
        paymentMethod: 'UPI',
        itemCategory: 'ELECTRONICS',
        itemTitle: 'Sony WF-1000XM5 Wireless Noise Canceling Earbuds',
        itemPrice: 24990,
        returnReason: 'Left earbud fit issues',
        claimedCarrierWeightKg: 0.40,
        expectedWeightKg: 0.40,
        pastReturnRate: 0.04,
        accountAgeDays: 620,
        deviceEntropy: 0.12,
        city: 'Bengaluru',
        pinCode: '560034',
        sharedAccountsOnDevice: 1
      }
    }
  ];

  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);
  const [formData, setFormData] = useState<ReturnClaimRequest>(PRESETS[0].req);

  // Compute live assessment
  const assessment: ReturnClaimAssessment = assessReturnClaim(formData);

  const handlePresetSelect = (index: number) => {
    setActivePresetIndex(index);
    setFormData(PRESETS[index].req);
  };

  const handleInputChange = (field: keyof ReturnClaimRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <RotateCcw className="w-4 h-4" />
              <span>Real-Time Return Fraud & Wardrobing Scorer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              E-Commerce Return Risk & Abuse Evaluator
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Prevents merchant margin erosion from empty box claims, wardrobing (wearing & returning), carrier weight tampering, and serial refund abuse.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRESETS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handlePresetSelect(idx)}
            className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
              activePresetIndex === idx
                ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/20 text-white'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div>
              <div className="font-bold text-sm text-white mb-1">{preset.title}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{preset.desc}</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-mono font-semibold pt-2 border-t border-slate-800/80">
              <span className="text-slate-400">Claim: ₹{preset.req.itemPrice.toLocaleString()}</span>
              <span className={activePresetIndex === idx ? 'text-indigo-400' : 'text-slate-500'}>
                {activePresetIndex === idx ? '● ACTIVE PRESET' : 'Select'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Main Evaluator Workspace: Form + Live Assessment Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Parameters Form (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Package className="w-5 h-5 text-indigo-400" />
            Incoming Return Claim Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Customer Name</label>
              <input 
                type="text" 
                value={formData.customerName} 
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
              <input 
                type="text" 
                value={formData.customerPhone} 
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Item Category</label>
              <select 
                value={formData.itemCategory} 
                onChange={(e) => handleInputChange('itemCategory', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="ELECTRONICS">ELECTRONICS</option>
                <option value="FASHION">FASHION</option>
                <option value="JEWELRY">JEWELRY</option>
                <option value="LUXURY_WATCHES">LUXURY WATCHES</option>
                <option value="HOME_APPLIANCES">HOME APPLIANCES</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Item Value (₹)</label>
              <input 
                type="number" 
                value={formData.itemPrice} 
                onChange={(e) => handleInputChange('itemPrice', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">City / Pin Code</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={formData.city} 
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
                <input 
                  type="text" 
                  value={formData.pinCode} 
                  onChange={(e) => handleInputChange('pinCode', e.target.value)}
                  className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-4">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              Physical & Behavioral Risk Vectors:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Carrier Scanned Weight: <span className="font-mono text-indigo-400 font-bold">{formData.claimedCarrierWeightKg} kg</span>
                </label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="5.0" 
                  step="0.05"
                  value={formData.claimedCarrierWeightKg} 
                  onChange={(e) => handleInputChange('claimedCarrierWeightKg', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[10px] text-slate-500">Expected: {formData.expectedWeightKg} kg</span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Historical Return Rate: <span className="font-mono text-indigo-400 font-bold">{(formData.pastReturnRate * 100).toFixed(0)}%</span>
                </label>
                <input 
                  type="range" 
                  min="0.0" 
                  max="1.0" 
                  step="0.02"
                  value={formData.pastReturnRate} 
                  onChange={(e) => handleInputChange('pastReturnRate', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Account Tenure: <span className="font-mono text-indigo-400 font-bold">{formData.accountAgeDays} Days</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="365" 
                  value={formData.accountAgeDays} 
                  onChange={(e) => handleInputChange('accountAgeDays', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Device Shared Accounts: <span className="font-mono text-indigo-400 font-bold">{formData.sharedAccountsOnDevice} Accounts</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={formData.sharedAccountsOnDevice} 
                  onChange={(e) => handleInputChange('sharedAccountsOnDevice', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Risk Output Card (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          <div className={`p-6 rounded-2xl border transition-all shadow-xl ${
            assessment.riskLevel === 'CRITICAL' ? 'bg-rose-950/40 border-rose-500/40 shadow-rose-500/10' :
            assessment.riskLevel === 'HIGH' ? 'bg-amber-950/40 border-amber-500/40 shadow-amber-500/10' :
            assessment.riskLevel === 'MEDIUM' ? 'bg-yellow-950/30 border-yellow-500/30' :
            'bg-emerald-950/40 border-emerald-500/40 shadow-emerald-500/10'
          }`}>
            
            {/* Top Score Gauge */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Calculated Risk Score
                </span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className={`text-4xl font-black font-mono ${
                    assessment.riskLevel === 'CRITICAL' ? 'text-rose-400' :
                    assessment.riskLevel === 'HIGH' ? 'text-amber-400' :
                    assessment.riskLevel === 'MEDIUM' ? 'text-yellow-400' :
                    'text-emerald-400'
                  }`}>
                    {assessment.overallRiskScore}
                  </span>
                  <span className="text-slate-500 font-mono text-sm">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                  assessment.riskLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                  assessment.riskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  assessment.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {assessment.riskLevel} RISK
                </span>
                <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                  Category: {assessment.primaryRiskCategory.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* Recommended Action Badge */}
            <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl mb-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">
                Automated Decision Recommendation:
              </span>
              <div className="flex items-center space-x-3">
                {assessment.recommendedAction === 'FLAG_AND_REJECT' && (
                  <div className="bg-rose-500 p-2 rounded-lg text-white">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                )}
                {assessment.recommendedAction === 'INSPECT_AT_PICKUP' && (
                  <div className="bg-amber-500 p-2 rounded-lg text-white">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                {assessment.recommendedAction === 'STEP_UP_OTP_VERIFY' && (
                  <div className="bg-yellow-500 p-2 rounded-lg text-white">
                    <UserCheck className="w-5 h-5" />
                  </div>
                )}
                {assessment.recommendedAction === 'AUTO_APPROVE' && (
                  <div className="bg-emerald-500 p-2 rounded-lg text-white">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-sm text-white">
                    {assessment.recommendedAction.replace(/_/g, ' ')}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {assessment.recommendedAction === 'FLAG_AND_REJECT' ? 'Halt refund. Request warehouse weight audit & carrier proof.' :
                     assessment.recommendedAction === 'INSPECT_AT_PICKUP' ? 'Delivery partner must physical inspect serial tag before pickup.' :
                     assessment.recommendedAction === 'STEP_UP_OTP_VERIFY' ? 'Require customer Aadhaar OTP verification before pickup dispatch.' :
                     'Proceed with instant automated refund.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Factors Breakdown */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-300 block">Risk Factor Decomposition:</span>
              
              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span>Weight Delta Anomaly</span>
                  <span className="font-mono text-white">{assessment.breakdown.weightMismatchRisk}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-full rounded-full" style={{ width: `${assessment.breakdown.weightMismatchRisk}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span>Wardrobing Pattern Score</span>
                  <span className="font-mono text-white">{assessment.breakdown.wardrobingRisk}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${assessment.breakdown.wardrobingRisk}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span>Multi-Account Device Ring</span>
                  <span className="font-mono text-white">{assessment.breakdown.deviceRingRisk}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-400 h-full rounded-full" style={{ width: `${assessment.breakdown.deviceRingRisk}%` }}></div>
                </div>
              </div>
            </div>

          </div>

          {/* Explainable AI (XAI) Defense Audit Log */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-extrabold uppercase text-indigo-400 tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Explainable AI Audit Reasoning (XAI)
            </h3>
            <ul className="space-y-2">
              {assessment.explanation.map((item, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
