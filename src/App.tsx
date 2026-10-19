import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  GameStatus, Currency, UserBet, PastRound, 
  LobbyPlayerBet, Transaction, PaymentMethodId, AdminSettings,
  ActiveGame, UserProfile 
} from './types';
import { generateCrashMultiplier, getFlightDuration } from './utils/provablyFair';
import { soundManager } from './utils/sound';
import { generateLobbyBets } from './data/mockLobby';
import { INITIAL_TRANSACTIONS, DEFAULT_ADMIN_SETTINGS } from './data/depositMethods';
import { Header } from './components/Header';
import { HistoryBar } from './components/HistoryBar';
import { FlightArena } from './components/FlightArena';
import { BetPanel } from './components/BetPanel';
import { LiveSidebar } from './components/LiveSidebar';
import { DepositModal } from './components/DepositModal';
import { ProvablyFairModal } from './components/ProvablyFairModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AuthModal } from './components/AuthModal';
import { ChickenRoadGame } from './components/ChickenRoadGame';
import { TelegramBotModal } from './components/TelegramBotModal';
import { initTelegramApp, isTelegramWebApp, triggerTelegramHaptic } from './utils/telegram';
import { Lock, CheckCircle2, Clock } from 'lucide-react';

const INITIAL_ROUNDS: PastRound[] = [
  { id: 'r-1', multiplier: 1.15, timestamp: Date.now() - 60000 * 5, crashTimeSeconds: 2.8, serverSeed: 'seed115', hash: 'hash115' },
  { id: 'r-2', multiplier: 1.42, timestamp: Date.now() - 60000 * 4, crashTimeSeconds: 4.2, serverSeed: 'seed142', hash: 'hash142' },
  { id: 'r-3', multiplier: 1.05, timestamp: Date.now() - 60000 * 3.5, crashTimeSeconds: 1.1, serverSeed: 'seed105', hash: 'hash105' },
  { id: 'r-4', multiplier: 2.40, timestamp: Date.now() - 60000 * 3, crashTimeSeconds: 9.6, serverSeed: 'seed240', hash: 'hash240' },
  { id: 'r-5', multiplier: 1.25, timestamp: Date.now() - 60000 * 2.5, crashTimeSeconds: 3.8, serverSeed: 'seed125', hash: 'hash125' },
  { id: 'r-6', multiplier: 1.02, timestamp: Date.now() - 60000 * 2, crashTimeSeconds: 0.8, serverSeed: 'seed102', hash: 'hash102' },
  { id: 'r-7', multiplier: 3.64, timestamp: Date.now() - 60000 * 1.5, crashTimeSeconds: 14.1, serverSeed: 'seed364', hash: 'hash364' },
  { id: 'r-8', multiplier: 1.34, timestamp: Date.now() - 60000 * 1, crashTimeSeconds: 4.2, serverSeed: 'seed134', hash: 'hash134' },
  { id: 'r-9', multiplier: 1.18, timestamp: Date.now() - 60000 * 0.5, crashTimeSeconds: 2.0, serverSeed: 'seed118', hash: 'hash118' },
];

