import React, { useState } from 'react';
import { 
  X, Check, Smartphone, Landmark, CreditCard, 
  Coins, Ticket, ArrowDownRight, ArrowUpRight, 
  Copy, ShieldCheck, Sparkles, Building2, AlertCircle
} from 'lucide-react';
import { Currency, PaymentMethodId, Transaction } from '../types';
import { DEPOSIT_METHODS, PRESET_AMOUNTS } from '../data/depositMethods';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/sound';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  realBalance: number;
  transactions: Transaction[];
  telebirrReceiverPhone: string;
  telebirrReceiverName: string;
  language: 'en' | 'am';
  onSubmitDepositRequest: (
    amount: number,
    method: PaymentMethodId,
    senderPhone: string,
    refCode: string,
    receiverPhone: string
  ) => void;
  onWithdrawSuccess: (amount: number, method: PaymentMethodId, destination: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  currency,
  realBalance,
  transactions,
  telebirrReceiverPhone,
  telebirrReceiverName,
  language,
  onSubmitDepositRequest,
  onWithdrawSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW' | 'HISTORY'>('DEPOSIT');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('telebirr');
  const [amount, setAmount] = useState<number>(200);
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('0911223344');
  const [telebirrSmsRef, setTelebirrSmsRef] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('1000293847291');
  const [voucherCode, setVoucherCode] = useState<string>('SAFARI2025');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentMethodDetails = DEPOSIT_METHODS.find((m) => m.id === selectedMethod) || DEPOSIT_METHODS[0];

  const handleCopyReceiverPhone = () => {
    navigator.clipboard.writeText(telebirrReceiverPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleDeposit = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (selectedMethod === 'telebirr') {
      if (!senderPhone.trim()) {
        setErrorMessage('እባክዎ የከፈሉበትን የራስዎን የቴሌብር ስልክ ቁጥር ያስገቡ! (Please enter your sender Telebirr phone number)');
        return;
      }
      if (!telebirrSmsRef.trim()) {
        setErrorMessage('እባክዎ ከቴሌብር የደረሰዎትን የክፍያ ማረጋገጫ ቁጥር (Transaction ID / SMS Ref) ያስገቡ!');
        return;
      }
    }

    if (amount < currentMethodDetails.minDeposit) {
      setErrorMessage(`ዝቅተኛው ተቀማጭ መጠን ${currentMethodDetails.minDeposit} ${currency} ነው:: (Minimum deposit is ${currentMethodDetails.minDeposit} ${currency})`);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const generatedRef = telebirrSmsRef.trim() || `TX-${Math.floor(10000000 + Math.random() * 90000000)}`;
      
      onSubmitDepositRequest(
        amount,
        selectedMethod,
        senderPhone.trim() || '09XXXXXXXX',
        generatedRef,
        telebirrReceiverPhone
      );

      soundManager.playClick();
      setSuccessMessage(
        `⏳ የ ${amount} ${currency} ተቀማጭ ጥያቄ ለአድሚን ተልኳል! ወደ ${telebirrReceiverPhone} ያስገቡት ብር በአድሚኑ ተረጋግጦ ወዲያውኑ ወደ አካውንትዎ ይገባል::`
      );
      setTelebirrSmsRef('');
    }, 600);
  };

  const handleWithdraw = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (amount > realBalance) {
      setErrorMessage(`Insufficient balance. You currently have ${realBalance.toFixed(2)} ${currency} in your real wallet.`);
      return;
    }

    if (amount < 50) {
      setErrorMessage(`Minimum withdrawal is 50 ${currency}.`);
      return;
    }

    const destination = selectedMethod === 'telebirr' ? phoneNumber : accountNumber;
    if (!destination.trim()) {
      setErrorMessage(`Please provide your phone or account number.`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onWithdrawSuccess(amount, selectedMethod, destination);
      soundManager.playCashout();
      setSuccessMessage(`✅ Withdrawal request of ${amount} ${currency} sent to ${destination}! Status: Processing.`);
    }, 1000);
  };

  const copyCryptoAddress = () => {
    navigator.clipboard.writeText('TXk7s9PqL81vM9WnZ42tRtV87b6qB51j');
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-neutral-950 border-b border-neutral-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{language === 'am' ? 'የሳፋሪ ገንዘብ ተቀማጭና ማውጫ' : 'Safari Cashier & Wallet'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  INSTANT 24/7
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                {language === 'am' ? 'በቴሌብር፣ በንግድ ባንክ ወይም በቻፓ ፈጣን ተቀማጭ' : 'Deposit & Withdraw via Telebirr, CBE Birr & Chapa'}
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

        {/* Promo Bonus Banner */}
        <div className="bg-gradient-to-r from-amber-600/30 via-orange-600/20 to-red-600/30 border-b border-orange-500/30 px-5 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>100% First Deposit Bonus:</strong> Double your initial funds for Safari Game Aviator!
            </span>
          </div>
          <span className="hidden sm:inline font-mono font-bold text-amber-300">
            PROMO: SAFARI2025
          </span>
        </div>

        {/* Tabs: Deposit / Withdraw / History */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-5 pt-2 gap-2">
          <button
            onClick={() => {
              setActiveTab('DEPOSIT');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`pb-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'DEPOSIT'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>{language === 'am' ? 'ገንዘብ ተቀማጭ (Deposit)' : 'DEPOSIT'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('WITHDRAW');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`pb-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'WITHDRAW'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{language === 'am' ? 'ገንዘብ ማውጣት (Withdraw)' : 'WITHDRAW'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('HISTORY');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`pb-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'HISTORY'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>{language === 'am' ? 'ታሪክ (History)' : 'HISTORY'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Status Messages */}
          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 flex items-start gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-xs text-red-300 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: DEPOSIT */}
          {activeTab === 'DEPOSIT' && (
            <div className="space-y-4">
              {/* Payment Methods Grid */}
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase tracking-wider">
                  {language === 'am' ? 'የክፍያ አማራጭ ይምረጡ' : 'Select Payment Gateway'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {DEPOSIT_METHODS.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-neutral-800 border-emerald-500 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500'
                            : 'bg-neutral-950/70 border-neutral-800 hover:bg-neutral-800/60 hover:border-neutral-700'
                        }`}
                      >
                        {method.badge && (
                          <span className="absolute top-2 right-2 text-[8px] font-black tracking-wide px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {method.badge}
                          </span>
                        )}

                        <div className="flex items-center gap-2 mb-1.5">
                          {method.id === 'telebirr' && <Smartphone className="w-5 h-5 text-emerald-400" />}
                          {method.id === 'cbebirr' && <Landmark className="w-5 h-5 text-purple-400" />}
                          {method.id === 'chapa' && <CreditCard className="w-5 h-5 text-blue-400" />}
                          {method.id === 'awash' && <Building2 className="w-5 h-5 text-amber-400" />}
                          {method.id === 'crypto' && <Coins className="w-5 h-5 text-teal-400" />}
                          {method.id === 'voucher' && <Ticket className="w-5 h-5 text-rose-400" />}
                          <span className="font-bold text-xs text-white">
                            {language === 'am' ? method.amharicName : method.name}
                          </span>
                        </div>

                        <div className="text-[10px] text-neutral-400">
                          Min: {method.minDeposit} {currency}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific Method Input Details */}
              {selectedMethod === 'telebirr' && (
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                  {/* Receiver Telebirr Official Box */}
                  <div className="bg-emerald-950/50 border border-emerald-600/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider">
                        <Smartphone className="w-4 h-4" />
                        <span>ገንዘብ የሚላክበት የቴሌብር ቁጥር (Send Money To):</span>
                      </div>
                      <div className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider mt-0.5">
                        {telebirrReceiverPhone}
                      </div>
                      <div className="text-[11px] text-neutral-300 font-medium">
                        ተቀባይ: <strong>{telebirrReceiverName}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyReceiverPhone}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 shadow cursor-pointer shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{copiedPhone ? 'ተቀድቷል (COPIED!)' : 'ቁጥሩን ኮፒ አድርግ (COPY)'}</span>
                    </button>
                  </div>

                  {/* Step Instructions */}
                  <div className="bg-neutral-900/80 p-3 rounded-lg border border-neutral-800 text-[11px] text-neutral-300 space-y-1">
                    <p className="font-bold text-orange-400">የአከፋፈል ቅደም ተከተል (Steps):</p>
                    <p>1. በቴሌብርዎ *127# ወይም በTelebirr App ወደ <strong>{telebirrReceiverPhone}</strong> የተፈለገውን ብር ይላኩ::</p>
                    <p>2. ከቴሌብር የደረሰዎትን የክፍያ ማረጋገጫ ቁጥር (Transaction ID/Ref) እና የላኩበትን ስልክ ከታች ያስገቡ::</p>
                    <p>3. ጥያቄውን ሲልኩ አድሚኑ ወዲያውኑ አረጋግጦ ብሩን ወደ አካውንትዎ ያስገባል::</p>
                  </div>

                  {/* User Sender Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="text-xs font-bold text-neutral-400 block mb-1">
                        የላኩበት የራስዎ ቴሌብር ስልክ (Sender Phone):
                      </label>
                      <input
                        type="text"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="09... ወይም 07..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-400 block mb-1">
                        የቴሌብር ማረጋገጫ ቁጥር (Transaction ID):
                      </label>
                      <input
                        type="text"
                        value={telebirrSmsRef}
                        onChange={(e) => setTelebirrSmsRef(e.target.value)}
                        placeholder="ምሳሌ: CP728194 ወይም TEL-..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'cbebirr' && (
                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-semibold">CBE Account / CBE Birr Phone:</span>
                    <span className="text-purple-400 text-[11px] font-bold">Commercial Bank of Ethiopia</span>
                  </div>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1000..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-purple-500 outline-none"
                  />
                </div>
              )}

              {selectedMethod === 'crypto' && (
                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-semibold">Deposit USDT (TRC20 Address):</span>
                    <span className="text-teal-400 text-[11px] font-bold">Rate: 1 USDT = 138 ETB</span>
                  </div>
                  <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-300">
                    <span className="truncate flex-1">TXk7s9PqL81vM9WnZ42tRtV87b6qB51j</span>
                    <button
                      onClick={copyCryptoAddress}
                      className="text-teal-400 hover:text-white flex items-center gap-1 font-bold shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedAddress ? 'COPIED!' : 'COPY'}</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedMethod === 'voucher' && (
                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-semibold">Promo / Voucher Code:</span>
                    <span className="text-rose-400 text-[11px] font-bold">Active Codes: SAFARI2025, WELCOME100</span>
                  </div>
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Enter code..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase focus:border-rose-500 outline-none"
                  />
                </div>
              )}

              {/* Amount Selection (Only if not voucher) */}
              {selectedMethod !== 'voucher' && (
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    <span>{language === 'am' ? 'የተቀማጭ መጠን (ETB)' : 'Deposit Amount'}</span>
                    <span className="text-white font-mono font-bold">{amount} {currency}</span>
                  </div>

                  {/* Preset chips */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(amt)}
                        className={`py-2 rounded-lg font-mono text-xs font-bold border transition ${
                          amount === amt
                            ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow'
                            : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount Input */}
                  <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2">
                    <span className="font-bold text-neutral-500 mr-2">{currency}</span>
                    <input
                      type="number"
                      step="50"
                      min="50"
                      value={amount}
                      onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-transparent font-mono font-bold text-white outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Submit Deposit Button */}
              <button
                onClick={handleDeposit}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:brightness-110 active:scale-95 text-neutral-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>ጥያቄው እየተላከ ነው (SENDING REQUEST...)...</span>
                ) : (
                  <>
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>
                      {selectedMethod === 'voucher'
                        ? 'REDEEM VOUCHER BONUS'
                        : `ጥያቄውን ላክ / SUBMIT REQUEST (${amount} ${currency})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: WITHDRAW */}
          {activeTab === 'WITHDRAW' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 block">Available Real Balance</span>
                  <span className="font-mono font-bold text-xl text-white">
                    {realBalance.toFixed(2)} {currency}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-orange-950 text-orange-400 border border-orange-800 font-bold">
                  Zero Fee Payouts
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-2 uppercase">
                  Payout Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('telebirr')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                      selectedMethod === 'telebirr'
                        ? 'bg-neutral-800 border-emerald-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-850'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-bold text-xs">Telebirr Wallet</div>
                      <div className="text-[10px] text-neutral-400">Mobile Transfer</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('cbebirr')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                      selectedMethod === 'cbebirr'
                        ? 'bg-neutral-800 border-purple-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-850'
                    }`}
                  >
                    <Landmark className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-bold text-xs">CBE Bank / CBE Birr</div>
                      <div className="text-[10px] text-neutral-400">Bank Transfer</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1 uppercase">
                  {selectedMethod === 'telebirr' ? 'Telebirr Phone Number' : 'CBE Account Number'}
                </label>
                <input
                  type="text"
                  value={selectedMethod === 'telebirr' ? phoneNumber : accountNumber}
                  onChange={(e) => {
                    if (selectedMethod === 'telebirr') setPhoneNumber(e.target.value);
                    else setAccountNumber(e.target.value);
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-1 uppercase">
                  Withdrawal Amount ({currency})
                </label>
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2">
                  <span className="font-bold text-neutral-500 mr-2">{currency}</span>
                  <input
                    type="number"
                    step="50"
                    min="50"
                    max={realBalance}
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-transparent font-mono font-bold text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(realBalance)}
                    className="text-xs font-bold text-orange-400 hover:underline px-2"
                  >
                    ALL
                  </button>
                </div>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={isProcessing || realBalance < 50}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-neutral-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-orange-950/40 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>PROCESSING PAYOUT...</span>
                ) : (
                  <>
                    <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                    <span>REQUEST WITHDRAWAL ({amount} {currency})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: TRANSACTION HISTORY */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  No transactions recorded yet.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                          tx.type === 'DEPOSIT'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-orange-950 text-orange-400 border border-orange-800'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white">{tx.methodName}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          Ref: {tx.referenceNumber} • {new Date(tx.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-mono font-bold ${
                          tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-orange-400'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' ? '+' : '-'}
                        {tx.amount.toFixed(2)} {tx.currency}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
