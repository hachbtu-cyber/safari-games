import React, { useState } from 'react';
import { History, ChevronDown, CheckCircle2, Shield } from 'lucide-react';
import { PastRound } from '../types';

interface HistoryBarProps {
  rounds: PastRound[];
  onSelectRound: (round: PastRound) => void;
}

export const HistoryBar: React.FC<HistoryBarProps> = ({ rounds, onSelectRound }) => {
  const [showStats, setShowStats] = useState(false);

  // Calculate quick stats over past rounds
  const total = rounds.length;
  const under2x = rounds.filter((r) => r.multiplier < 2.0).length;
  const between2and10x = rounds.filter((r) => r.multiplier >= 2.0 && r.multiplier < 10.0).length;
  const over10x = rounds.filter((r) => r.multiplier >= 10.0).length;
  const highest = rounds.length > 0 ? Math.max(...rounds.map((r) => r.multiplier)) : 0;

  return (
    <div className="bg-neutral-950/80 border-b border-neutral-800/80 px-2 py-1.5 flex items-center gap-2 select-none relative">
      {/* Icon & Label */}
      <div className="flex items-center gap-1 text-neutral-400 text-xs font-semibold px-2 shrink-0">
        <History className="w-3.5 h-3.5 text-orange-400" />
        <span className="hidden sm:inline">ROUNDS:</span>
      </div>

      {/* Horizontal pill list */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 mask-linear-fade">
        {rounds.slice(0, 30).map((round) => {
          const isGold = round.multiplier >= 10.0;
          const isPurple = round.multiplier >= 2.0 && round.multiplier < 10.0;
          const isBlue = round.multiplier < 2.0;

          let pillClass = 'bg-blue-950/60 text-blue-400 border-blue-800/60 hover:bg-blue-900/60';
          if (isPurple) {
            pillClass = 'bg-purple-950/70 text-purple-300 border-purple-700/60 hover:bg-purple-900/60';
          } else if (isGold) {
            pillClass = 'bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-amber-500/20 text-amber-300 border-amber-500/70 shadow-sm shadow-amber-500/20 font-extrabold hover:brightness-125';
          }

          return (
            <button
              key={round.id}
              onClick={() => onSelectRound(round)}
              className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border transition-all duration-150 transform hover:scale-105 active:scale-95 ${pillClass}`}
              title={`Crash @ ${round.multiplier.toFixed(2)}x - Click to verify Provably Fair`}
            >
              {round.multiplier.toFixed(2)}x
            </button>
          );
        })}
      </div>

      {/* Stats Dropdown Trigger */}
      <button
        onClick={() => setShowStats(!showStats)}
        className="px-2 py-1 text-xs text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded border border-neutral-800 flex items-center gap-1 shrink-0 transition"
        title="View Multiplier Statistics"
      >
        <span className="font-mono text-[11px] text-amber-400 font-bold hidden sm:inline">
          MAX: {highest.toFixed(2)}x
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${showStats ? 'rotate-180' : ''}`} />
      </button>

      {/* Stats Popup */}
      {showStats && (
        <div className="absolute top-full right-2 mt-1 z-50 w-72 bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Round Statistics (Last {total})
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Provably Fair
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span>Under 2.00x:</span>
              </div>
              <span className="font-mono font-bold text-neutral-200">
                {under2x} ({total > 0 ? Math.round((under2x / total) * 100) : 0}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                <span>2.00x - 9.99x:</span>
              </div>
              <span className="font-mono font-bold text-neutral-200">
                {between2and10x} ({total > 0 ? Math.round((between2and10x / total) * 100) : 0}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>10.00x & Above:</span>
              </div>
              <span className="font-mono font-bold text-amber-300">
                {over10x} ({total > 0 ? Math.round((over10x / total) * 100) : 0}%)
              </span>
            </div>

            <div className="pt-2 mt-2 border-t border-neutral-800 flex items-center justify-between text-neutral-300">
              <span>All-Round High:</span>
              <span className="font-mono font-black text-amber-400 text-sm">
                {highest.toFixed(2)}x
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
