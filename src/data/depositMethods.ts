import { PaymentMethod } from '../types';

export const DEPOSIT_METHODS: PaymentMethod[] = [
  {
    id: 'telebirr',
    name: 'Telebirr (ቴሌብር)',
    amharicName: 'ቴሌብር',
    tagline: 'Instant mobile money via Ethio Telecom',
    icon: 'Smartphone',
    badge: 'POPULAR IN ETHIOPIA',
    minDeposit: 50,
    maxDeposit: 50000,
    fee: '0%',
    instant: true,
  },
  {
    id: 'cbebirr',
    name: 'CBE Birr / CBE Bank',
    amharicName: 'የኢትዮጵያ ንግድ ባንክ (CBE)',
    tagline: 'Commercial Bank of Ethiopia Mobile & App',
    icon: 'Landmark',
    badge: 'FAST APPROVAL',
    minDeposit: 100,
    maxDeposit: 100000,
    fee: '0%',
    instant: true,
  },
  {
    id: 'chapa',
    name: 'Chapa Pay',
    amharicName: 'ቻፓ ፔይመንት',
    tagline: 'Debit Cards, Visa, Mastercard, Internet Banking',
    icon: 'CreditCard',
    badge: 'CARDS & LOCAL',
    minDeposit: 100,
    maxDeposit: 80000,
    fee: '1.5%',
    instant: true,
  },
  {
    id: 'awash',
    name: 'Awash Birr / Dashen Amole',
    amharicName: 'አዋሽ ባንክ / ዳሽን አሞሌ',
    tagline: 'Direct mobile wallet transfer',
    icon: 'Building2',
    minDeposit: 100,
    maxDeposit: 60000,
    fee: '0%',
    instant: true,
  },
  {
    id: 'crypto',
    name: 'Crypto USDT (TRC20 / BEP20)',
    amharicName: 'ዩኤስዲቲ ክሪፕቶ',
    tagline: 'Instant Tether deposit (1 USDT ≈ 138 ETB)',
    icon: 'Coins',
    badge: 'NO LIMITS',
    minDeposit: 150,
    maxDeposit: 500000,
    fee: 'Network fee only',
    instant: true,
  },
  {
    id: 'voucher',
    name: 'Safari Voucher Code',
    amharicName: 'የሳፋሪ ፕሮሞ ቫውቸር',
    tagline: 'Redeem promotional bonus gift codes',
    icon: 'Ticket',
    badge: 'FREE BONUS',
    minDeposit: 50,
    maxDeposit: 5000,
    fee: 'FREE',
    instant: true,
  },
];

export const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

export const DEFAULT_ADMIN_SETTINGS = {
  telebirrReceiverPhone: '0932335247',
  telebirrReceiverName: 'Safari Game Cashier (0932335247)',
  cbeReceiverAccount: '1000492817391',
  cbeReceiverName: 'Safari Aviator Official',
  adminPin: '7788',
  aviatorCrashAggression: 'HIGH' as const,
};

export const INITIAL_TRANSACTIONS = [];
