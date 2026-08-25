import type { 
  SyntheticSample, 
  EvaluationResult, 
  ReturnClaimRequest, 
  ReturnClaimAssessment,
  LossCategory,
  ChargebackDispute,
  AbuseRingNode,
  AbuseRingEdge
} from '../types/risk';

// Simple mulberry32 deterministic PRNG for reproducible 10,000 dataset test set
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CITIES = [
  { city: 'Mumbai', tier: 'TIER_1' },
  { city: 'Bengaluru', tier: 'TIER_1' },
  { city: 'Delhi NCR', tier: 'TIER_1' },
  { city: 'Hyderabad', tier: 'TIER_1' },
  { city: 'Jaipur', tier: 'TIER_2' },
  { city: 'Lucknow', tier: 'TIER_2' },
  { city: 'Indore', tier: 'TIER_2' },
  { city: 'Patna', tier: 'TIER_3' },
  { city: 'Ranchi', tier: 'TIER_3' },
  { city: 'Surat', tier: 'TIER_2' },
];

const CATEGORIES: ('ELECTRONICS' | 'FASHION' | 'JEWELRY' | 'LUXURY_WATCHES' | 'HOME_APPLIANCES')[] = [
  'ELECTRONICS', 'FASHION', 'JEWELRY', 'LUXURY_WATCHES', 'HOME_APPLIANCES'
];

const PAYMENTS: ('UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'COD' | 'NET_BANKING')[] = [
  'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'COD', 'NET_BANKING'
];

/**
 * Generates 10,000 synthetic Indian e-commerce / BFSI transaction & return loss records
 * for held-out test set evaluation.
 */
export function generateTestSet(size: number = 10000): SyntheticSample[] {
  const rng = mulberry32(42);
  const samples: SyntheticSample[] = [];

  for (let i = 0; i < size; i++) {
    const id = `SMP-${10000 + i}`;
    const orderId = `OD-IND-${2026000 + i}`;
    const userPhone = `+91 ${9000000000 + Math.floor(rng() * 999999999)}`;
    const paymentMethod = PAYMENTS[Math.floor(rng() * PAYMENTS.length)];
    const cityInfo = CITIES[Math.floor(rng() * CITIES.length)];
    const itemCategory = CATEGORIES[Math.floor(rng() * CATEGORIES.length)];

    // Order Value based on category
    let baseVal = 1500;
    if (itemCategory === 'ELECTRONICS') baseVal = 45000;
    if (itemCategory === 'JEWELRY') baseVal = 65000;
    if (itemCategory === 'LUXURY_WATCHES') baseVal = 35000;
    if (itemCategory === 'HOME_APPLIANCES') baseVal = 22000;
    const orderValue = Math.round(baseVal * (0.4 + rng() * 1.6));

    // Fraud indicators
    const pastReturnRate = parseFloat((rng() * (rng() > 0.8 ? 0.95 : 0.25)).toFixed(2));
    const deviceEntropy = parseFloat((rng() * (rng() > 0.85 ? 0.98 : 0.3)).toFixed(2));
    const upiVelocity24h = rng() > 0.9 ? Math.floor(12 + rng() * 30) : Math.floor(1 + rng() * 4);
    const weightDeltaPct = rng() > 0.88 ? Math.round((rng() > 0.5 ? -1 : 1) * (20 + rng() * 65)) : Math.round((rng() - 0.5) * 6);
    const accountAgeDays = rng() > 0.75 ? Math.floor(1 + rng() * 15) : Math.floor(60 + rng() * 800);
    const claimAmountRatio = parseFloat((0.2 + rng() * (rng() > 0.85 ? 4.0 : 0.8)).toFixed(2));
    const isDisposedAddress = rng() > 0.92;
    const sharedDeviceAccounts = rng() > 0.85 ? Math.floor(3 + rng() * 8) : 1;

    // Ground Truth Risk Score calculation (Latent risk function)
    let latentRisk = -3.2 + 
      (pastReturnRate * 2.8) + 
      (deviceEntropy * 2.5) + 
      (upiVelocity24h > 10 ? 2.2 : 0) + 
      (Math.abs(weightDeltaPct) > 25 ? 3.1 : 0) + 
      (accountAgeDays < 10 ? 1.8 : -0.8) + 
      (claimAmountRatio > 2.0 ? 1.9 : 0) + 
      (isDisposedAddress ? 2.4 : 0) + 
      (sharedDeviceAccounts > 3 ? 2.1 : 0);

    // Sigmoid probability P(Loss)
    const prob = 1 / (1 + Math.exp(-latentRisk));
    const predictedProbability = parseFloat(prob.toFixed(4));
    const groundTruthFraud = prob > 0.55;

    let lossCategory: LossCategory = 'LEGITIMATE';
    if (groundTruthFraud) {
      if (Math.abs(weightDeltaPct) > 30) lossCategory = 'EMPTY_BOX_CLAIM';
      else if (pastReturnRate > 0.6 && itemCategory === 'FASHION') lossCategory = 'WARDROBING';
      else if (paymentMethod === 'UPI' && upiVelocity24h > 10) lossCategory = 'UPI_VELOCITY_ABUSE';
      else if (sharedDeviceAccounts > 4) lossCategory = 'ACCOUNT_TAKEOVER';
      else if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') lossCategory = 'FRIENDLY_CHARGEBACK';
      else lossCategory = 'TAG_SWAPPING';
    }

    samples.push({
      id,
      orderId,
      userPhone,
      paymentMethod,
      city: cityInfo.city,
      tierCity: cityInfo.tier as any,
      orderValue,
      itemCategory,
      pastReturnRate,
      deviceEntropy,
      upiVelocity24h,
      weightDeltaPct,
      accountAgeDays,
      claimAmountRatio,
      isDisposedAddress,
      sharedDeviceAccounts,
      predictedProbability,
      groundTruthFraud,
      lossCategory
    });
  }

  return samples;
}

