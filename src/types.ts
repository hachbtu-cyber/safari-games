export type GameStatus = 'WAITING' | 'FLYING' | 'CRASHED';

export type Currency = 'ETB' | 'USD';

export interface UserBet {
  id: string;
  panelId: 1 | 2;
  amount: number;
  autoCashout: boolean;
  autoCashoutMultiplier: number;
  isAutoBet: boolean;
  status: 'IDLE' | 'PLACED_FOR_NEXT' | 'ACTIVE' | 'CASHED_OUT' | 'CRASHED';
  cashedOutMultiplier?: number;
  winAmount?: number;
  timestamp: number;
}

export interface PastRound {
  id: string;
  multiplier: number;
  timestamp: number;
  crashTimeSeconds: number;
  serverSeed: string;
  hash: string;
}

export interface LobbyPlayerBet {
  id: string;
  username: string;
  avatarSeed: string;
  betAmount: number;
  cashedOutMultiplier: number | null;
  winAmount: number | null;
  isCurrentUser?: boolean;
}

export type PaymentMethodId = 'telebirr' | 'cbebirr' | 'chapa' | 'awash' | 'crypto' | 'voucher';

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  amharicName: string;
  tagline: string;
  icon: string;
  badge?: string;
  minDeposit: number;
  maxDeposit: number;
  fee: string;
  instant: boolean;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  method: PaymentMethodId;
  methodName: string;
  amount: number;
  currency: Currency;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  timestamp: number;
  referenceNumber: string;
  senderPhone?: string;
  receiverPhone?: string;
  accountDetail?: string;
  note?: string;
}

export interface AdminSettings {
  telebirrReceiverPhone: string;
  telebirrReceiverName: string;
  cbeReceiverAccount: string;
  cbeReceiverName: string;
  adminPin: string;
  aviatorCrashAggression: 'HIGH' | 'BALANCED' | 'FAIR';
}

export interface ReferralRecord {
  id: string;
  referredUserId: string;
  referredName: string;
  amountEarned: number; // 1 to 5 ETB
  timestamp: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  password?: string;
  registeredAt: number;
  referralCode?: string;
  referredBy?: string;
}

export type ActiveGame = 'AVIATOR' | 'CHICKEN_ROAD';

export type ChickenDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'DAREDEVIL';

export interface ChickenLane {
  laneIndex: number;
  multiplier: number;
  isHit: boolean;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isWin?: boolean;
  multiplier?: number;
}
