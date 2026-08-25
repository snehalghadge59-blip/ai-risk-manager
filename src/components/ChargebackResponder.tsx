import React, { useState } from 'react';
import type { ChargebackDispute } from '../types/risk';
import { MOCK_CHARGEBACKS } from '../services/mlEngine';
import { 
  FileText, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Key, 
  Smartphone, 
  Video, 
  Send,
  Printer
} from 'lucide-react';

export const ChargebackResponder: React.FC = () => {
  const [disputes, setDisputes] = useState<ChargebackDispute[]>(MOCK_CHARGEBACKS);
  const [selectedDispute, setSelectedDispute] = useState<ChargebackDispute>(MOCK_CHARGEBACKS[0]);
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [submittedStatus, setSubmittedStatus] = useState<boolean>(false);

  const handleSelectDispute = (dispute: ChargebackDispute) => {
    setSelectedDispute(dispute);
    setSubmittedStatus(dispute.status === 'DISPUTE_WON' || dispute.status === 'DOSSIER_GENERATED');
  };

  const handleGenerateDossier = () => {
    setShowDossierModal(true);
  };

  const handleSubmitToGateway = () => {
    setSubmittedStatus(true);
    setDisputes(prev => prev.map(d => 
      d.disputeId === selectedDispute.disputeId ? { ...d, status: 'DISPUTE_WON' } : d
    ));
    setSelectedDispute(prev => ({ ...prev, status: 'DISPUTE_WON' }));
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>Chargeback Defense & Evidence Auto-Responder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              UPI & Card Dispute Evidence Auto-Responder
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Combats friendly fraud and chargeback losses by automatically compiling delivery GPS signatures, OTP verification trails, IP/device hashes, and packing logs into audit-proof defense dossiers.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace: Dispute List + Detailed Evidence Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Dispute List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between px-1">
            <span>Pending Chargeback Claims ({disputes.length})</span>
            <span className="text-xs text-indigo-400 font-normal">Razorpay / PayU / Cashfree</span>
          </h2>

          <div className="space-y-3">
            {disputes.map((dispute) => {
              const isSelected = selectedDispute.disputeId === dispute.disputeId;
              return (
                <div
                  key={dispute.disputeId}
                  onClick={() => handleSelectDispute(dispute)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/20 text-white'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs text-indigo-300">
                      {dispute.disputeId}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      dispute.status === 'DISPUTE_WON' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {dispute.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline my-1">
                    <span className="font-extrabold text-base text-white">
                      ₹{dispute.amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Order: {dispute.orderId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      {dispute.cardNetworkOrUpi} ({dispute.gateway})
                    </span>
                    <span className="flex items-center gap-1 text-rose-400 font-medium">
                      <Clock className="w-3 h-3" /> Due: {dispute.evidenceDueDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evidence Builder & Action Panel (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-2">
              <div>
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider font-mono">
                  {selectedDispute.disputeId} • {selectedDispute.gateway}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">
                  {selectedDispute.disputeReason.replace(/_/g, ' ')}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  ₹{selectedDispute.amount.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Disputed Transaction</span>
              </div>
            </div>

            {/* Evidence Components Breakdown */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 block">
                Auto-Compiled Defense Artifacts:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center space-x-3">
                  <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">GPS Delivery Coordinates</span>
                    <span className="text-xs font-mono text-slate-200 font-bold">{selectedDispute.evidenceData.deliveryGpsCoordinates}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center space-x-3">
                  <div className="bg-indigo-500/10 text-indigo-400 p-2 rounded-lg">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Delivery OTP Audit Trail</span>
                    <span className="text-xs font-mono text-slate-200 font-bold">{selectedDispute.evidenceData.otpVerifiedTimestamp}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center space-x-3">
                  <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">IP & Device Signature</span>
                    <span className="text-xs font-mono text-slate-200 font-bold">{selectedDispute.evidenceData.ipAddress}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center space-x-3">
                  <div className="bg-purple-500/10 text-purple-400 p-2 rounded-lg">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Warehouse Packing Video Hash</span>
                    <span className="text-xs font-mono text-slate-200 font-bold">Verified SHA256 Hash</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleGenerateDossier}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all border border-slate-700"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Preview Full Defense Dossier</span>
            </button>

            <button
              onClick={handleSubmitToGateway}
              disabled={submittedStatus}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg ${
                submittedStatus
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/30'
              }`}
            >
              {submittedStatus ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Dossier Submitted to {selectedDispute.gateway}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Auto-Dispatch Evidence to {selectedDispute.gateway}</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Dossier Preview Modal */}
      {showDossierModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-600 p-2 rounded-xl text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    OFFICIAL MERCHANT DEFENSE EVIDENCE DOSSIER
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Ref: {selectedDispute.disputeId} • Gateway: {selectedDispute.gateway} • Network: {selectedDispute.cardNetworkOrUpi}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDossierModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold bg-slate-800 px-3 py-1 rounded-lg"
              >
                ✕ Close
              </button>
            </div>

            {/* Dossier Document Body */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-xs text-slate-300 space-y-5 font-mono">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] block">Disputed Order</span>
                  <span className="text-white font-bold">{selectedDispute.orderId}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] block">Disputed Amount</span>
                  <span className="text-emerald-400 font-bold">₹{selectedDispute.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] block">Dispute Reason</span>
                  <span className="text-amber-400">{selectedDispute.disputeReason}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] block">Buyer Email</span>
                  <span className="text-slate-200">{selectedDispute.evidenceData.buyerEmail}</span>
                </div>
              </div>

              <div>
                <h4 className="text-slate-400 font-bold uppercase text-[11px] mb-2 text-indigo-400">
                  1. POSITIVE DELIVERY & GEOLOCATION PROOF
                </h4>
                <p className="text-slate-300 leading-relaxed font-sans">
                  The order was successfully delivered by logistics partner ({selectedDispute.evidenceData.carrierTrackingCode}) to the buyer address matching GPS coordinates <span className="text-indigo-300 font-bold">{selectedDispute.evidenceData.deliveryGpsCoordinates}</span> at <span className="text-indigo-300 font-bold">{selectedDispute.evidenceData.deliveryTimestamp}</span>.
                </p>
              </div>

              <div>
                <h4 className="text-slate-400 font-bold uppercase text-[11px] mb-2 text-indigo-400">
                  2. TWO-FACTOR OTP AUTHENTICATION LOG
                </h4>
                <p className="text-slate-300 leading-relaxed font-sans">
                  Delivery was authenticated at recipient threshold using OTP validation log: <span className="text-emerald-400 font-bold">{selectedDispute.evidenceData.otpVerifiedTimestamp}</span>.
                </p>
              </div>

              <div>
                <h4 className="text-slate-400 font-bold uppercase text-[11px] mb-2 text-indigo-400">
                  3. DEVICE & NETWORK SIGNATURE MATCH
                </h4>
                <p className="text-slate-300 leading-relaxed font-sans">
                  Transaction initiated from verified IP Address <span className="text-amber-300">{selectedDispute.evidenceData.ipAddress}</span> using device fingerprint <span className="text-amber-300">{selectedDispute.evidenceData.deviceFingerprint}</span> matching buyer account history.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Download PDF</span>
              </button>

              <button
                onClick={() => {
                  handleSubmitToGateway();
                  setShowDossierModal(false);
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Confirm & Submit to {selectedDispute.gateway}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
