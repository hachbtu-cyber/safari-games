import { ReferralRecord, UserProfile } from '../types';
import { getTelegramWebApp } from './telegram';

/**
 * Returns a random referral reward between 1.00 and 5.00 ETB
 * Satisfies the user request: "ከ 1 ብር እስከ 5 ብር እንዲያገኙ አድርግልኝ"
 */
export function getRandomReferralBonus(): number {
  const rewards = [1.00, 1.50, 2.00, 2.50, 3.00, 3.50, 4.00, 4.50, 5.00];
  const selected = rewards[Math.floor(Math.random() * rewards.length)];
  return selected;
}

/**
 * Generates or extracts a clean referral code for a user
 */
export function getUserReferralCode(user: UserProfile | null): string {
  if (!user) return 'SAFARI777';
  if (user.referralCode) return user.referralCode;

  const phoneDigits = user.phoneNumber.replace(/\D/g, '');
  if (phoneDigits.length >= 4) {
    return `SAFARI${phoneDigits.slice(-4)}`;
  }
  const idSuffix = user.id.replace(/\D/g, '').slice(-4) || '888';
  return `SAFARI${idSuffix}`;
}

export const OFFICIAL_APP_URL = 'https://safari-games.vercel.app/';
export const TELEGRAM_BOT_USERNAME = 'SafariGameOfficial_bot';

/**
 * Generates sharing links for web and telegram
 */
export function getReferralLinks(referralCode: string) {
  const webLink = `${OFFICIAL_APP_URL}?ref=${encodeURIComponent(referralCode)}`;
  const telegramLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?startapp=${encodeURIComponent(referralCode)}`;
  const shareMessage = `🦁 Safari Game (Aviator & Chicken Road) ላይ ተመዝግበው ይጫወቱ! በኔ ሊንክ ሲገቡ ከ 1 እስከ 5 ብር ቦነስ ያገኛሉ: ${webLink}`;

  return {
    webLink,
    telegramLink,
    shareMessage,
  };
}

/**
 * Reads pending referral code from URL parameters or Telegram start_param
 */
export function detectReferralCodeFromContext(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Check URL query parameters: ?ref= or ?startapp=
    const params = new URLSearchParams(window.location.search);
    const urlRef = params.get('ref') || params.get('startapp') || params.get('start_param');
    if (urlRef && urlRef.trim()) {
      const clean = urlRef.trim().replace(/^ref_/, '');
      localStorage.setItem('safari_pending_ref', clean);
      return clean;
    }

    // 2. Check Telegram WebApp initDataUnsafe.start_param
    const tg = getTelegramWebApp();
    if (tg?.initDataUnsafe?.start_param) {
      const tgRef = tg.initDataUnsafe.start_param.trim().replace(/^ref_/, '');
      if (tgRef) {
        localStorage.setItem('safari_pending_ref', tgRef);
        return tgRef;
      }
    }

    // 3. Fallback to saved pending referral
    const saved = localStorage.getItem('safari_pending_ref');
    return saved || null;
  } catch (e) {
    console.warn('Could not read referral context:', e);
    return null;
  }
}

/**
 * Get referrals history for a user
 */
export function getUserReferralRecords(userId: string): ReferralRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`safari_referrals_${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading referrals:', e);
  }
  return [];
}

/**
 * Add a new referral record
 */
export function saveReferralRecord(userId: string, record: ReferralRecord) {
  if (typeof window === 'undefined') return;
  try {
    const current = getUserReferralRecords(userId);
    const updated = [record, ...current];
    localStorage.setItem(`safari_referrals_${userId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving referral record:', e);
  }
}

/**
 * Get total referral earnings
 */
export function getTotalReferralEarnings(userId: string): number {
  const records = getUserReferralRecords(userId);
  return records.reduce((sum, r) => sum + r.amountEarned, 0);
}
