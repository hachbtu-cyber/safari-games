import React, { useState } from 'react';
import { 
  X, UserPlus, LogIn, Phone, Lock, User, 
  ShieldCheck, AlertCircle, Sparkles, CheckCircle2, Gift
} from 'lucide-react';
import { UserProfile } from '../types';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  canDismiss?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  canDismiss = true,
}) => {
  const [tab, setTab] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState<string>(() => {
    return localStorage.getItem('safari_pending_ref') || '';
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 9) {
      setError('እባክዎ ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (ምሳሌ: 0911223344)!');
      return;
    }

    if (!fullName.trim()) {
      setError('እባክዎ ሙሉ ስምዎን ያስገቡ!');
      return;
    }

    if (!password || password.length < 4) {
      setError('የይለፍ ቃል ቢያንስ 4 ፊደላት ወይም ቁጥሮች መሆን አለበት!');
      return;
    }

    // Check if phone already registered in localStorage
    const savedUsers: UserProfile[] = JSON.parse(localStorage.getItem('safari_users') || '[]');
    const existing = savedUsers.find((u) => u.phoneNumber === cleanPhone);

    if (existing) {
      setError('ይህ ስልክ ቁጥር ከዚህ በፊት ተመዝግቧል! እባክዎ "ይግቡ (LOGIN)" የሚለውን ይጫኑ::');
      return;
    }

    const cleanRefCode = referralCodeInput.trim().toUpperCase();

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: fullName.trim(),
      phoneNumber: cleanPhone,
      password,
      registeredAt: Date.now(),
      referredBy: cleanRefCode || undefined,
    };

    savedUsers.push(newUser);
    localStorage.setItem('safari_users', JSON.stringify(savedUsers));
    localStorage.setItem('safari_current_user', JSON.stringify(newUser));
    localStorage.removeItem('safari_pending_ref');

    soundManager.playCashout();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    onLoginSuccess(newUser);
    onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.trim();
    const savedUsers: UserProfile[] = JSON.parse(localStorage.getItem('safari_users') || '[]');
    const user = savedUsers.find((u) => u.phoneNumber === cleanPhone);

    if (!user) {
      // Auto-register demo account or prompt to register
      setError('ይህ ስልክ ቁጥር አልተገኘም! እባክዎ "አካውንት ይክፈቱ (REGISTER)" የሚለውን ይምረጡ::');
      return;
    }

    if (user.password && user.password !== password) {
      setError('የተሳሳተ የይለፍ ቃል አስገብተዋል!');
      return;
    }

    localStorage.setItem('safari_current_user', JSON.stringify(user));
    soundManager.playClick();
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="bg-neutral-950 border-b border-neutral-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white font-black shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>SAFARI GAME CASINO</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800">
                  ETHIOPIA
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                {tab === 'REGISTER' ? 'አዲስ የሳፋሪ አካውንት ይክፈቱ' : 'ወደ ሳፋሪ አካውንትዎ ይግቡ'}
              </p>
            </div>
          </div>

          {canDismiss && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-neutral-950 border-b border-neutral-800 p-1 gap-1">
          <button
            type="button"
            onClick={() => {
              setTab('REGISTER');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              tab === 'REGISTER'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>አካውንት ይክፈቱ (REGISTER)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('LOGIN');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
              tab === 'LOGIN'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>ይግቡ (LOGIN)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'REGISTER' ? (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  ሙሉ ስም (Full Name):
                </label>
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 focus-within:border-orange-500 transition">
                  <User className="w-4 h-4 text-neutral-500 mr-2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ምሳሌ: አበበ ከበደ"
                    className="w-full bg-transparent text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  የቴሌብር ስልክ ቁጥር (Phone Number):
                </label>
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 focus-within:border-orange-500 transition">
                  <Phone className="w-4 h-4 text-neutral-500 mr-2" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09... ወይም 07..."
                    className="w-full bg-transparent text-sm font-mono text-white outline-none"
                  />
                </div>
                <span className="text-[10px] text-neutral-500 mt-0.5 block">
                  ለቴሌብር ተቀማጭና ክፍያ የሚያገለግል ትክክለኛ ስልክ ቁጥር
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  የይለፍ ቃል (Password / PIN):
                </label>
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 focus-within:border-orange-500 transition">
                  <Lock className="w-4 h-4 text-neutral-500 mr-2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ሚስጥር ቃል ያስገቡ..."
                    className="w-full bg-transparent text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    <span>የሪፈራል ኮድ (Referral Code) - አማራጭ</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">
                    🎁 1 - 5 ETB ቦነስ
                  </span>
                </div>
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 focus-within:border-amber-500 transition">
                  <Gift className="w-4 h-4 text-neutral-500 mr-2" />
                  <input
                    type="text"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                    placeholder="ምሳሌ: SAFARI1234"
                    className="w-full bg-transparent text-sm font-mono text-white outline-none uppercase placeholder-neutral-600"
                  />
                </div>
                <span className="text-[10px] text-neutral-500 mt-0.5 block">
                  ጓደኛ ጋብዞዎት ከሆነ ኮዱን በማስገባት ከ 1 እስከ 5 ብር ፈጣን ቦነስ ያግኙ!
                </span>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px] text-neutral-400">
                <span className="font-bold text-emerald-400 block mb-0.5">
                  ✓ የመጀመሪያ ሂሳብ 0.00 ብር (0 ETB):
                </span>
                አካውንት ከከፈቱ በኋላ በቴሌብር ወደ <strong>0932335247</strong> ብር በማስገባት መወራረድ ይችላሉ::
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-950/40 transition cursor-pointer"
              >
                አካውንት ይክፈቱና ይጀምሩ (CREATE ACCOUNT)
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  ስልክ ቁጥር (Phone Number):
                </label>
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 focus-within:border-orange-500 transition">
                  <Phone className="w-4 h-4 text-neutral-500 mr-2" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09... ወይም 07..."
                    className="w-full bg-transparent text-sm font-mono text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  የይለፍ ቃል (Password):
                </label>
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 focus-within:border-orange-500 transition">
                  <Lock className="w-4 h-4 text-neutral-500 mr-2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="የይለፍ ቃል..."
                    className="w-full bg-transparent text-sm text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 active:scale-95 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer"
              >
                ይግቡ (LOGIN TO ACCOUNT)
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