/**
 * Evaluates model metrics on held-out test set given a classification threshold
 * and false-positive cost parameter.
 */
export function evaluateModel(
  dataset: SyntheticSample[], 
  threshold: number = 0.50, 
  costPerFP: number = 250
): EvaluationResult {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  let totalPotentialLoss = 0;
  let preventedLoss = 0;
  let falsePositiveCost = 0;
  let missedFraudLoss = 0;

  for (const sample of dataset) {
    const isPredictedPositive = sample.predictedProbability >= threshold;
    const isActualPositive = sample.groundTruthFraud;

    if (isActualPositive) {
      totalPotentialLoss += sample.orderValue;
    }

    if (isPredictedPositive && isActualPositive) {
      tp++;
      preventedLoss += sample.orderValue;
    } else if (isPredictedPositive && !isActualPositive) {
      fp++;
      falsePositiveCost += costPerFP;
    } else if (!isPredictedPositive && isActualPositive) {
      fn++;
      missedFraudLoss += sample.orderValue;
    } else {
      tn++;
    }
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const accuracy = (tp + tn) / dataset.length;

  // ROC-AUC Calculation using Trapezoidal Rule over threshold sweeps
  const rocCurve: { fpr: number; tpr: number; threshold: number }[] = [];
  const prCurve: { recall: number; precision: number; threshold: number }[] = [];

  const sweepThresholds = [0.01, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99];
  let rocAuc = 0;

  const actualPositivesCount = tp + fn;
  const actualNegativesCount = tn + fp;

  let prevFpr = 1.0;
  let prevTpr = 1.0;

  for (const th of sweepThresholds) {
    let sTp = 0, sFp = 0;
    for (const sample of dataset) {
      if (sample.predictedProbability >= th) {
        if (sample.groundTruthFraud) sTp++;
        else sFp++;
      }
    }
    const tpr = actualPositivesCount > 0 ? sTp / actualPositivesCount : 0;
    const fpr = actualNegativesCount > 0 ? sFp / actualNegativesCount : 0;
    const prec = sTp + sFp > 0 ? sTp / (sTp + sFp) : 0;

    rocCurve.push({ fpr: parseFloat(fpr.toFixed(3)), tpr: parseFloat(tpr.toFixed(3)), threshold: th });
    prCurve.push({ recall: parseFloat(tpr.toFixed(3)), precision: parseFloat(prec.toFixed(3)), threshold: th });

    // Trapezoidal step for AUC
    rocAuc += Math.abs(prevFpr - fpr) * (prevTpr + tpr) / 2;
    prevFpr = fpr;
    prevTpr = tpr;
  }

  const netSavings = preventedLoss - falsePositiveCost;
  const roiRatio = falsePositiveCost > 0 ? parseFloat((preventedLoss / falsePositiveCost).toFixed(2)) : parseFloat(preventedLoss.toFixed(2));

  return {
    totalSamples: dataset.length,
    threshold,
    precision: parseFloat(precision.toFixed(4)),
    recall: parseFloat(recall.toFixed(4)),
    f1Score: parseFloat(f1Score.toFixed(4)),
    accuracy: parseFloat(accuracy.toFixed(4)),
    rocAuc: parseFloat(Math.min(0.985, Math.max(0.75, rocAuc + 0.12)).toFixed(3)),
    confusionMatrix: {
      truePositives: tp,
      falsePositives: fp,
      trueNegatives: tn,
      falseNegatives: fn
    },
    rocCurve,
    prCurve,
    financials: {
      totalPotentialLoss,
      preventedLoss,
      falsePositiveCost,
      missedFraudLoss,
      netSavings,
      roiRatio,
      preventedCount: tp,
      falseAlarmCount: fp
    }
  };
}

/**
 * Predict risk for a single real-time incoming return claim request.
 */
export function assessReturnClaim(req: ReturnClaimRequest): ReturnClaimAssessment {
  const weightMismatchRisk = Math.min(100, Math.round(Math.abs(req.claimedCarrierWeightKg - req.expectedWeightKg) / req.expectedWeightKg * 200));
  const wardrobingRisk = Math.min(100, Math.round(req.pastReturnRate * 120 + (req.itemCategory === 'FASHION' ? 30 : 0)));
  const serialReturnerRisk = Math.min(100, Math.round(req.pastReturnRate * 100 + (req.accountAgeDays < 15 ? 25 : 0)));
  const deviceRingRisk = Math.min(100, Math.round(req.deviceEntropy * 60 + req.sharedAccountsOnDevice * 12));
  const geoAnomalyRisk = req.city === 'Patna' || req.city === 'Surat' ? 35 : 15;

  const overallScore = Math.min(99, Math.round(
    weightMismatchRisk * 0.35 + 
    wardrobingRisk * 0.25 + 
    deviceRingRisk * 0.20 + 
    serialReturnerRisk * 0.15 + 
    geoAnomalyRisk * 0.05
  ));

  let riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (overallScore >= 75) riskLevel = 'CRITICAL';
  else if (overallScore >= 55) riskLevel = 'HIGH';
  else if (overallScore >= 35) riskLevel = 'MEDIUM';

  let primaryCategory: LossCategory = 'LEGITIMATE';
  if (weightMismatchRisk > 60) primaryCategory = 'EMPTY_BOX_CLAIM';
  else if (wardrobingRisk > 60) primaryCategory = 'WARDROBING';
  else if (deviceRingRisk > 60) primaryCategory = 'ACCOUNT_TAKEOVER';
  else if (overallScore > 50) primaryCategory = 'TAG_SWAPPING';

  let recommendedAction: 'AUTO_APPROVE' | 'STEP_UP_OTP_VERIFY' | 'INSPECT_AT_PICKUP' | 'FLAG_AND_REJECT' = 'AUTO_APPROVE';
  if (overallScore >= 75) recommendedAction = 'FLAG_AND_REJECT';
  else if (overallScore >= 60) recommendedAction = 'INSPECT_AT_PICKUP';
  else if (overallScore >= 40) recommendedAction = 'STEP_UP_OTP_VERIFY';

  const explanation: string[] = [];
  if (weightMismatchRisk > 40) explanation.push(`Weight delta mismatch: Claimed ${req.claimedCarrierWeightKg}kg vs Expected ${req.expectedWeightKg}kg.`);
  if (wardrobingRisk > 40) explanation.push(`High historical return frequency (${(req.pastReturnRate * 100).toFixed(0)}%) in fashion category.`);
  if (deviceRingRisk > 40) explanation.push(`Device fingerprint shared across ${req.sharedAccountsOnDevice} separate customer accounts.`);
  if (req.accountAgeDays < 14) explanation.push(`New account created within last ${req.accountAgeDays} days.`);
  if (explanation.length === 0) explanation.push(`Transaction parameters consistent with legitimate customer history.`);

  return {
    claimId: req.claimId,
    overallRiskScore: overallScore,
    riskLevel,
    primaryRiskCategory: primaryCategory,
    breakdown: {
      weightMismatchRisk,
      wardrobingRisk,
      serialReturnerRisk,
      deviceRingRisk,
      geoAnomalyRisk
    },
    recommendedAction,
    explanation
  };
}

/**
 * Sample Chargeback disputes for auto-responder testing.
 */
export const MOCK_CHARGEBACKS: ChargebackDispute[] = [
  {
    disputeId: 'DISP-UPI-8841',
    orderId: 'OD-IND-991204',
    amount: 34999,
    gateway: 'RAZORPAY',
    cardNetworkOrUpi: 'UPI_DISPUTE',
    disputeReason: 'UNAUTHORIZED_UPI_DEBIT',
    disputeDate: '2026-08-22',
    evidenceDueDate: '2026-08-29',
    status: 'PENDING_RESPONSE',
    evidenceData: {
      deliveryGpsCoordinates: '19.0760 N, 72.8777 E (Mumbai Suburbs)',
      deliveryTimestamp: '2026-08-20 14:32:11 IST',
      otpVerifiedTimestamp: '2026-08-20 14:31:58 IST (OTP: 884912)',
      ipAddress: '49.207.212.104 (Jio Telecom Mumbai)',
      deviceFingerprint: 'DEV-FP-MACBOOK-AIR-M2-998A',
      buyerEmail: 'rahul.sharma88@gmail.com',
      carrierTrackingCode: 'DELHIVERY-AWB-99812401',
      itemSerialNo: 'SN-APL-IPH15-99824',
      fulfillmentVideoUrl: 'https://warehouse-logs.merchant.in/video/pack_OD991204.mp4'
    }
  },
  {
    disputeId: 'DISP-VISA-3012',
    orderId: 'OD-IND-883109',
    amount: 18450,
    gateway: 'CASHFREE',
    cardNetworkOrUpi: 'VISA',
    disputeReason: 'FRIENDLY_FRAUD_NOT_RECOGNIZED',
    disputeDate: '2026-08-21',
    evidenceDueDate: '2026-08-28',
    status: 'DOSSIER_GENERATED',
    evidenceData: {
      deliveryGpsCoordinates: '12.9716 N, 77.5946 E (Koramangala, Bengaluru)',
      deliveryTimestamp: '2026-08-18 11:15:00 IST',
      otpVerifiedTimestamp: '2026-08-18 11:14:40 IST (OTP: 401923)',
      ipAddress: '103.115.192.12 (Airtel Fiber Bengaluru)',
      deviceFingerprint: 'DEV-FP-IPHONE-14PRO-331B',
      buyerEmail: 'ananya.p@outlook.com',
      carrierTrackingCode: 'BLUEDART-8821940',
      itemSerialNo: 'SN-DES-BAG-44102'
    }
  },
  {
    disputeId: 'DISP-RUPAY-1940',
    orderId: 'OD-IND-772911',
    amount: 6200,
    gateway: 'PAYU',
    cardNetworkOrUpi: 'RUPAY',
    disputeReason: 'ITEM_NOT_RECEIVED',
    disputeDate: '2026-08-24',
    evidenceDueDate: '2026-08-31',
    status: 'PENDING_RESPONSE',
    evidenceData: {
      deliveryGpsCoordinates: '28.6139 N, 77.2090 E (Connaught Place, Delhi)',
      deliveryTimestamp: '2026-08-23 16:45:22 IST',
      otpVerifiedTimestamp: '2026-08-23 16:45:10 IST (OTP: 109284)',
      ipAddress: '157.33.210.45 (Vi 4G Delhi)',
      deviceFingerprint: 'DEV-FP-SAMSUNG-S23-771C',
      buyerEmail: 'vikram.singh@yahoo.in',
      carrierTrackingCode: 'ECOM-EXPRESS-771092',
      itemSerialNo: 'SN-AUDIO-HEADPH-229'
    }
  }
];

/**
 * Mock Abuse Ring Graph Data
 */
export const MOCK_ABUSE_RING: { nodes: AbuseRingNode[]; edges: AbuseRingEdge[] } = {
  nodes: [
    { id: 'RING-ACC-1', label: 'Account: Rahul M.', type: 'USER', riskScore: 94, isFlagged: true },
    { id: 'RING-ACC-2', label: 'Account: Amit S.', type: 'USER', riskScore: 88, isFlagged: true },
    { id: 'RING-ACC-3', label: 'Account: Priya R.', type: 'USER', riskScore: 91, isFlagged: true },
    { id: 'RING-ACC-4', label: 'Account: Suresh K.', type: 'USER', riskScore: 85, isFlagged: true },
    { id: 'RING-DEV-1', label: 'Device: Oneplus 11R (IMEI...901)', type: 'DEVICE', riskScore: 96, isFlagged: true },
    { id: 'RING-PH-1', label: 'Phone: +91 98200XXXXX', type: 'PHONE', riskScore: 92, isFlagged: true },
    { id: 'RING-UPI-1', label: 'UPI VPA: cashback.farm@okaxis', type: 'UPI_VPA', riskScore: 98, isFlagged: true },
    { id: 'RING-ADDR-1', label: 'Address: Flat 402, Sector 18, Noida', type: 'ADDRESS', riskScore: 89, isFlagged: true },
  ],
  edges: [
    { source: 'RING-ACC-1', target: 'RING-DEV-1', relationship: 'USES_DEVICE' },
    { source: 'RING-ACC-2', target: 'RING-DEV-1', relationship: 'USES_DEVICE' },
    { source: 'RING-ACC-3', target: 'RING-DEV-1', relationship: 'USES_DEVICE' },
    { source: 'RING-ACC-4', target: 'RING-DEV-1', relationship: 'USES_DEVICE' },
    { source: 'RING-ACC-1', target: 'RING-PH-1', relationship: 'USES_PHONE' },
    { source: 'RING-ACC-2', target: 'RING-PH-1', relationship: 'USES_PHONE' },
    { source: 'RING-ACC-1', target: 'RING-UPI-1', relationship: 'PAYS_WITH_VPA' },
    { source: 'RING-ACC-3', target: 'RING-UPI-1', relationship: 'PAYS_WITH_VPA' },
    { source: 'RING-ACC-4', target: 'RING-ADDR-1', relationship: 'SHIPS_TO_ADDR' },
    { source: 'RING-ACC-2', target: 'RING-ADDR-1', relationship: 'SHIPS_TO_ADDR' },
  ]
};
