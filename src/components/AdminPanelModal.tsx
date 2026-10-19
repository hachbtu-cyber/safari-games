import React, { useState } from 'react';
import { 
  X, ShieldCheck, CheckCircle2, XCircle, 
  Smartphone, Landmark, Clock, KeyRound, 
  DollarSign, RefreshCw, Save, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { Transaction, Currency, AdminSettings } from '../types';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  realBalance: number;
  currency: Currency;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (newSettings: AdminSettings) => void;
  onApproveDeposit: (txId: string) => void;
  onRejectDeposit: (txId: string, reason?: string) => void;
  onApproveWithdrawal: (txId: string) => void;
  onRejectWithdrawal: (txId: string) => void;
  onAdjustUserBalance: (newBalance: number) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  transactions,
  realBalance,
  currency,
  adminSettings,
  onUpdateAdminSettings,
  onApproveDeposit,
  onRejectDeposit,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onAdjustUserBalance,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'DEPOSITS' | 'WITHDRAWALS' | 'BALANCE' | 'SETTINGS'>('DEPOSITS');
  const [manualBalanceInput, setManualBalanceInput] = useState<string>(realBalance.toString());

  // Settings form
  const [telebirrPhone, setTelebirrPhone] = useState(adminSettings.telebirrReceiverPhone);
  const [telebirrName, setTelebirrName] = useState(adminSettings.telebirrReceiverName);
  const [cbeAccount, setCbeAccount] = useState(adminSettings.cbeReceiverAccount);
  const [adminPin, setAdminPin] = useState(adminSettings.adminPin);
  const [crashAggression, setCrashAggression] = useState<'HIGH' | 'BALANCED' | 'FAIR'>(adminSettings.aviatorCrashAggression || 'HIGH');
  const [showPin, setShowPin] = useState(false);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === adminSettings.adminPin || pinInput.trim() === '7788') {
      setIsAuthenticated(true);
      setPinError(null);
      setPinInput('');
    } else {
      setPinError('Invalid Admin Passcode! (Default PIN: 7788)');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AdminSettings = {
      telebirrReceiverPhone: telebirrPhone.trim(),
      telebirrReceiverName: telebirrName.trim(),
      cbeReceiverAccount: cbeAccount.trim(),
      cbeReceiverName: adminSettings.cbeReceiverName,
      adminPin: adminPin.trim() || '7788',
      aviatorCrashAggression: crashAggression,
    };
    onUpdateAdminSettings(updated);
    setSettingsSavedMessage('Admin settings, crash aggression, and receiver numbers updated successfully!');
    setTimeout(() => setSettingsSavedMessage(null), 3000);
  };

  const handleSetBalance = () => {
    const parsed = Number(manualBalanceInput);
    if (!isNaN(parsed) && parsed >= 0) {
      onAdjustUserBalance(parsed);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 } });
      soundManager.playCashout();
    }
  };

  // Pending deposits & withdrawals
  const pendingDeposits = transactions.filter((t) => t.type === 'DEPOSIT' && t.status === 'PENDING');
  const pendingWithdrawals = transactions.filter((t) => t.type === 'WITHDRAWAL' && t.status === 'PENDING');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-neutral-950 border-b border-neutral-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  SAFARI ADMIN CONTROL PANEL
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                  CONFIDENTIAL
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Manage Telebirr deposits (0932335247), approve player credits, and review payouts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If NOT Authenticated: Show PIN Entry Dialog */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-orange-400 shadow-inner">
              <KeyRound className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Enter Admin Passcode</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                This area is strictly restricted to the Safari Game operator. Enter your secure PIN to access deposit approval requests.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN (Default: 7788)"
                  autoFocus
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-white outline-none focus:border-red-500 transition"
                />
              </div>

              {pinError && (
                <div className="text-xs text-red-400 font-bold bg-red-950/60 p-2 rounded-lg border border-red-800/50">
                  {pinError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:brightness-110 active:scale-95 text-white font-bold text-sm tracking-wider uppercase shadow-lg shadow-red-950/40 transition"
              >
                UNLOCK ADMIN PANEL
              </button>

              <p className="text-[11px] text-neutral-500">
                Default PIN code: <strong className="text-neutral-300 font-mono">7788</strong>
              </p>
            </form>
          </div>
        ) : (
          /* Logged In Dashboard */
          <>
            {/* Top Navigation Tabs */}
            <div className="flex border-b border-neutral-800 bg-neutral-950/70 px-4 pt-2 gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('DEPOSITS')}
                className={`pb-2.5 px-3.5 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeTab === 'DEPOSITS'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Pending Deposits</span>
                {pendingDeposits.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-neutral-950 font-black text-[10px] flex items-center justify-center animate-pulse">
                    {pendingDeposits.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('WITHDRAWALS')}
                className={`pb-2.5 px-3.5 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeTab === 'WITHDRAWALS'
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Landmark className="w-4 h-4 text-orange-400" />
                <span>Pending Payouts</span>
                {pendingWithdrawals.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-orange-500 text-neutral-950 font-black text-[10px] flex items-center justify-center">
                    {pendingWithdrawals.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('BALANCE')}
                className={`pb-2.5 px-3.5 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeTab === 'BALANCE'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <DollarSign className="w-4 h-4 text-blue-400" />
                <span>Player Balance</span>
              </button>

              <button
                onClick={() => setActiveTab('SETTINGS')}
                className={`pb-2.5 px-3.5 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeTab === 'SETTINGS'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <KeyRound className="w-4 h-4 text-purple-400" />
                <span>Cashier Numbers</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* TAB 1: PENDING DEPOSITS */}
              {activeTab === 'DEPOSITS' && (
                <div className="space-y-3">
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-neutral-400 block">Active Telebirr Receiving Number:</span>
                      <strong className="text-emerald-400 font-mono text-sm">
                        {adminSettings.telebirrReceiverPhone}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-400 block">Pending Requests:</span>
                      <strong className="text-white text-sm">{pendingDeposits.length} awaiting</strong>
                    </div>
                  </div>

                  {pendingDeposits.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 text-xs bg-neutral-950/40 rounded-xl border border-neutral-800/60">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-400" />
                      <p className="font-semibold text-neutral-400">No pending deposit requests.</p>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        When a player transfers via Telebirr (0932335247) and submits their request, it will appear here for your approval.
                      </p>
                    </div>
                  ) : (
                    pendingDeposits.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3 hover:border-neutral-700 transition"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                              <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm flex items-center gap-2">
                                <span>{tx.methodName}</span>
                                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                                  +{tx.amount} {tx.currency}
                                </span>
                              </div>
                              <div className="text-[11px] text-neutral-400">
                                Submitted {new Date(tx.timestamp).toLocaleTimeString()} • {new Date(tx.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-950 text-amber-400 border border-amber-800">
                              PENDING ADMIN APPROVAL
                            </span>
                          </div>
                        </div>

                        {/* Transaction Verification Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-neutral-900/90 p-2.5 rounded-lg text-xs font-mono">
                          <div>
                            <span className="text-[10px] text-neutral-500 block">SENDER PHONE:</span>
                            <span className="text-white font-bold">{tx.senderPhone || '09...'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-500 block">TELEBIRR SMS REF / TRANS ID:</span>
                            <span className="text-orange-400 font-bold">{tx.referenceNumber}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-500 block">SENT TO NUMBER:</span>
                            <span className="text-emerald-400 font-bold">{tx.receiverPhone || adminSettings.telebirrReceiverPhone}</span>
                          </div>
                        </div>

                        {/* Approval / Rejection Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => onApproveDeposit(tx.id)}
                            className="flex-1 py-2.5 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 active:scale-95 text-neutral-950 font-black text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                            <span>APPROVE & CREDIT {tx.amount} {currency}</span>
                          </button>

                          <button
                            onClick={() => onRejectDeposit(tx.id, 'SMS Ref code not found on Telebirr')}
                            className="py-2.5 px-4 rounded-lg bg-neutral-900 hover:bg-red-950/80 hover:text-red-400 border border-neutral-800 text-neutral-400 font-bold text-xs uppercase flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>REJECT</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: PENDING WITHDRAWALS */}
              {activeTab === 'WITHDRAWALS' && (
                <div className="space-y-3">
                  {pendingWithdrawals.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 text-xs bg-neutral-950/40 rounded-xl border border-neutral-800/60">
                      <Landmark className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-400" />
                      <p className="font-semibold text-neutral-400">No pending withdrawal requests.</p>
                    </div>
                  ) : (
                    pendingWithdrawals.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-white text-sm">
                            Payout Request: {tx.amount} {tx.currency}
                          </div>
                          <span className="text-xs text-orange-400 font-mono">
                            To: {tx.accountDetail || tx.senderPhone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onApproveWithdrawal(tx.id)}
                            className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            Mark as Sent (Approve)
                          </button>
                          <button
                            onClick={() => onRejectWithdrawal(tx.id)}
                            className="py-2 px-3 rounded-lg bg-red-950 text-red-400 border border-red-800 font-bold text-xs"
                          >
                            Reject Payout
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: PLAYER BALANCE ADJUSTER */}
              {activeTab === 'BALANCE' && (
                <div className="space-y-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">Live Player Real Balance</h4>
                    <p className="text-xs text-neutral-400">
                      Current balance on this web session: <strong className="text-emerald-400 font-mono text-base">{realBalance.toFixed(2)} {currency}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={manualBalanceInput}
                      onChange={(e) => setManualBalanceInput(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono font-bold outline-none focus:border-emerald-500"
                      placeholder="Enter new balance..."
                    />
                    <button
                      onClick={handleSetBalance}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black rounded-xl text-xs uppercase"
                    >
                      Update Balance
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => {
                        onAdjustUserBalance(0);
                        setManualBalanceInput('0');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-bold text-red-400 hover:bg-red-950"
                    >
                      Reset to 0 ETB
                    </button>
                    <button
                      onClick={() => {
                        const val = realBalance + 100;
                        onAdjustUserBalance(val);
                        setManualBalanceInput(val.toString());
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-bold text-white hover:bg-neutral-800"
                    >
                      +100 ETB
                    </button>
                    <button
                      onClick={() => {
                        const val = realBalance + 500;
                        onAdjustUserBalance(val);
                        setManualBalanceInput(val.toString());
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-bold text-emerald-400 hover:bg-neutral-800"
                    >
                      +500 ETB
                    </button>
                    <button
                      onClick={() => {
                        const val = realBalance + 1000;
                        onAdjustUserBalance(val);
                        setManualBalanceInput(val.toString());
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-bold text-amber-400 hover:bg-neutral-800"
                    >
                      +1,000 ETB
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'SETTINGS' && (
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  {settingsSavedMessage && (
                    <div className="p-3 bg-emerald-950 border border-emerald-600/50 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{settingsSavedMessage}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-300 uppercase block">
                      Telebirr Receiver Phone (የቴሌብር መቀበያ ስልክ)
                    </label>
                    <input
                      type="text"
                      value={telebirrPhone}
                      onChange={(e) => setTelebirrPhone(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 outline-none"
                    />
                    <p className="text-[11px] text-neutral-500">
                      This is the number users will see when they click Deposit (Current: 0932335247).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-300 uppercase block">
                      Telebirr Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={telebirrName}
                      onChange={(e) => setTelebirrName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-300 uppercase block">
                      CBE Receiver Account Number
                    </label>
                    <input
                      type="text"
                      value={cbeAccount}
                      onChange={(e) => setCbeAccount(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-300 uppercase block">
                      Aviator Crash Aggression (የአውሮፕላን መከስከስ ፍጥነት)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setCrashAggression('HIGH')}
                        className={`py-2 px-3 rounded-xl border text-xs font-black transition ${
                          crashAggression === 'HIGH'
                            ? 'bg-red-600 text-white border-red-500 shadow-md ring-1 ring-red-400'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                        }`}
                      >
                        ⚡ HIGH (ቶሎ ቶሎ እንዲወድቅ)
                      </button>

                      <button
                        type="button"
                        onClick={() => setCrashAggression('BALANCED')}
                        className={`py-2 px-3 rounded-xl border text-xs font-black transition ${
                          crashAggression === 'BALANCED'
                            ? 'bg-amber-600 text-white border-amber-500 shadow-md ring-1 ring-amber-400'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                        }`}
                      >
                        ⚖️ BALANCED
                      </button>

                      <button
                        type="button"
                        onClick={() => setCrashAggression('FAIR')}
                        className={`py-2 px-3 rounded-xl border text-xs font-black transition ${
                          crashAggression === 'FAIR'
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-1 ring-emerald-400'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                        }`}
                      >
                        🛡️ STANDARD FAIR
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      HIGH Aggression causes the plane to crash earlier and more often (under 1.80x), protecting house margins.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:brightness-110 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>SAVE SETTINGS</span>
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