export default function App() {
  // --- Active Game Selector ---
  const [activeGame, setActiveGame] = useState<ActiveGame>('AVIATOR');

  // --- User Account State ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('safari_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    return localStorage.getItem('safari_current_user') === null;
  });

  // --- Persistent Storage State ---
  // Initial Real balance starts at 0.00 ETB for new players (as requested)
  const [realBalance, setRealBalance] = useState<number>(() => {
    const saved = localStorage.getItem('safari_real_balance');
    return saved !== null ? Number(saved) : 0.0;
  });

  const [demoBalance, setDemoBalance] = useState<number>(() => {
    const saved = localStorage.getItem('safari_demo_balance');
    return saved !== null ? Number(saved) : 5000.0;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('safari_demo_mode') === 'true';
  });

  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('safari_admin_settings');
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN_SETTINGS;
  });

  const [currency] = useState<Currency>('ETB');
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sync wallet balances & admin settings to localStorage
  useEffect(() => {
    localStorage.setItem('safari_real_balance', realBalance.toString());
  }, [realBalance]);

  useEffect(() => {
    localStorage.setItem('safari_demo_balance', demoBalance.toString());
  }, [demoBalance]);

  useEffect(() => {
    localStorage.setItem('safari_demo_mode', isDemoMode.toString());
  }, [isDemoMode]);

  useEffect(() => {
    localStorage.setItem('safari_admin_settings', JSON.stringify(adminSettings));
  }, [adminSettings]);

  // --- Transactions, Modals & Toast State ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('safari_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  useEffect(() => {
    localStorage.setItem('safari_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isProvablyFairOpen, setIsProvablyFairOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTelegramBotOpen, setIsTelegramBotOpen] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [selectedRoundForModal, setSelectedRoundForModal] = useState<PastRound | null>(null);
  const [statusToast, setStatusToast] = useState<{ message: string; type: 'success' | 'pending' | 'info' } | null>(null);

  // Auto-detect Telegram WebApp on mount & register user if in Telegram
  useEffect(() => {
    const inTg = isTelegramWebApp();
    setIsTelegram(inTg);

    const tgUser = initTelegramApp();
    if (tgUser) {
      setIsTelegram(true);
      const saved = localStorage.getItem('safari_current_user');
      if (!saved) {
        const tgProfile: UserProfile = {
          id: `tg_${tgUser.id}`,
          fullName: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() || tgUser.username || `TG_Player_${tgUser.id}`,
          phoneNumber: tgUser.username ? `@${tgUser.username}` : `TG-${tgUser.id}`,
          registeredAt: Date.now(),
        };
        setCurrentUser(tgProfile);
        localStorage.setItem('safari_current_user', JSON.stringify(tgProfile));
        setIsAuthModalOpen(false);
      }
    }
  }, []);

  // Hidden Keyboard Shortcut for Admin (Alt + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Game Loop Engine State for Aviator ---
  const [gameStatus, setGameStatus] = useState<GameStatus>('WAITING');
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [finalMultiplier, setFinalMultiplier] = useState<number | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5.0);
  const maxCountdown = 5.0;

  const [pastRounds, setPastRounds] = useState<PastRound[]>(INITIAL_ROUNDS);
  const [lobbyBets, setLobbyBets] = useState<LobbyPlayerBet[]>(() => generateLobbyBets());
  const [userBetsHistory, setUserBetsHistory] = useState<UserBet[]>([]);

  // Current active bets for Panel 1 & Panel 2
  const [bet1, setBet1] = useState<UserBet>({
    id: 'bet1',
    panelId: 1,
    amount: 20,
    autoCashout: false,
    autoCashoutMultiplier: 2.0,
    isAutoBet: false,
    status: 'IDLE',
    timestamp: Date.now(),
  });

  const [bet2, setBet2] = useState<UserBet>({
    id: 'bet2',
    panelId: 2,
    amount: 50,
    autoCashout: false,
    autoCashoutMultiplier: 3.0,
    isAutoBet: false,
    status: 'IDLE',
    timestamp: Date.now(),
  });

  const currentCrashParamsRef = useRef(
    generateCrashMultiplier(adminSettings.aviatorCrashAggression || 'HIGH', isDemoMode)
  );
  const flightStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Active balance helper
  const currentBalance = isDemoMode ? demoBalance : realBalance;

  // Refs to prevent infinite render loops
  const currentMultiplierRef = useRef<number>(currentMultiplier);
  currentMultiplierRef.current = currentMultiplier;

  const currentBalanceRef = useRef<number>(currentBalance);
  currentBalanceRef.current = currentBalance;

  const bet1Ref = useRef<UserBet>(bet1);
  bet1Ref.current = bet1;

  const bet2Ref = useRef<UserBet>(bet2);
  bet2Ref.current = bet2;

  const deductBalance = useCallback((amount: number) => {
    if (isDemoMode) {
      setDemoBalance((prev) => Math.max(0, prev - amount));
    } else {
      setRealBalance((prev) => Math.max(0, prev - amount));
    }
  }, [isDemoMode]);

  const creditBalance = useCallback((amount: number) => {
    if (isDemoMode) {
      setDemoBalance((prev) => prev + amount);
    } else {
      setRealBalance((prev) => prev + amount);
    }
  }, [isDemoMode]);

  // Stable Cash out helper for a given panel (independent of currentMultiplier to prevent loops)
  const handleCashOut = useCallback((panelId: 1 | 2, multiplierOverride?: number) => {
    const activeMultiplier = multiplierOverride || currentMultiplierRef.current;
    soundManager.playCashout();
    triggerTelegramHaptic('notification', 'success');

    const targetBet = panelId === 1 ? bet1Ref.current : bet2Ref.current;
    if (targetBet.status !== 'ACTIVE') return;

    const winAmount = targetBet.amount * activeMultiplier;
    creditBalance(winAmount);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    const updatedBet: UserBet = {
      ...targetBet,
      status: 'CASHED_OUT',
      cashedOutMultiplier: activeMultiplier,
      winAmount: winAmount,
    };

    if (panelId === 1) {
      setBet1(updatedBet);
    } else {
      setBet2(updatedBet);
    }

    setUserBetsHistory((prev) => [updatedBet, ...prev]);
  }, [creditBalance]);

  // Periodic simulated lobby cashouts during flight (controlled 900ms interval, not on every animation frame)
  useEffect(() => {
    if (gameStatus !== 'FLYING') return;

    const interval = setInterval(() => {
      const activeM = currentMultiplierRef.current;
      setLobbyBets((prev) =>
        prev.map((player) => {
          if (player.cashedOutMultiplier === null) {
            const cashoutChance = 0.08 + (activeM / 90);
            if (Math.random() < cashoutChance) {
              return {
                ...player,
                cashedOutMultiplier: activeM,
                winAmount: player.betAmount * activeM,
              };
            }
          }
          return player;
        })
      );
    }, 900);

    return () => clearInterval(interval);
  }, [gameStatus]);

  // Main Aviator game loop controller
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameStatus === 'WAITING') {
      soundManager.stopEngine();

      // Process queued bets once on entering WAITING
      const curBal = currentBalanceRef.current;
      const b1 = bet1Ref.current;
      const b2 = bet2Ref.current;

      if (b1.status === 'PLACED_FOR_NEXT' || (b1.isAutoBet && b1.status !== 'ACTIVE')) {
        if (curBal >= b1.amount) {
          deductBalance(b1.amount);
          setBet1((prev) => ({ ...prev, status: 'ACTIVE', winAmount: undefined, cashedOutMultiplier: undefined }));
        } else {
          setBet1((prev) => (prev.status === 'IDLE' ? prev : { ...prev, status: 'IDLE' }));
        }
      } else if (b1.status === 'CRASHED' || b1.status === 'CASHED_OUT') {
        setBet1((prev) => ({ ...prev, status: 'IDLE', winAmount: undefined, cashedOutMultiplier: undefined }));
      }

      if (b2.status === 'PLACED_FOR_NEXT' || (b2.isAutoBet && b2.status !== 'ACTIVE')) {
        if (curBal >= b2.amount) {
          deductBalance(b2.amount);
          setBet2((prev) => ({ ...prev, status: 'ACTIVE', winAmount: undefined, cashedOutMultiplier: undefined }));
        } else {
          setBet2((prev) => (prev.status === 'IDLE' ? prev : { ...prev, status: 'IDLE' }));
        }
      } else if (b2.status === 'CRASHED' || b2.status === 'CASHED_OUT') {
        setBet2((prev) => ({ ...prev, status: 'IDLE', winAmount: undefined, cashedOutMultiplier: undefined }));
      }

      const startTime = Date.now();
      const countdownInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.max(0, maxCountdown - elapsed);
        setCountdownSeconds(remaining);

        if (remaining <= 0) {
          clearInterval(countdownInterval);
          currentCrashParamsRef.current = generateCrashMultiplier(
            adminSettings.aviatorCrashAggression || 'HIGH',
            isDemoMode
          );
          currentMultiplierRef.current = 1.0;
          setCurrentMultiplier(1.0);
          setFinalMultiplier(null);
          setGameStatus('FLYING');
          flightStartTimeRef.current = performance.now();
          soundManager.startEngine();
        }
      }, 50);

      return () => clearInterval(countdownInterval);
    }

    if (gameStatus === 'FLYING') {
      const targetCrash = currentCrashParamsRef.current.multiplier;
      const durationSec = getFlightDuration(targetCrash);
      const startTime = flightStartTimeRef.current;

      const flightLoop = (now: number) => {
        const elapsedSec = (now - startTime) / 1000;

        if (elapsedSec >= durationSec) {
          soundManager.playCrash();
          if (bet1Ref.current.status === 'ACTIVE' || bet2Ref.current.status === 'ACTIVE') {
            triggerTelegramHaptic('notification', 'error');
          }
          currentMultiplierRef.current = targetCrash;
          setCurrentMultiplier(targetCrash);
          setFinalMultiplier(targetCrash);
          setGameStatus('CRASHED');

          setBet1((prev) => {
            if (prev.status === 'ACTIVE') {
              const crashedBet: UserBet = { ...prev, status: 'CRASHED' };
              setUserBetsHistory((h) => [crashedBet, ...h]);
              return crashedBet;
            }
            return prev;
          });

          setBet2((prev) => {
            if (prev.status === 'ACTIVE') {
              const crashedBet: UserBet = { ...prev, status: 'CRASHED' };
              setUserBetsHistory((h) => [crashedBet, ...h]);
              return crashedBet;
            }
            return prev;
          });

          const newRound: PastRound = {
            id: `round-${Date.now()}`,
            multiplier: targetCrash,
            timestamp: Date.now(),
            crashTimeSeconds: durationSec,
            serverSeed: currentCrashParamsRef.current.serverSeed,
            hash: currentCrashParamsRef.current.hash,
          };
          setPastRounds((prev) => [newRound, ...prev]);
          return;
        }

        const progressRatio = elapsedSec / durationSec;
        const currentM = Math.pow(targetCrash, progressRatio);
        const formatted = Math.max(1.0, currentM);

        currentMultiplierRef.current = formatted;
        setCurrentMultiplier(formatted);
        soundManager.updateEnginePitch(formatted);

        // Check auto-cashouts directly inside the frame loop with no extra effect triggers
        const b1 = bet1Ref.current;
        if (b1.status === 'ACTIVE' && b1.autoCashout && formatted >= b1.autoCashoutMultiplier) {
          handleCashOut(1, formatted);
        }

        const b2 = bet2Ref.current;
        if (b2.status === 'ACTIVE' && b2.autoCashout && formatted >= b2.autoCashoutMultiplier) {
          handleCashOut(2, formatted);
        }

        animationFrameRef.current = requestAnimationFrame(flightLoop);
      };

      animationFrameRef.current = requestAnimationFrame(flightLoop);

      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }

    if (gameStatus === 'CRASHED') {
      timer = setTimeout(() => {
        setLobbyBets(generateLobbyBets());
        setGameStatus('WAITING');
        setCountdownSeconds(maxCountdown);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [gameStatus, isDemoMode, adminSettings.aviatorCrashAggression, deductBalance, handleCashOut]);

  // Place Bet Handler
  const handlePlaceBet = (
    panelId: 1 | 2,
    amount: number,
    autoCashout: boolean,
    autoMult: number,
    isAutoBet: boolean
  ) => {
    soundManager.playClick();
    triggerTelegramHaptic('impact', 'medium');

    if (currentBalance < amount) {
      setIsDepositOpen(true);
      return;
    }

    const newBetData: UserBet = {
      id: `bet-${panelId}-${Date.now()}`,
      panelId,
      amount,
      autoCashout,
      autoCashoutMultiplier: autoMult,
      isAutoBet,
      status: gameStatus === 'WAITING' ? 'ACTIVE' : 'PLACED_FOR_NEXT',
      timestamp: Date.now(),
    };

    if (gameStatus === 'WAITING') {
      deductBalance(amount);
    }

    if (panelId === 1) {
      setBet1(newBetData);
    } else {
      setBet2(newBetData);
    }
  };

  // Cancel Bet Handler
  const handleCancelBet = (panelId: 1 | 2) => {
    soundManager.playClick();
    if (panelId === 1) {
      setBet1((prev) => ({ ...prev, status: 'IDLE' }));
    } else {
      setBet2((prev) => ({ ...prev, status: 'IDLE' }));
    }
  };

  // User submits a deposit request to the Admin
  const handleSubmitDepositRequest = (
    amount: number,
    method: PaymentMethodId,
    senderPhone: string,
    refCode: string,
    receiverPhone: string
  ) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'DEPOSIT',
      method,
      methodName: method.toUpperCase(),
      amount,
      currency,
      status: 'PENDING',
      timestamp: Date.now(),
      referenceNumber: refCode,
      senderPhone,
      receiverPhone,
    };

    setTransactions((prev) => [newTx, ...prev]);

    setStatusToast({
      message: `⏳ የ ${amount} ${currency} ተቀማጭ ጥያቄ ለአድሚኑ ተልኳል! ወደ ${receiverPhone} የተላከው ብር በአድሚኑ ተረጋግጦ ወዲያውኑ ወደ ሂሳብዎ ይገባል::`,
      type: 'pending',
    });

    setTimeout(() => {
      setStatusToast(null);
    }, 7000);
  };

  // Admin approves deposit request -> credits user balance
  const handleApproveDeposit = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx || tx.status === 'APPROVED') return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'APPROVED' } : t))
    );

    setRealBalance((prev) => prev + tx.amount);

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    soundManager.playCashout();

    setStatusToast({
      message: `🎉 አድሚኑ የ ${tx.amount} ${currency} ተቀማጭዎን አጽድቆታል! ብሩ ወደ አካውንትዎ ገብቷል::`,
      type: 'success',
    });

    setTimeout(() => {
      setStatusToast(null);
    }, 6000);
  };

  // Admin rejects deposit
  const handleRejectDeposit = (txId: string, reason?: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'REJECTED', note: reason } : t))
    );

    setStatusToast({
      message: `⚠️ የተቀማጭ ጥያቄው ውድቅ ተደርጓል: ${reason || 'የቴሌብር ማረጋገጫ ቁጥሩ አልተገኘም'}::`,
      type: 'info',
    });

    setTimeout(() => {
      setStatusToast(null);
    }, 5000);
  };

  // Withdrawal Handler
  const handleWithdrawSuccess = (amount: number, method: PaymentMethodId, destination: string) => {
    setRealBalance((prev) => Math.max(0, prev - amount));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'WITHDRAWAL',
      method,
      methodName: method.toUpperCase(),
      amount,
      currency,
      status: 'PENDING',
      timestamp: Date.now(),
      referenceNumber: `WTH-${Math.floor(100000 + Math.random() * 900000)}`,
      accountDetail: destination,
    };
    setTransactions((prev) => [newTx, ...prev]);

    setStatusToast({
      message: `✅ የ ${amount} ${currency} ገንዘብ ማውጣት ጥያቄ ለአድሚን ተልኳል::`,
      type: 'pending',
    });
    setTimeout(() => setStatusToast(null), 5000);
  };

  const handleApproveWithdrawal = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'APPROVED' } : t))
    );
  };

  const handleRejectWithdrawal = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (tx) {
      setRealBalance((prev) => prev + tx.amount);
      setTransactions((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, status: 'REJECTED' } : t))
      );
    }
  };

  // Adjust User Real Balance from Admin Panel
  const handleAdjustUserBalance = (newBalance: number) => {
    setRealBalance(newBalance);
    setStatusToast({
      message: `የአካውንትዎ ሂሳብ ወደ ${newBalance.toFixed(2)} ${currency} ተቀይሯል::`,
      type: 'info',
    });
    setTimeout(() => setStatusToast(null), 4000);
  };

  // Reload Free Demo Balance
  const handleReloadDemo = () => {
    soundManager.playClick();
    setDemoBalance(5000.0);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.4 } });
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
  };

  const handleLogout = () => {
    localStorage.removeItem('safari_current_user');
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  const pendingDepositsCount = transactions.filter((t) => t.type === 'DEPOSIT' && t.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Header Navigation */}
      <Header
        realBalance={realBalance}
        demoBalance={demoBalance}
        isDemoMode={isDemoMode}
        currency={currency}
        isMuted={isMuted}
        language={language}
        activeGame={activeGame}
        currentUser={currentUser}
        isTelegram={isTelegram}
        onOpenTelegramBot={() => setIsTelegramBotOpen(true)}
        onSelectGame={(game) => setActiveGame(game)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onToggleDemoMode={() => setIsDemoMode((prev) => !prev)}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onReloadDemo={handleReloadDemo}
        onToggleMute={handleToggleMute}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onOpenProvablyFair={() => {
          setSelectedRoundForModal(pastRounds[0] || null);
          setIsProvablyFairOpen(true);
        }}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'en' ? 'am' : 'en'))}
      />

      {/* Floating Global Status Toast / Pending Notice */}
      {statusToast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-lg bg-neutral-900 border border-neutral-700 p-3.5 rounded-xl shadow-2xl flex items-start gap-3 animate-bounce-short">
          {statusToast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {statusToast.type === 'pending' && <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-spin" />}
          {statusToast.type === 'info' && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
          <div className="flex-1 text-xs text-neutral-200 font-medium">
            {statusToast.message}
          </div>
        </div>
      )}

      {/* Main Game Cockpit Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-2 sm:p-4">
        {activeGame === 'AVIATOR' ? (
          <div className="flex flex-col gap-3">
            {/* Multiplier History Pills Strip */}
            <HistoryBar
              rounds={pastRounds}
              onSelectRound={(round) => {
                setSelectedRoundForModal(round);
                setIsProvablyFairOpen(true);
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
              {/* Left Column: Multiplayer Lobby Sidebar */}
              <div className="order-2 lg:order-1 lg:col-span-4 xl:col-span-3 flex flex-col">
                <LiveSidebar
                  lobbyBets={lobbyBets}
                  userBetsHistory={userBetsHistory}
                  currency={currency}
                  language={language}
                />
              </div>

              {/* Right Column: Flight Arena + Dual Bet Consoles */}
              <div className="order-1 lg:order-2 lg:col-span-8 xl:col-span-9 flex flex-col gap-3 sm:gap-4">
                <FlightArena
                  status={gameStatus}
                  currentMultiplier={currentMultiplier}
                  finalMultiplier={finalMultiplier}
                  countdownSeconds={countdownSeconds}
                  maxCountdown={maxCountdown}
                  language={language}
                />

                {/* Dual Betting Consoles (Panel 1 & Panel 2) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <BetPanel
                    panelId={1}
                    userBet={bet1}
                    currentMultiplier={currentMultiplier}
                    gameStatus={gameStatus}
                    balance={currentBalance}
                    currency={currency}
                    language={language}
                    onPlaceBet={handlePlaceBet}
                    onCancelBet={handleCancelBet}
                    onCashOut={handleCashOut}
                  />

                  <BetPanel
                    panelId={2}
                    userBet={bet2}
                    currentMultiplier={currentMultiplier}
                    gameStatus={gameStatus}
                    balance={currentBalance}
                    currency={currency}
                    language={language}
                    onPlaceBet={handlePlaceBet}
                    onCancelBet={handleCancelBet}
                    onCashOut={handleCashOut}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CHICKEN ROAD GAME SCREEN */
          <ChickenRoadGame
            balance={currentBalance}
            currency={currency}
            isDemoMode={isDemoMode}
            language={language}
            onDeductBalance={deductBalance}
            onCreditBalance={creditBalance}
            onOpenDeposit={() => setIsDepositOpen(true)}
          />
        )}
      </main>

      {/* Footer Branding Bar (with Hidden Admin Access) */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-2.5 px-4 text-center text-[11px] text-neutral-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-400">SAFARI GAME</span>
          <span>• 18+ Responsible Gaming</span>
          <span>• Aviator & Chicken Road</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Telebirr ({adminSettings.telebirrReceiverPhone}) Cashier Active
          </span>

          {/* Hidden Admin Trigger */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="p-1 rounded text-neutral-700 hover:text-red-400 transition flex items-center gap-1 cursor-pointer"
            title="Admin Login (PIN Protected or Alt+A)"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[10px] text-neutral-600 hover:text-neutral-400">
              v2.4.0
            </span>
            {pendingDepositsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>
        </div>
      </footer>

      {/* Account Registration / Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setStatusToast({
            message: `እንኳን ደህና መጡ ${user.fullName}! አካውንትዎ በተሳካ ሁኔታ ተከፍቷል::`,
            type: 'success',
          });
          setTimeout(() => setStatusToast(null), 5000);
        }}
        canDismiss={currentUser !== null}
      />

      {/* Deposit & Cashier Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        currency={currency}
        realBalance={realBalance}
        transactions={transactions}
        telebirrReceiverPhone={adminSettings.telebirrReceiverPhone}
        telebirrReceiverName={adminSettings.telebirrReceiverName}
        language={language}
        onSubmitDepositRequest={handleSubmitDepositRequest}
        onWithdrawSuccess={handleWithdrawSuccess}
      />

      {/* Hidden Admin Panel Modal (PIN Protected) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        transactions={transactions}
        realBalance={realBalance}
        currency={currency}
        adminSettings={adminSettings}
        onUpdateAdminSettings={(newSettings) => setAdminSettings(newSettings)}
        onApproveDeposit={handleApproveDeposit}
        onRejectDeposit={handleRejectDeposit}
        onApproveWithdrawal={handleApproveWithdrawal}
        onRejectWithdrawal={handleRejectWithdrawal}
        onAdjustUserBalance={handleAdjustUserBalance}
      />

      {/* Provably Fair Modal */}
      <ProvablyFairModal
        isOpen={isProvablyFairOpen}
        onClose={() => setIsProvablyFairOpen(false)}
        selectedRound={selectedRoundForModal}
      />

      {/* How To Play Modal */}
      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
        language={language}
      />

      {/* Telegram Bot & Mini App Modal */}
      <TelegramBotModal
        isOpen={isTelegramBotOpen}
        onClose={() => setIsTelegramBotOpen(false)}
        language={language}
        realBalance={realBalance}
        demoBalance={demoBalance}
        isDemoMode={isDemoMode}
        telebirrPhone={adminSettings.telebirrReceiverPhone}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onSelectGame={(game) => setActiveGame(game)}
      />
    </div>
  );
}
