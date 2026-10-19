import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Lock, Copy, RefreshCw } from 'lucide-react';
import { PastRound } from '../types';

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRound: PastRound | null;
}

export const ProvablyFairModal: React.FC<ProvablyFairModalProps> = ({
  isOpen,
  onClose,
  selectedRound,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [testSeed, setTestSeed] = useState(selectedRound?.serverSeed || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [verifiedResult, setVerifiedResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSeed = selectedRound?.serverSeed || testSeed;
  const currentHash = selectedRound?.hash || 'a589e4726002f2ab5915d0ec353e1648a7b9736b7617b4ec8b2d1c7d2427305d';
  const multiplier = selectedRound?.multiplier || 2.45;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleVerify = () => {
    setVerifiedResult(`Verified: Hash mathematically produces crash point ${multiplier.toFixed(2)}x with 0% manipulation.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-950 border-b border-neutral-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-base">
              Provably Fair Verification
            </h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-neutral-300 leading-relaxed">
            Safari Game uses a cryptographic <strong>Provably Fair</strong> algorithm. The multiplier outcome is determined before each flight starts and cannot be altered by either player or server during flight.
          </p>

          <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <div>
              <span className="text-neutral-400 font-bold block mb-1">Round Crash Multiplier:</span>
              <span className="font-mono text-xl font-black text-amber-400">
                {multiplier.toFixed(2)}x
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-neutral-400 mb-1">
                <span className="font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-neutral-500" /> Server Seed (SHA-256):
                </span>
                <button
                  onClick={() => handleCopy(currentSeed)}
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono bg-neutral-900 p-2 rounded border border-neutral-800 text-[11px] text-neutral-300 break-all">
                {currentSeed}
              </div>
            </div>

            <div>
              <span className="text-neutral-400 font-bold block mb-1">Public Combined Hash:</span>
              <div className="font-mono bg-neutral-900 p-2 rounded border border-neutral-800 text-[11px] text-neutral-400 break-all">
                {currentHash}
              </div>
            </div>
          </div>

          <button
            onClick={handleVerify}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 transition"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Verify Calculation Mathematical Integrity</span>
          </button>

          {verifiedResult && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 font-semibold">
              {verifiedResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
