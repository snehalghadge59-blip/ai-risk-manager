export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type LossCategory = 
  | 'WARDROBING'
  | 'EMPTY_BOX_CLAIM'
  | 'FRIENDLY_CHARGEBACK'
  | 'UPI_VELOCITY_ABUSE'
  | 'TAG_SWAPPING'
  | 'ACCOUNT_TAKEOVER'
  | 'LEGITIMATE';

export interface SyntheticSample {
  id: string;
  orderId: string;
  userPhone: string;
  paymentMethod: 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'COD' | 'NET_BANKING';
  city: string;
  tierCity: 'TIER_1' | 'TIER_2' | 'TIER_3';
  orderValue: number;
  itemCategory: 'ELECTRONICS' | 'FASHION' | 'JEWELRY' | 'LUXURY_WATCHES' | 'HOME_APPLIANCES';
  pastReturnRate: number; // 0.0 to 1.0
  deviceEntropy: number; // 0.0 to 1.0
  upiVelocity24h: number; // count
  weightDeltaPct: number; // percentage mismatch at carrier scan
  accountAgeDays: number;
  claimAmountRatio: number;
  isDisposedAddress: boolean;
  sharedDeviceAccounts: number;
  predictedProbability: number;
  groundTruthFraud: boolean;
  lossCategory: LossCategory;
}

export interface ConfusionMatrix {
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
}

export interface EvaluationResult {
  totalSamples: number;
  threshold: number;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
  rocAuc: number;
  confusionMatrix: ConfusionMatrix;
  rocCurve: { fpr: number; tpr: number; threshold: number }[];
  prCurve: { recall: number; precision: number; threshold: number }[];
  financials: {
    totalPotentialLoss: number;
    preventedLoss: number;
    falsePositiveCost: number;
    missedFraudLoss: number;
    netSavings: number;
    roiRatio: number;
    preventedCount: number;
    falseAlarmCount: number;
  };
}

export interface ReturnClaimRequest {
  claimId: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  itemCategory: string;
  itemTitle: string;
  itemPrice: number;
  returnReason: string;
  claimedCarrierWeightKg: number;
  expectedWeightKg: number;
  pastReturnRate: number;
  accountAgeDays: number;
  deviceEntropy: number;
  city: string;
  pinCode: string;
  sharedAccountsOnDevice: number;
}

export interface ReturnClaimAssessment {
  claimId: string;
  overallRiskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  primaryRiskCategory: LossCategory;
  breakdown: {
    weightMismatchRisk: number;
    wardrobingRisk: number;
    serialReturnerRisk: number;
    deviceRingRisk: number;
    geoAnomalyRisk: number;
  };
  recommendedAction: 'AUTO_APPROVE' | 'STEP_UP_OTP_VERIFY' | 'INSPECT_AT_PICKUP' | 'FLAG_AND_REJECT';
  explanation: string[];
}

export interface ChargebackDispute {
  disputeId: string;
  orderId: string;
  amount: number;
  gateway: 'RAZORPAY' | 'CASHFREE' | 'PAYU' | 'PHONEPE_PG';
  cardNetworkOrUpi: 'VISA' | 'MASTERCARD' | 'RUPAY' | 'UPI_DISPUTE';
  disputeReason: 'FRIENDLY_FRAUD_NOT_RECOGNIZED' | 'ITEM_NOT_RECEIVED' | 'DEFECTIVE_PRODUCT' | 'UNAUTHORIZED_UPI_DEBIT';
  disputeDate: string;
  evidenceDueDate: string;
  status: 'PENDING_RESPONSE' | 'DOSSIER_GENERATED' | 'DISPUTE_WON' | 'EXPIRED';
  evidenceData: {
    deliveryGpsCoordinates: string;
    deliveryTimestamp: string;
    otpVerifiedTimestamp: string;
    ipAddress: string;
    deviceFingerprint: string;
    buyerEmail: string;
    carrierTrackingCode: string;
    itemSerialNo: string;
    fulfillmentVideoUrl?: string;
  };
}

export interface AbuseRingNode {
  id: string;
  label: string;
  type: 'USER' | 'DEVICE' | 'PHONE' | 'UPI_VPA' | 'ADDRESS';
  riskScore: number;
  isFlagged: boolean;
}

export interface AbuseRingEdge {
  source: string;
  target: string;
  relationship: 'USES_DEVICE' | 'USES_PHONE' | 'PAYS_WITH_VPA' | 'SHIPS_TO_ADDR';
}
