import React, { useState } from 'react';
import { Minus, Plus, Zap, Check, ArrowDownCircle } from 'lucide-react';
import { Currency, GameStatus, UserBet } from '../types';

interface BetPanelProps {
  panelId: 1 | 2;
  userBet: UserBet;
  currentMultiplier: number;
  gameStatus: GameStatus;
  balance: number;
  currency: Currency;
  language: 'en' | 'am';
  onPlaceBet: (panelId: 1 | 2, amount: number, autoCashout: boolean, autoMult: number, isAutoBet: boolean) => void;
  onCancelBet: (panelId: 1 | 2) => void;
  onCashOut: (panelId: 1 | 2) => void;
}

export const BetPanel: React.FC<BetPanelProps> = ({
  panelId,
  userBet,
  currentMultiplier,
  gameStatus,
  balance,
  currency,
  language,
  onPlaceBet,
  onCancelBet,
  onCashOut,
}) => {
  const [tab, setTab] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [amount, setAmount] = useState<number>(userBet.amount || 20);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState<boolean>(userBet.autoCashout || false);
  const [autoCashoutMult, setAutoCashoutMult] = useState<number>(userBet.autoCashoutMultiplier || 2.0);
  const [autoBetEnabled, setAutoBetEnabled] = useState<boolean>(userBet.isAutoBet || false);

  const quickChips = [10, 20, 50, 100, 500, 1000];

  const handleAdjustAmount = (delta: number) => {
    setAmount((prev) => Math.max(1, Math.min(balance || 50000, Math.round(prev + delta))));
  };

  const handleSetQuickChip = (chip: number) => {
    setAmount(chip);
  };

  const handleActionClick = () => {
    // If round is flying and user has active bet -> Cash Out!
    if (gameStatus === 'FLYING' && userBet.status === 'ACTIVE') {
      onCashOut(panelId);
      return;
    }

    // If bet is placed for next round or active waiting -> Cancel!
    if (userBet.status === 'PLACED_FOR_NEXT') {
      onCancelBet(panelId);
      return;
    }

    // Otherwise place bet!
    onPlaceBet(panelId, amount, autoCashoutEnabled, autoCashoutMult, autoBetEnabled);
  };

  // Determine current win value if in flight
  const liveWinAmount = (amount * currentMultiplier);

  // Button state styling
  const isBetActive = userBet.status === 'ACTIVE' && gameStatus === 'FLYING';
  const isWaitingNext = userBet.status === 'PLACED_FOR_NEXT';

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-xl backdrop-blur-sm select-none">
      {/* Top Header: Tabs (Bet / Auto) */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800/80">
          <button
            onClick={() => setTab('MANUAL')}
            className={`text-xs font-bold px-3 py-1 rounded transition ${
              tab === 'MANUAL'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {language === 'am' ? 'በእጅ (Manual)' : 'MANUAL'}
          </button>
          <button
            onClick={() => setTab('AUTO')}
            className={`text-xs font-bold px-3 py-1 rounded transition flex items-center gap-1 ${
              tab === 'AUTO'
                ? 'bg-orange-600 text-white shadow'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>AUTO</span>
          </button>
        </div>

        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          <span>BET #{panelId}</span>
        </div>
      </div>

      {/* Main Grid: Controls + Big Button */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Left Side: Amount adjustment + Chips */}
        <div className="sm:col-span-7 flex flex-col gap-2">
          {/* Amount Stepper Input */}
          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-1 focus-within:border-orange-500 transition">
            <button
              onClick={() => handleAdjustAmount(-10)}
              disabled={isBetActive}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white active:scale-90 transition disabled:opacity-40"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex-1 px-2 text-center">
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                disabled={isBetActive}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
                className="w-full bg-transparent text-center font-mono font-black text-lg sm:text-xl text-white outline-none"
              />
              <span className="text-[10px] text-neutral-400 block -mt-1 font-semibold">
                {currency}
              </span>
            </div>

            <button
              onClick={() => handleAdjustAmount(10)}
              disabled={isBetActive}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white active:scale-90 transition disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="grid grid-cols-6 gap-1">
            {quickChips.map((chip) => (
              <button
                key={chip}
                onClick={() => handleSetQuickChip(chip)}
                disabled={isBetActive}
                className={`py-1 rounded text-[11px] font-mono font-bold transition ${
                  amount === chip
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                    : 'bg-neutral-950/80 text-neutral-400 border border-neutral-800/80 hover:text-white hover:bg-neutral-800'
                } disabled:opacity-40`}
              >
                +{chip}
              </button>
            ))}
          </div>

          {/* Auto Cashout Options */}
          {tab === 'AUTO' && (
            <div className="mt-1 pt-2 border-t border-neutral-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Auto Cashout Toggle & Multiplier */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 font-semibold">
                  <input
                    type="checkbox"
                    checked={autoCashoutEnabled}
                    onChange={(e) => setAutoCashoutEnabled(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                  <span>Auto Cash Out</span>
                </label>
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded px-2 py-0.5">
                  <input
                    type="number"
                    step="0.1"
                    min="1.01"
                    max="100"
                    value={autoCashoutMult}
                    onChange={(e) => setAutoCashoutMult(Math.max(1.01, Number(e.target.value) || 1.1))}
                    disabled={!autoCashoutEnabled}
                    className="w-14 bg-transparent font-mono text-center font-bold text-white text-xs outline-none disabled:opacity-40"
                  />
                  <span className="text-[10px] text-neutral-400 font-bold">x</span>
                </div>
              </div>

              {/* Auto Bet Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 font-semibold">
                <input
                  type="checkbox"
                  checked={autoBetEnabled}
                  onChange={(e) => setAutoBetEnabled(e.target.checked)}
                  className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                />
                <span>Auto Bet</span>
              </label>
            </div>
          )}
        </div>

        {/* Right Side: The BIG Action Button */}
        <div className="sm:col-span-5 h-full flex flex-col justify-center">
          {/* Active In-Flight Cash Out Button */}
          {isBetActive ? (
            <button
              onClick={handleActionClick}
              className="w-full h-18 sm:h-22 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-neutral-950 font-black shadow-lg shadow-orange-500/40 border border-amber-300/60 transition-all flex flex-col items-center justify-center p-2 animate-pulse cursor-pointer"
            >
              <div className="flex items-center gap-1 text-xs font-black tracking-widest uppercase">
                <ArrowDownCircle className="w-4 h-4 animate-bounce" />
                <span>{language === 'am' ? 'ገንዘብ ማውጣት' : 'CASH OUT'}</span>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black tracking-tight text-neutral-950">
                {liveWinAmount.toFixed(2)} {currency}
              </div>
              <div className="text-[11px] font-bold text-neutral-900/80 -mt-0.5">
                @{currentMultiplier.toFixed(2)}x
              </div>
            </button>
          ) : isWaitingNext ? (
            /* Cancel queued bet button */
            <button
              onClick={handleActionClick}
              className="w-full h-18 sm:h-22 rounded-2xl bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 active:scale-95 text-white font-black shadow-lg shadow-red-950/40 border border-red-500/40 transition-all flex flex-col items-center justify-center p-2 cursor-pointer"
            >
              <span className="text-sm uppercase tracking-wider font-extrabold">
                {language === 'am' ? 'ሰርዝ' : 'CANCEL'}
              </span>
              <span className="font-mono text-xs text-red-200">
                {userBet.amount} {currency}
              </span>
              <span className="text-[10px] text-red-300/80">
                {language === 'am' ? 'ለሚቀጥለው ዙር ተመዝግቧል' : 'Waiting for next round'}
              </span>
            </button>
          ) : (
            /* Standard Place Bet Button */
            <button
              onClick={handleActionClick}
              disabled={balance < amount}
              className={`w-full h-18 sm:h-22 rounded-2xl font-black shadow-lg transition-all flex flex-col items-center justify-center p-2 cursor-pointer active:scale-95 ${
                balance < amount
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                  : gameStatus === 'WAITING'
                  ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:brightness-110 text-neutral-950 shadow-emerald-950/50 border border-emerald-400/50'
                  : 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:brightness-110 text-white shadow-orange-950/50 border border-orange-400/40'
              }`}
            >
              <span className="text-base sm:text-lg uppercase tracking-wider font-black">
                {gameStatus === 'WAITING'
                  ? (language === 'am' ? 'ተወራረድ' : 'BET')
                  : (language === 'am' ? 'ለቀጣዩ ዙር ተወራረድ' : 'BET (NEXT ROUND)')}
              </span>
              <span className="font-mono text-sm sm:text-base font-extrabold">
                {amount} {currency}
              </span>
              {balance < amount && (
                <span className="text-[10px] text-red-400 font-bold mt-0.5">
                  {language === 'am' ? 'ተቀማጭ ያድርጉ!' : 'Low Balance - Deposit'}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Round result banner if cashed out or crashed */}
      {userBet.status === 'CASHED_OUT' && (
        <div className="mt-2 py-1 px-3 bg-emerald-950/80 border border-emerald-600/50 rounded-lg flex items-center justify-between text-xs text-emerald-300 animate-fade-in">
          <div className="flex items-center gap-1.5 font-bold">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'am' ? 'አሸንፈዋል!' : 'YOU WON!'}</span>
          </div>
          <div className="font-mono font-black text-emerald-400">
            +{userBet.winAmount?.toFixed(2)} {currency} (@{userBet.cashedOutMultiplier?.toFixed(2)}x)
          </div>
        </div>
      )}
    </div>
  );
};
