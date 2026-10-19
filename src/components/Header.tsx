import React from 'react';
import { 
  Volume2, VolumeX, HelpCircle, ShieldCheck, 
  Wallet, RefreshCw, PlusCircle, Globe, User, LogOut, Sparkles, Gift
} from 'lucide-react';
import { Currency, ActiveGame, UserProfile } from '../types';

interface HeaderProps {
  realBalance: number;
  demoBalance: number;
  isDemoMode: boolean;
  currency: Currency;
  isMuted: boolean;
  language: 'en' | 'am';
  activeGame: ActiveGame;
  currentUser: UserProfile | null;
  isTelegram?: boolean;
  onOpenTelegramBot?: () => void;
  onOpenReferral?: () => void;
  onSelectGame: (game: ActiveGame) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onToggleDemoMode: () => void;
  onOpenDeposit: () => void;
  onReloadDemo: () => void;
  onToggleMute: () => void;
  onOpenHowToPlay: () => void;
  onOpenProvablyFair: () => void;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  realBalance,
  demoBalance,
  isDemoMode,
  currency,
  isMuted,
  language,
  activeGame,
  currentUser,
  isTelegram,
  onOpenTelegramBot,
  onOpenReferral,
  onSelectGame,
  onOpenAuth,
  onLogout,
  onToggleDemoMode,
  onOpenDeposit,
  onReloadDemo,
  onToggleMute,
  onOpenHowToPlay,
  onOpenProvablyFair,
  onToggleLanguage,
}) => {
  const currentBalance = isDemoMode ? demoBalance : realBalance;

  return (
    <header className="bg-neutral-950 border-b border-neutral-800/80 px-2 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 select-none">
      {/* Left: Brand Logo & Game Selector Tabs */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-500 shadow-lg shadow-orange-950/50 border border-orange-400/40">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white transform -rotate-12 drop-shadow-md"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-neutral-900" />
          </div>

          <div>
            <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 bg-clip-text text-transparent drop-shadow">
              SAFARI GAME
            </span>
          </div>
        </div>

        {/* Game Switcher Tabs (Aviator vs Chicken Road) */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-0.5">
          <button
            onClick={() => onSelectGame('AVIATOR')}
            className={`px-2.5 py-1 text-xs font-black rounded-lg transition flex items-center gap-1 ${
              activeGame === 'AVIATOR'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>✈️</span>
            <span className="hidden sm:inline">AVIATOR</span>
          </button>

          <button
            onClick={() => onSelectGame('CHICKEN_ROAD')}
            className={`px-2.5 py-1 text-xs font-black rounded-lg transition flex items-center gap-1.5 ${
              activeGame === 'CHICKEN_ROAD'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>🐔</span>
            <span>CHICKEN ROAD</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-red-600 text-white font-black animate-pulse">
              NEW
            </span>
          </button>
        </div>
      </div>

      {/* Center: Wallet Balance & Mode Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className="flex items-center bg-neutral-900/90 border border-neutral-800 rounded-lg p-1 sm:p-1.5 shadow-inner">
          <button
            onClick={onToggleDemoMode}
            className={`text-xs px-2 sm:px-2.5 py-1 rounded font-semibold transition-all ${
              isDemoMode
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Demo Mode"
          >
            <span>DEMO</span>
          </button>

          <button
            onClick={onToggleDemoMode}
            className={`text-xs px-2 sm:px-2.5 py-1 rounded font-semibold transition-all flex items-center gap-1 ${
              !isDemoMode
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Real Wallet"
          >
            <Wallet className="w-3 h-3" />
            <span>REAL</span>
          </button>

          <div className="mx-2 sm:mx-3 text-right">
            <div className="text-[9px] text-neutral-400 uppercase tracking-wider font-medium">
              {isDemoMode ? (language === 'am' ? 'ዴሞ ሂሳብ' : 'Demo') : (language === 'am' ? 'ዋና ሂሳብ' : 'Real Balance')}
            </div>
            <div className="font-mono font-bold text-xs sm:text-base text-white flex items-center justify-end gap-1">
              <span>{currentBalance.toFixed(2)}</span>
              <span className="text-xs text-orange-400 font-bold">{currency}</span>
            </div>
          </div>

          {isDemoMode && (
            <button
              onClick={onReloadDemo}
              className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded transition"
              title="Reload Demo Credits"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onOpenDeposit}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-neutral-950 font-black text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-md shadow-md active:scale-95 transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{language === 'am' ? 'ተቀማጭ' : 'DEPOSIT'}</span>
          </button>

          {/* Referral Program Button */}
          {onOpenReferral && (
            <button
              onClick={onOpenReferral}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:brightness-110 text-white font-black text-xs sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-md shadow-md active:scale-95 transition cursor-pointer border border-amber-300/30"
              title={language === 'am' ? 'ጓደኛ ይጋብዙና ከ 1 እስከ 5 ብር ቦነስ ያግኙ!' : 'Refer Friends & Earn 1-5 ETB!'}
            >
              <Gift className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              <span>{language === 'am' ? 'ሪፈራል' : 'REFERRAL'}</span>
              <span className="bg-black/40 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-amber-400/40">
                1-5 ብር
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: User Account + Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* User Account / Auth Button */}
        {currentUser ? (
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-1 gap-1.5">
            <div className="w-6 h-6 rounded-full bg-orange-600/30 text-orange-400 flex items-center justify-center font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-left hidden md:block">
              <span className="text-[11px] font-bold text-white block leading-tight">
                {currentUser.fullName}
              </span>
              <span className="text-[9px] text-neutral-400 font-mono">
                {currentUser.phoneNumber}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-1 text-neutral-400 hover:text-red-400 rounded transition"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
          >
            <User className="w-3.5 h-3.5 text-orange-400" />
            <span>{language === 'am' ? 'አካውንት ይክፈቱ' : 'REGISTER'}</span>
          </button>
        )}


        {/* Language switch */}
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded transition"
          title="Switch Language (English / አማርኛ)"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="font-bold">{language === 'en' ? 'አማ' : 'EN'}</span>
        </button>

        {/* Provably Fair */}
        <button
          onClick={onOpenProvablyFair}
          className="p-1.5 text-neutral-400 hover:text-emerald-400 bg-neutral-900 border border-neutral-800 rounded transition"
          title="Provably Fair"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        {/* How to play */}
        <button
          onClick={onOpenHowToPlay}
          className="p-1.5 text-neutral-400 hover:text-orange-400 bg-neutral-900 border border-neutral-800 rounded transition"
          title="How to Play"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleMute}
          className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded transition"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>
    </header>
  );
};
