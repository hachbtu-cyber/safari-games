import React, { useState, useEffect } from 'react';
import { 
  X, Gift, Users, Copy, Check, Share2, Sparkles, 
  ArrowRight, Award, DollarSign, Send, Info, ChevronRight, CheckCircle2
} from 'lucide-react';
import { UserProfile, ReferralRecord, Currency } from '../types';
import { 
  getUserReferralCode, 
  getReferralLinks, 
  getUserReferralRecords, 
  getRandomReferralBonus,
  OFFICIAL_APP_URL,
  saveReferralRecord 
} from '../utils/referral';
import { shareOnTelegram, triggerTelegramHaptic } from '../utils/telegram';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  currency: Currency;
  language: 'en' | 'am';
  onClaimReferralBonus: (bonusAmount: number, referralCode: string) => void;
  onOpenAuth: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currency,
  language,
  onClaimReferralBonus,
  onOpenAuth,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inputReferralCode, setInputReferralCode] = useState('');
  const [claimStatus, setClaimStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);

  const referralCode = getUserReferralCode(currentUser);
  const { webLink, telegramLink, shareMessage } = getReferralLinks(referralCode);

  useEffect(() => {
    if (currentUser?.id) {
      setReferrals(getUserReferralRecords(currentUser.id));
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const totalEarned = referrals.reduce((sum, r) => sum + r.amountEarned, 0);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    triggerTelegramHaptic('notification', 'success');
    soundManager.playClick();
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(webLink);
    setCopiedLink(true);
    triggerTelegramHaptic('notification', 'success');
    soundManager.playClick();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareTelegram = () => {
    triggerTelegramHaptic('impact', 'medium');
    shareOnTelegram(shareMessage, webLink);
  };

  const handleClaimFriendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimStatus(null);

    const clean = inputReferralCode.trim().toUpperCase();
    if (!clean) {
      setClaimStatus({
        type: 'error',
        message: language === 'am' ? 'እባክዎ የሪፈራል ኮዱን ያስገቡ!' : 'Please enter a referral code!',
      });
      return;
    }

    if (clean === referralCode.toUpperCase()) {
      setClaimStatus({
        type: 'error',
        message: language === 'am' ? 'የራስዎን የሪፈራል ኮድ መጠቀም አይችሉም!' : 'You cannot use your own referral code!',
      });
      return;
    }

    // Check if user already claimed a code
    const alreadyClaimed = localStorage.getItem('safari_has_claimed_ref');
    if (alreadyClaimed) {
      setClaimStatus({
        type: 'error',
        message: language === 'am' 
          ? 'ከዚህ በፊት የሪፈራል ቦነስ ወስደዋል! ተጨማሪ ቦነስ ለማግኘት ጓደኞችዎን ይጋብዙ::' 
          : 'You have already claimed a referral bonus! Invite friends to earn more.',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      // Pick random reward strictly between 1.00 and 5.00 ETB
      const reward = getRandomReferralBonus();
      localStorage.setItem('safari_has_claimed_ref', 'true');
      localStorage.setItem('safari_referred_by_code', clean);

      onClaimReferralBonus(reward, clean);
      setClaimStatus({
        type: 'success',
        message: language === 'am'
          ? `🎉 እንኳን ደስ አለዎት! ${reward.toFixed(2)} ${currency} የሪፈራል ቦነስ ወደ ዋና ሂሳብዎ ገቢ ተደርጓል!`
          : `🎉 Congratulations! ${reward.toFixed(2)} ${currency} referral bonus added to your Real Balance!`,
      });

      setInputReferralCode('');
      setIsSubmitting(false);
      soundManager.playCashout();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 px-5 py-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner">
              <Gift className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-wide">
                  {language === 'am' ? 'የሪፈራል ፕሮግራም (REFER & EARN)' : 'REFERRAL PROGRAM'}
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 shadow-sm">
                  1 - 5 ETB
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                {language === 'am' 
                  ? 'ጓደኛ ይጋብዙና ከ 1 እስከ 5 ብር ፈጣን ቦነስ ያግኙ!' 
                  : 'Invite friends & earn 1.00 to 5.00 ETB per friend!'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-black/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Hero Reward Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-orange-950/40 p-4 rounded-xl border border-amber-500/30 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === 'am' ? 'እውነተኛ የገንዘብ ስጦታ' : 'INSTANT CASH REWARD'}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-1.5">
                  <span>1.00 - 5.00</span>
                  <span className="text-base text-amber-400 font-bold">{currency}</span>
                  <span className="text-xs font-normal text-neutral-400">
                    {language === 'am' ? '/ በአንድ ሰው' : '/ per invite'}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-sm">
                  {language === 'am'
                    ? 'ጓደኞችዎ በእርስዎ ሊንክ ወይም ኮድ ሲመዘገቡ፤ ከ 1 ብር እስከ 5 ብር በቀጥታ ወደ እውነተኛ ሂሳብዎ (Real Balance) ወዲያውኑ ገቢ ይደረጋል!'
                    : 'When friends register with your referral link or code, you get from 1 to 5 ETB credited directly to your Real Balance!'}
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400">
                <Award className="w-8 h-8 text-amber-400" />
                <span className="text-[10px] font-black mt-1">100% REAL</span>
              </div>
            </div>
          </div>

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                {language === 'am' ? 'የተጋበዙ' : 'Invited'}
              </span>
              <div className="text-base font-black text-white flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                <span>{referrals.length}</span>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                {language === 'am' ? 'ያገኙት ጠቅላላ' : 'Total Earned'}
              </span>
              <div className="text-base font-black text-emerald-400 flex items-center justify-center gap-1 font-mono">
                <span>{totalEarned.toFixed(2)}</span>
                <span className="text-[10px] text-neutral-400">{currency}</span>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-center">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                {language === 'am' ? 'እያንዳንዱ' : 'Per Invite'}
              </span>
              <div className="text-sm font-black text-amber-400 flex items-center justify-center gap-0.5">
                <span>1 - 5</span>
                <span className="text-[10px] text-neutral-400">{currency}</span>
              </div>
            </div>
          </div>

          {/* User's Referral Code Card */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                {language === 'am' ? 'የእርስዎ የሪፈራል ኮድ (Referral Code)' : 'YOUR REFERRAL CODE'}
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                {language === 'am' ? 'ነፃ & ንቁ' : 'ACTIVE'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-base sm:text-lg font-mono font-black text-amber-400 tracking-wider">
                  {referralCode}
                </span>
                <span className="text-[10px] text-neutral-500 font-bold uppercase">
                  {currentUser ? currentUser.fullName.split(' ')[0] : 'GUEST'}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-neutral-700"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                <span>{copiedCode ? (language === 'am' ? 'ተቀድቷል!' : 'COPIED!') : (language === 'am' ? 'ኮድ ቅዳ' : 'COPY')}</span>
              </button>
            </div>
          </div>

          {/* Sharing Links & Buttons */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                {language === 'am' ? 'የመጋበዣ ሊንክ (Shareable Links)' : 'SHAREABLE LINKS'}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                safari-games.vercel.app
              </span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
              <span className="text-neutral-400 font-mono truncate text-[11px] select-all">
                {webLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (language === 'am' ? 'ተቀድቷል' : 'Copied') : (language === 'am' ? 'ሊንክ ቅዳ' : 'Copy Link')}</span>
              </button>
            </div>

            {/* Direct Telegram Share Button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleShareTelegram}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'am' ? 'በቴሌግራም አጋራ (Telegram)' : 'Share on Telegram'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{language === 'am' ? 'ሊንክ ኮፒ አድርግ (Copy)' : 'Copy Full Link'}</span>
              </button>
            </div>
          </div>

          {/* Have a Friend's Referral Code Section */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300">
                {language === 'am' ? 'ጓደኛ ጋብዞዎታል? የሪፈራል ኮድ ያስገቡ:' : 'Have a friend\'s referral code?'}
              </span>
              <span className="text-[10px] text-amber-400 font-bold">
                🎁 1.00 - 5.00 {currency}
              </span>
            </div>

            <form onSubmit={handleClaimFriendCode} className="flex gap-2">
              <input
                type="text"
                value={inputReferralCode}
                onChange={(e) => setInputReferralCode(e.target.value)}
                placeholder={language === 'am' ? 'ምሳሌ: SAFARI1234' : 'e.g. SAFARI1234'}
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 font-mono outline-none uppercase focus:border-amber-500 transition"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 active:scale-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>{language === 'am' ? 'ቦነስ ውሰድ' : 'Claim'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {claimStatus && (
              <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                claimStatus.type === 'success' 
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700' 
                  : 'bg-red-950/80 text-red-300 border border-red-700'
              }`}>
                {claimStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{claimStatus.message}</span>
              </div>
            )}
          </div>

          {/* Referral History / Friends List */}
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                {language === 'am' ? 'የተጋበዙ ጓደኞች ታሪክ' : 'REFERRAL HISTORY'}
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                {referrals.length} {language === 'am' ? 'ጓደኞች' : 'friends'}
              </span>
            </div>

            {referrals.length === 0 ? (
              <div className="py-6 text-center text-neutral-500 space-y-1">
                <Users className="w-8 h-8 mx-auto text-neutral-600 mb-1" />
                <p className="text-xs text-neutral-400">
                  {language === 'am' ? 'እስካሁን የተመዘገበ ጓደኛ የለም::' : 'No friends invited yet.'}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {language === 'am' 
                    ? 'የመጋበዣ ሊንክዎን ለጓደኞችዎ ያጋሩና ለእያንዳንዱ ከ 1 - 5 ብር ያግኙ!' 
                    : 'Share your link to earn 1 to 5 ETB for each friend!'}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {referrals.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between bg-neutral-900 border border-neutral-800/80 px-3 py-2 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                        {rec.referredName.charAt(0) || 'U'}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{rec.referredName}</span>
                        <span className="text-[10px] text-neutral-500">
                          {new Date(rec.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-emerald-400 block text-xs">
                        +{rec.amountEarned.toFixed(2)} {currency}
                      </span>
                      <span className="text-[9px] text-neutral-500 uppercase">
                        {language === 'am' ? 'የተከፈለ' : 'PAID'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Explanatory Rules */}
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/60 text-[11px] text-neutral-400 space-y-1">
            <span className="font-bold text-neutral-300 block">
              📌 {language === 'am' ? 'የሪፈራል ደንቦች:' : 'Referral Rules:'}
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[10.5px]">
              <li>
                {language === 'am' 
                  ? 'ቦነሱ ወዲያውኑ ወደ እውነተኛ ሂሳብዎ (Real Balance) ገቢ ይደረጋል::' 
                  : 'Bonus is credited instantly to your Real Balance.'}
              </li>
              <li>
                {language === 'am' 
                  ? 'ገንዘቡን ለጨዋታ መወራረድ ወይም በቴሌብር ማውጣት ይችላሉ::' 
                  : 'You can use the funds to bet or withdraw via Telebirr.'}
              </li>
              <li>
                {language === 'am' 
                  ? 'ገደብ የለውም! የፈለጉትን ያህል ጓደኞች በመጋበዝ ገቢዎን ያሳድጉ::' 
                  : 'No limits! Invite unlimited friends and grow your balance.'}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA if guest */}
        {!currentUser && (
          <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3">
            <span className="text-xs text-neutral-400">
              {language === 'am' ? 'የራስዎን ሊንክ ለማግኘት ይመዝገቡ:' : 'Register to get your unique code:'}
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 hover:brightness-110 text-white font-bold text-xs rounded-lg transition"
            >
              {language === 'am' ? 'ይመዝገቡ (REGISTER)' : 'REGISTER'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
