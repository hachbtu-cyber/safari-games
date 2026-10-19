import React, { useState } from 'react';
import { Users, User, Trophy, MessageSquare, Send, Sparkles } from 'lucide-react';
import { LobbyPlayerBet, UserBet, Currency, ChatMessage } from '../types';

interface LiveSidebarProps {
  lobbyBets: LobbyPlayerBet[];
  userBetsHistory: UserBet[];
  currency: Currency;
  language: 'en' | 'am';
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', user: 'Dawit_Addis', text: 'Good luck everyone! 🚀', time: '14:22' },
  { id: '2', user: 'SafariMaster', text: 'Safari plane is flying high today! 🔥', time: '14:23' },
  { id: '3', user: 'Selamawit', text: 'Just cashed out @ 4.5x with Telebirr payout!', time: '14:24', isWin: true, multiplier: 4.5 },
  { id: '4', user: 'Yonas_Fly', text: 'Waiting for the 10x streak 🦁', time: '14:25' },
  { id: '5', user: 'Abebe_B', text: 'ሰላም ለሁላችሁም! ምርጥ ጌም ነው', time: '14:26' },
];

export const LiveSidebar: React.FC<LiveSidebarProps> = ({
  lobbyBets,
  userBetsHistory,
  currency,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY' | 'TOP' | 'CHAT'>('ALL');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState<string>('');

  const totalPot = lobbyBets.reduce((acc, b) => acc + b.betAmount, 0);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      user: 'You (Safari Player)',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  const topWinsMock = [
    { user: 'LionOfJuda', bet: 1000, mult: 184.2, win: 184200, date: 'Today' },
    { user: 'SafariKing', bet: 500, mult: 96.5, win: 48250, date: 'Today' },
    { user: 'Biniyam_X', bet: 200, mult: 54.12, win: 10824, date: 'Yesterday' },
    { user: 'Helen_Addis', bet: 1500, mult: 38.4, win: 57600, date: 'Yesterday' },
    { user: 'Robel_21', bet: 100, mult: 29.8, win: 2980, date: '2 days ago' },
  ];

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col h-[520px] lg:h-full shadow-2xl overflow-hidden select-none">
      {/* Top Tabs */}
      <div className="grid grid-cols-4 bg-neutral-900 border-b border-neutral-800 p-1 gap-1">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`py-2 px-1 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
            activeTab === 'ALL'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span className="truncate">{language === 'am' ? 'ሁሉም' : 'All Bets'}</span>
        </button>

        <button
          onClick={() => setActiveTab('MY')}
          className={`py-2 px-1 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
            activeTab === 'MY'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span className="truncate">{language === 'am' ? 'የእኔ' : 'My Bets'}</span>
        </button>

        <button
          onClick={() => setActiveTab('TOP')}
          className={`py-2 px-1 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
            activeTab === 'TOP'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate">{language === 'am' ? 'ከፍተኛ' : 'Top'}</span>
        </button>

        <button
          onClick={() => setActiveTab('CHAT')}
          className={`py-2 px-1 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
            activeTab === 'CHAT'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          <span className="truncate">{language === 'am' ? 'ቻት' : 'Chat'}</span>
        </button>
      </div>

      {/* Tab 1: All Bets in current round */}
      {activeTab === 'ALL' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Stats */}
          <div className="px-3 py-2 bg-neutral-900/60 border-b border-neutral-800/80 flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium">
              Active Players: <strong className="text-white">{lobbyBets.length}</strong>
            </span>
            <span className="text-neutral-400 font-mono">
              Total: <strong className="text-orange-400">{totalPot.toLocaleString()} {currency}</strong>
            </span>
          </div>

          {/* Player Bets List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-900 px-2 py-1 space-y-1">
            {lobbyBets.map((player) => {
              const hasCashedOut = player.cashedOutMultiplier !== null;
              return (
                <div
                  key={player.id}
                  className={`p-2 rounded-lg flex items-center justify-between text-xs transition ${
                    hasCashedOut
                      ? 'bg-emerald-950/40 border border-emerald-800/40'
                      : 'bg-neutral-900/40 hover:bg-neutral-900/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-neutral-700 flex items-center justify-center font-bold text-[10px] text-neutral-300">
                      {player.username.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-semibold text-neutral-200 truncate max-w-[90px] sm:max-w-[110px]">
                      {player.username}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <span className="font-mono text-neutral-400">
                      {player.betAmount} {currency}
                    </span>

                    {hasCashedOut ? (
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          {player.cashedOutMultiplier?.toFixed(2)}x
                        </span>
                        <span className="font-mono font-bold text-emerald-400 text-xs min-w-[50px]">
                          +{player.winAmount?.toFixed(0)} {currency}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-neutral-600 font-mono">
                        flying...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: My Bets History */}
      {activeTab === 'MY' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {userBetsHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 text-xs py-10">
              <User className="w-8 h-8 mb-2 opacity-40" />
              <span>You have not placed any bets yet.</span>
              <span className="text-[10px] mt-1 text-orange-400">Place a bet to see your history!</span>
            </div>
          ) : (
            userBetsHistory.map((bet) => (
              <div
                key={bet.id}
                className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Panel #{bet.panelId}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {new Date(bet.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                    Wager: {bet.amount} {currency}
                  </div>
                </div>

                <div className="text-right">
                  {bet.status === 'CASHED_OUT' ? (
                    <div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-block mb-0.5">
                        @{bet.cashedOutMultiplier?.toFixed(2)}x
                      </span>
                      <div className="font-mono font-bold text-emerald-400">
                        +{bet.winAmount?.toFixed(2)} {currency}
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-400 font-bold font-mono">
                      -{bet.amount} {currency}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Top Wins Leaderboard */}
      {activeTab === 'TOP' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Highest Multipliers on Safari Aviator</span>
          </div>

          {topWinsMock.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold font-mono text-[11px]">
                  {idx + 1}
                </span>
                <div>
                  <div className="font-bold text-white">{item.user}</div>
                  <div className="text-[10px] text-neutral-500">
                    Bet: {item.bet} {currency} • {item.date}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-black bg-gradient-to-r from-amber-500/20 to-orange-500/30 text-amber-300 border border-amber-500/50 inline-block">
                  {item.mult.toFixed(2)}x
                </span>
                <div className="font-mono font-bold text-emerald-400 text-xs mt-0.5">
                  +{item.win.toLocaleString()} {currency}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Live Chat */}
      {activeTab === 'CHAT' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-lg text-xs ${
                  msg.isWin
                    ? 'bg-emerald-950/40 border border-emerald-800/40'
                    : 'bg-neutral-900/80 border border-neutral-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-orange-400">{msg.user}</span>
                  <span className="text-[10px] text-neutral-500">{msg.time}</span>
                </div>
                <p className="text-neutral-200">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Chat Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-2 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={language === 'am' ? 'መልእክት ጻፍ...' : 'Say something in chat...'}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              className="p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg active:scale-95 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
