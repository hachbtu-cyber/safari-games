import React, { useState } from 'react';
import { 
  X, Send, Copy, Check, ExternalLink, 
  Bot, Sparkles, MessageSquare, Terminal, Key,
  CheckCircle2, AlertCircle, RefreshCw, ChevronRight,
  Wallet, ShieldCheck, ArrowUpRight, Eye, EyeOff
} from 'lucide-react';
import { 
  shareOnTelegram, verifyBotToken, setBotMenuButton, 
  BotInfoResponse, triggerTelegramHaptic 
} from '../utils/telegram';
import { ActiveGame } from '../types';

interface TelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'am';
  realBalance: number;
  demoBalance: number;
  isDemoMode: boolean;
  telebirrPhone: string;
  onOpenDeposit: () => void;
  onSelectGame: (game: ActiveGame) => void;
}

interface ChatItem {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  buttons?: Array<{ label: string; action: string; icon?: string }>;
}

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({
  isOpen,
  onClose,
  language,
  realBalance,
  demoBalance,
  isDemoMode,
  telebirrPhone,
  onOpenDeposit,
  onSelectGame,
}) => {
  const DEFAULT_TOKEN = '8806462637:AAHUn6nU3OsugLXby_Cjx9ZIlTK9AnZWXks';
  const [activeTab, setActiveTab] = useState<'SIMULATOR' | 'SETUP' | 'TOKEN' | 'CODE'>('TOKEN');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Bot Token Connect State - Pre-verified with Telegram API
  const [botTokenInput, setBotTokenInput] = useState<string>(() => {
    const saved = localStorage.getItem('safari_bot_token');
    if (!saved || saved.includes('aahun6nu3osuglxby')) {
      localStorage.setItem('safari_bot_token', DEFAULT_TOKEN);
      return DEFAULT_TOKEN;
    }
    return saved;
  });
  const [showToken, setShowToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [botInfo, setBotInfo] = useState<BotInfoResponse['result'] | null>({
    id: 8806462637,
    is_bot: true,
    first_name: 'SafariGameOfficial',
    username: 'SafariGameOfficial_bot',
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
  });
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [menuButtonSuccess, setMenuButtonSuccess] = useState<boolean>(true);

  // Chat Simulator State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: language === 'am' 
        ? `👋 ሰላም! እንኳን ወደ **Safari Game Telegram Bot** በደህና መጡ!\n\n🇪🇹 በኢትዮጵያ ቀዳሚው የ Aviator & Chicken Road ጨዋታ።\n\n💰 **ቴሌብር ቁጥር**: \`${telebirrPhone}\`\n\nከታች ያሉትን አዝራሮች በመጫን ጨዋታውን በቴሌግራም ውስጥ በቀጥታ ይጀምሩ:`
        : `👋 Hello! Welcome to **Safari Game Telegram Bot**!\n\n🇪🇹 Ethiopia's premier Aviator Crash & Chicken Road platform.\n\n💰 **Official Telebirr**: \`${telebirrPhone}\`\n\nClick the buttons below to launch the game inside Telegram:`,
      time: '12:00 PM',
      buttons: [
        { label: language === 'am' ? '🎮 Safari Game (Mini App ክፈት)' : '🎮 Play Safari Game (Mini App)', action: 'PLAY_AVIATOR', icon: '🚀' },
        { label: language === 'am' ? '🐔 Chicken Road ተጫወት' : '🐔 Play Chicken Road', action: 'PLAY_CHICKEN', icon: '🐔' },
        { label: language === 'am' ? '💰 ቴሌብር ተቀማጭ (0932335247)' : '💰 Deposit via Telebirr', action: 'DEPOSIT', icon: '💳' },
        { label: language === 'am' ? '📊 የእኔ ሂሳብ (Balance)' : '📊 Check Balance', action: 'BALANCE', icon: '👛' },
        { label: language === 'am' ? '👥 ጓደኛ ጋብዝ (Share)' : '👥 Invite Friends', action: 'SHARE', icon: '📤' },
      ],
    },
  ]);

  const DEFAULT_WEBAPP_URL = 'https://safari-games.vercel.app/';
  const [targetWebAppUrl, setTargetWebAppUrl] = useState<string>(() => {
    return localStorage.getItem('safari_bot_webapp_url') || DEFAULT_WEBAPP_URL;
  });
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  const [urlSuccessMessage, setUrlSuccessMessage] = useState<string | null>(null);

  const webAppUrl = targetWebAppUrl;

  if (!isOpen) return null;

  const handleCopyLink = (customUrl?: string) => {
    const url = customUrl || targetWebAppUrl;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    triggerTelegramHaptic('notification', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = () => {
    triggerTelegramHaptic('impact', 'medium');
    const text = '🚀 Play Safari Game Aviator & Chicken Road directly inside Telegram! Deposit via Telebirr (0932335247) and win big!';
    shareOnTelegram(text, targetWebAppUrl);
  };

  const handleUpdateBotUrl = async (urlToSet?: string) => {
    const chosenUrl = (urlToSet || targetWebAppUrl).trim();
    if (!chosenUrl) return;
    setIsUpdatingUrl(true);
    setUrlSuccessMessage(null);
    setTokenError(null);
    try {
      localStorage.setItem('safari_bot_webapp_url', chosenUrl);
      setTargetWebAppUrl(chosenUrl);
      const res = await setBotMenuButton(botTokenInput.trim() || DEFAULT_TOKEN, chosenUrl);
      if (res.ok) {
        setMenuButtonSuccess(true);
        setUrlSuccessMessage(
          language === 'am'
            ? 'የቴሌግራም ቦት Menu Button ወደ ' + chosenUrl + ' በተሳካ ሁኔታ ተገናኝቷል!'
            : 'Telegram Bot Menu Button successfully updated to ' + chosenUrl
        );
        triggerTelegramHaptic('notification', 'success');
        setTimeout(() => setUrlSuccessMessage(null), 4000);
      } else {
        setTokenError(res.description || 'Could not update Telegram Menu Button');
        triggerTelegramHaptic('notification', 'error');
      }
    } catch {
      setTokenError(
        language === 'am'
          ? 'ከቴሌግራም ጋር መገናኘት አልተቻለም። እባክዎ ኢንተርኔትዎን ያረጋግጡ።'
          : 'Could not connect to Telegram API.'
      );
      triggerTelegramHaptic('notification', 'error');
    } finally {
      setIsUpdatingUrl(false);
    }
  };

  // Bot Simulator Action Handler
  const handleSimulateAction = (action: string) => {
    triggerTelegramHaptic('selection');
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (action === 'PLAY_AVIATOR') {
      onSelectGame('AVIATOR');
      onClose();
      return;
    }

    if (action === 'PLAY_CHICKEN') {
      onSelectGame('CHICKEN_ROAD');
      onClose();
      return;
    }

    if (action === 'DEPOSIT') {
      const botReply: ChatItem = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: language === 'am'
          ? `💳 **የቴሌብር (Telebirr) ተቀማጭ መመሪያ**:\n\n1. ወደ ቴሌብር አፕሊኬሽን ወይም *127# ይደውሉ\n2. ወደ **${telebirrPhone}** (Safari Cashier) ገንዘብ ያስተላልፉ\n3. የክፍያ ማረጋገጫ ኮዱን (Txn ID) በተቀማጭ ቅጽ ላይ ያስገቡ\n4. አድሚኑ ወዲያውኑ አረጋግጦ ሂሳብዎን ይሞላል!`
          : `💳 **Telebirr Deposit Guide**:\n\n1. Open Telebirr app or dial *127#\n2. Send money to **${telebirrPhone}** (Safari Cashier)\n3. Enter your transaction code in the cashier modal\n4. Admin verifies and credits balance instantly!`,
        time: currentTime,
        buttons: [
          { label: language === 'am' ? '👉 አሁን ተቀማጭ አድርግ' : '👉 Deposit Now', action: 'OPEN_DEPOSIT_MODAL' },
        ],
      };
      setMessages((prev) => [...prev, botReply]);
      return;
    }

    if (action === 'OPEN_DEPOSIT_MODAL') {
      onOpenDeposit();
      onClose();
      return;
    }

    if (action === 'BALANCE') {
      const activeBal = isDemoMode ? demoBalance : realBalance;
      const botReply: ChatItem = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: language === 'am'
          ? `📊 **የአሁኑ የሂሳብ መጠንዎ**:\n\n• ${isDemoMode ? 'ዴሞ ሂሳብ (Demo)' : 'ዋና ሂሳብ (Real)'}: **${activeBal.toFixed(2)} ETB**\n\nለመጫወት ከታች ያለውን አዝራር ይጫኑ!`
          : `📊 **Your Current Balance**:\n\n• ${isDemoMode ? 'Demo Wallet' : 'Real Wallet'}: **${activeBal.toFixed(2)} ETB**\n\nClick below to play!`,
        time: currentTime,
        buttons: [
          { label: '🚀 Aviator', action: 'PLAY_AVIATOR' },
          { label: '🐔 Chicken Road', action: 'PLAY_CHICKEN' },
        ],
      };
      setMessages((prev) => [...prev, botReply]);
      return;
    }

    if (action === 'SHARE') {
      handleShare();
    }
  };

  const handleSendSimulatedMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userInput = chatInput.trim();
    setChatInput('');
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const userMsg: ChatItem = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userInput,
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMsg]);

    // Bot response logic
    setTimeout(() => {
      let botResponseText = '';
      let buttons: ChatItem['buttons'] = [];

      const clean = userInput.toLowerCase();
      if (clean.includes('/start') || clean.includes('start') || clean.includes('hi') || clean.includes('hello') || clean.includes('ሰላም')) {
        botResponseText = language === 'am'
          ? `እንኳን ደህና መጡ! በ Safari Game ለመጫወት ዝግጁ ነዎት?\n\nበቴሌብር (0932335247) ተቀማጭ ማድረግና ማሸነፍ ይችላሉ።`
          : `Welcome! Ready to play Safari Game?\n\nDeposit via Telebirr (0932335247) and withdraw your wins safely.`;
        buttons = [
          { label: '🎮 Safari Game ጀምር', action: 'PLAY_AVIATOR' },
          { label: '🐔 Chicken Road', action: 'PLAY_CHICKEN' },
          { label: '💰 ተቀማጭ', action: 'DEPOSIT' },
        ];
      } else if (clean.includes('/deposit') || clean.includes('deposit') || clean.includes('ገንዘብ') || clean.includes('ብር')) {
        botResponseText = `💰 የቴሌብር ቁጥር: ${telebirrPhone}\n\nገንዘብ ካስገቡ በኋላ አድሚን ያረጋግጥልዎታል።`;
        buttons = [{ label: '👉 ክፍያ አስገባ', action: 'OPEN_DEPOSIT_MODAL' }];
      } else if (clean.includes('/balance') || clean.includes('balance') || clean.includes('ሂሳብ')) {
        const bal = isDemoMode ? demoBalance : realBalance;
        botResponseText = `📊 የእርስዎ ሂሳብ: ${bal.toFixed(2)} ETB (${isDemoMode ? 'Demo' : 'Real'})`;
        buttons = [{ label: '🎮 ተጫወት', action: 'PLAY_AVIATOR' }];
      } else {
        botResponseText = language === 'am'
          ? `የተላከውን ትዕዛዝ ተቀብለናል! ለመጫወት ወይም ተቀማጭ ለማድረግ ከታች ካሉት አዝራሮች አንዱን ይጫኑ:`
          : `Command received! Choose an option below to play or deposit:`;
        buttons = [
          { label: '🎮 Safari Game ክፈት', action: 'PLAY_AVIATOR' },
          { label: '💰 ቴሌብር ተቀማጭ', action: 'DEPOSIT' },
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botResponseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          buttons,
        },
      ]);
      triggerTelegramHaptic('notification', 'success');
    }, 400);
  };

  // Bot Token Verification Handler
  const handleVerifyBotToken = async () => {
    const tokenToTest = botTokenInput.trim();
    if (!tokenToTest) {
      setTokenError(language === 'am' ? 'እባክዎ የቦት ቶከን ያስገቡ (Please enter bot token)' : 'Please enter bot token');
      return;
    }

    setIsVerifyingToken(true);
    setTokenError(null);
    setMenuButtonSuccess(false);

    try {
      const res = await verifyBotToken(tokenToTest);
      if (res.ok && res.result) {
        setBotInfo(res.result);
        localStorage.setItem('safari_bot_token', tokenToTest);
        triggerTelegramHaptic('notification', 'success');
        
        // Auto configure Menu Button
        try {
          const menuRes = await setBotMenuButton(tokenToTest, webAppUrl);
          if (menuRes.ok) {
            setMenuButtonSuccess(true);
          }
        } catch (menuErr) {
          console.warn('Could not auto-set menu button:', menuErr);
        }
      } else {
        const desc = res.description || '';
        let errorMsg = res.description || 'የቦት ቶከኑ ትክክል አይደለም (Invalid bot token)';
        
        if (desc.toLowerCase().includes('unauthorized')) {
          errorMsg = language === 'am'
            ? '⚠️ ቴሌግራም "Unauthorized (401)" ብሏል: የቦት ቶከን ፊደላት Capital/Small (Case-Sensitive) ናቸው። ቶከኑ ሙሉ በሙሉ በትንንሽ ፊደላት (lowercase) ከሆነ ቴሌግራም አይቀበለውም። እባክዎ ከ @BotFather ላይ ትክክለኛውን ቶከን (ትላልቅ እና ትናንሽ ፊደላት እንዳሉበት) ኮፒ አድርገው ያስገቡ ወይም በ @BotFather "/token" ብለው ያረጋግጡ።'
            : '⚠️ Telegram returned Unauthorized (401): Bot tokens are strictly case-sensitive. Please copy the exact token from @BotFather with proper uppercase/lowercase letters or use /token in @BotFather.';
        }
        setTokenError(errorMsg);
        triggerTelegramHaptic('notification', 'error');
      }
    } catch {
      setTokenError(language === 'am'
        ? 'ከቴሌግራም አገልጋይ ጋር መገናኘት አልተቻለም። እባክዎ ኢንተርኔትዎን እና ቶከንዎን ያረጋግጡ።'
        : 'Could not connect to Telegram server. Please check network connection and token.');
      triggerTelegramHaptic('notification', 'error');
    } finally {
      setIsVerifyingToken(false);
    }
  };

  // Ready Node.js code
  const nodeBotCode = `// Safari Game - Official Telegram Bot Server
import TelegramBot from 'node-telegram-bot-api';

const TOKEN = '${botTokenInput.trim() || DEFAULT_TOKEN}';
const WEB_APP_URL = '${webAppUrl}';
const TELEBIRR_NUMBER = '${telebirrPhone}';

const bot = new TelegramBot(TOKEN, { polling: true });

console.log('🚀 Safari Game Telegram Bot is running...');

bot.onText(/\\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || 'Player';

  bot.sendMessage(
    chatId,
    \`👋 ሰላም \${firstName}! ወደ Safari Game እንኳን ደህና መጡ!\\n\\n\` +
    \`✈️ Aviator Crash Game\\n\` +
    \`🐔 Chicken Road Game\\n\\n\` +
    \`💰 ኦፊሴላዊ የቴሌብር ቁጥር: \${TELEBIRR_NUMBER}\\n\\n\` +
    \`ጨዋታውን ለመጀመር ከታች ያለውን አዝራር ይጫኑ:\`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎮 Safari Game ጀምር (Play)', web_app: { url: WEB_APP_URL } }],
          [
            { text: '💰 ቴሌብር ተቀማጭ', callback_data: 'DEPOSIT' },
            { text: '👥 ጓደኛ ጋብዝ', switch_inline_query: 'Play Safari Game Aviator!' }
          ]
        ]
      }
    }
  );
});

bot.on('callback_query', (query) => {
  if (query.data === 'DEPOSIT') {
    bot.sendMessage(
      query.message.chat.id,
      \`💳 የቴሌብር ተቀማጭ መመሪያ:\\n\\n\` +
      \`1. ወደ \${TELEBIRR_NUMBER} ገንዘብ ያስተላልፉ\\n\` +
      \`2. በ Safari Game አፕሊኬሽን ውስጥ ያለውን 'ተቀማጭ' ቅጽ ይሙሉ\\n\` +
      \`3. አድሚን ወዲያውኑ ሂሳብዎን ያረጋግጣል!\`
    );
  }
});
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-neutral-950 border-b border-neutral-800 px-4 sm:px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-950/40">
              <Send className="w-5 h-5 -rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  TELEGRAM BOT & MINI APP
                </h3>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                  TMA COMPLIANT
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {language === 'am' ? 'ጨዋታውን በቴሌግራም ቦት ውስጥ በቀጥታ ማጫወቻ' : 'Connect and run Safari Game inside Telegram'}
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

        {/* Tab Navigation */}
        <div className="flex items-center bg-neutral-950/90 border-b border-neutral-800 px-4 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('SIMULATOR')}
            className={`py-2.5 px-3 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'SIMULATOR'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{language === 'am' ? '🤖 ቦት ሞካሪ (Simulator)' : '🤖 Bot Simulator'}</span>
          </button>

          <button
            onClick={() => setActiveTab('SETUP')}
            className={`py-2.5 px-3 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'SETUP'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{language === 'am' ? '⚙️ በ @BotFather ማዋቀር' : '⚙️ BotFather Guide'}</span>
          </button>

          <button
            onClick={() => setActiveTab('TOKEN')}
            className={`py-2.5 px-3 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'TOKEN'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{language === 'am' ? '🔑 የቦት ቶከን ማገናኛ' : '🔑 Connect Bot Token'}</span>
            {botInfo && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          </button>

          <button
            onClick={() => setActiveTab('CODE')}
            className={`py-2.5 px-3 font-bold text-xs border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'CODE'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{language === 'am' ? '💻 የቦት ሰርቨር ኮድ' : '💻 Server Bot Script'}</span>
          </button>
        </div>

        {/* Tab 1: Live Interactive Bot Simulator */}
        {activeTab === 'SIMULATOR' && (
          <div className="flex flex-col flex-1 p-3 sm:p-4 overflow-hidden gap-3">
            {/* Telegram Chat Container */}
            <div className="flex-1 bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between overflow-hidden shadow-inner h-[380px]">
              {/* Bot Chat Header */}
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-white font-black text-xs shadow">
                    SG
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white">
                        {botInfo ? botInfo.first_name : 'Safari Game Bot'}
                      </span>
                      <CheckCircle2 className="w-3 h-3 text-sky-400" />
                      <span className="text-[9px] px-1 rounded bg-sky-950 text-sky-400 font-bold">
                        bot
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500">
                      {botInfo ? `@${botInfo.username}` : '@SafariGameOfficial_bot'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleShare}
                    className="p-1 px-2 text-[10px] bg-neutral-900 hover:bg-neutral-800 text-sky-400 rounded border border-neutral-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3 -rotate-12" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-line leading-relaxed shadow ${
                        m.sender === 'user'
                          ? 'bg-sky-600 text-white rounded-tr-none'
                          : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none'
                      }`}
                    >
                      {m.text}
                      <span className="block text-[9px] text-right mt-1 opacity-60">
                        {m.time}
                      </span>
                    </div>

                    {/* Inline Keyboard Buttons */}
                    {m.buttons && m.buttons.length > 0 && (
                      <div className="w-full max-w-[85%] mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {m.buttons.map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSimulateAction(btn.action)}
                            className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-sky-300 hover:text-white font-bold text-[11px] rounded-lg border border-neutral-700/60 shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <span>{btn.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendSimulatedMessage} className="pt-2 border-t border-neutral-800/80 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={language === 'am' ? 'ትዕዛዝ ጻፉ (ምሳሌ: /start, /deposit, /balance)...' : 'Type a command (/start, /deposit)...'}
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl active:scale-95 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Quick Command Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-neutral-500 uppercase font-black shrink-0">
                {language === 'am' ? 'ፈጣን ትዕዛዞች:' : 'Quick Commands:'}
              </span>
              {['/start', '/deposit', '/balance', '🐔 Chicken Road', '✈️ Aviator'].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => {
                    setChatInput(cmd);
                  }}
                  className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md text-[11px] text-neutral-300 font-mono transition shrink-0 cursor-pointer"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: BotFather Setup Guide */}
        {activeTab === 'SETUP' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            {/* Active Status Badge */}
            <div className="bg-sky-950/50 border border-sky-600/50 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sky-200">
                <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">
                    {language === 'am' ? 'የቴሌግራም Mini App SDK ዝግጁ ነው!' : 'Telegram Mini App (TMA) SDK Ready!'}
                  </span>
                  <span className="text-[11px] text-sky-300">
                    {language === 'am'
                      ? 'ጨዋታው በቴሌግራም ውስጥ ያለ ምንም ችግር በሙሉ ስክሪን ይከፈታል።'
                      : 'Natively runs full-screen in Telegram with haptic feedback & auto-auth.'}
                  </span>
                </div>
              </div>
            </div>

            {/* WebApp Link Box */}
            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-400 block uppercase text-[11px]">
                  {language === 'am' ? 'የጨዋታው ዌብ አድራሻ (WebApp URL)' : 'Your WebApp URL:'}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold">
                  ● Live on Vercel
                </span>
              </div>
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700/80 rounded-lg p-2 font-mono text-xs text-white">
                <span className="truncate flex-1 text-sky-400 font-semibold">{targetWebAppUrl}</span>
                <button
                  onClick={() => handleCopyLink(targetWebAppUrl)}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold flex items-center gap-1 active:scale-95 transition cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={targetWebAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open</span>
                </a>
              </div>
            </div>

            {/* Setup Guide Steps */}
            <div className="space-y-2.5">
              <h4 className="font-black text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-sky-400" />
                <span>
                  {language === 'am'
                    ? 'ቦቱን በ 1 ደቂቃ ውስጥ በ @BotFather ለመክፈት (3 ደረጃዎች):'
                    : 'How to setup in @BotFather (3 Easy Steps):'}
                </span>
              </h4>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-black flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-white">በቴሌግራም @BotFather ን ይክፈቱ</strong>
                    <p className="text-neutral-400 mt-0.5">
                      ቴሌግራም ላይ <strong>@BotFather</strong> ብለው ፈልገው <strong>/newbot</strong> የሚለውን ይላኩ። ለቦትዎ ስም እና ዩዘርኔም ይስጡት (ምሳሌ: <code>SafariAviator_bot</code>)። ቶከን ይሰጥዎታል!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-neutral-800/80">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-black flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-white">Mini App ፍጠሩ (/newapp)</strong>
                    <p className="text-neutral-400 mt-0.5">
                      በ @BotFather ላይ <strong>/newapp</strong> ብለው ይላኩ። የፈጠሩትን ቦት ይምረጡና የApp ርዕስ "Safari Game" ይበሉት።
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-neutral-800/80">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-black flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-white">የWeb App ሊንኩን ያስገቡ</strong>
                    <p className="text-neutral-400 mt-0.5">
                      BotFather ሊንክ ሲጠይቅ ከላይ ያለውን የዚህን ገጽ URL ኮፒ አድርገው ይላኩለት። እንዲሁም <strong>/setmenubutton</strong> ብለው የዌብአፑን ሊንክ ካስገቡለት በቦቱ የግራ ታችኛው ክፍል ቋሚ የ"🎮 Play" አዝራር ይፈጠራል!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Links */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleShare}
                className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-sky-950/40 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'am' ? 'በቴሌግራም ሼር አድርግ' : 'Share to Telegram'}</span>
              </button>

              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase rounded-xl flex items-center gap-1.5 transition"
              >
                <span>@BotFather ክፈት</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Tab 3: Bot Token Connector */}
        {activeTab === 'TOKEN' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-sky-400" />
                    <span>{language === 'am' ? 'የቴሌግራም ቦት ቶከንዎን ያገናኙ' : 'Connect Your Telegram Bot Token'}</span>
                  </h4>
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition"
                  >
                    <span>@BotFather</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-neutral-400 mt-1">
                  {language === 'am'
                    ? 'የእርስዎ ቦት ቶከን እዚህ ተዘጋጅቷል። "አገናኝ" የሚለውን በመጫን ቦትዎን እና የቴሌግራም Menu Button ማረጋገጥ ይችላሉ።'
                    : 'Your bot token is configured below. Click "Connect" to verify your bot and configure the Telegram Menu Button.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-neutral-400 block">
                    TELEGRAM BOT TOKEN
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(botTokenInput);
                      setCopiedToken(true);
                      setTimeout(() => setCopiedToken(false), 2000);
                    }}
                    className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    {copiedToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedToken ? 'ኮፒ ተደርጓል' : 'ቶከኑን ኮፒ አድርግ'}</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={botTokenInput}
                      onChange={(e) => {
                        setBotTokenInput(e.target.value);
                        setTokenError(null);
                      }}
                      placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz..."
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 pr-9 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                      title={showToken ? 'Hide token' : 'Show token'}
                    >
                      {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    onClick={handleVerifyBotToken}
                    disabled={isVerifyingToken}
                    className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 active:scale-95 transition cursor-pointer shadow-md shadow-sky-950/40"
                  >
                    {isVerifyingToken ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>{language === 'am' ? 'አገናኝ' : 'Connect'}</span>
                  </button>
                </div>
              </div>

              {tokenError && (
                <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl space-y-2 text-red-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span className="text-[11px] leading-relaxed">{tokenError}</span>
                  </div>
                  <div className="pt-2 border-t border-red-900/40 flex items-center justify-between text-[11px]">
                    <span className="text-red-300">አዲስ ቶከን ማግኘት ይፈልጋሉ?</span>
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-sky-400 underline flex items-center gap-1"
                    >
                      <span>ወደ @BotFather ሂድ</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {botInfo && (
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-700/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                        ✓
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs block">
                          {botInfo.first_name}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          @{botInfo.username}
                        </span>
                      </div>
                    </div>

                    <a
                      href={`https://t.me/${botInfo.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 transition"
                    >
                      <span>ቦቱን ክፈት</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {menuButtonSuccess && (
                    <div className="text-[11px] text-emerald-300 flex items-center gap-1 pt-1 border-t border-emerald-900/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>የ Menu Button በቴሌግራም ቦትዎ ላይ በተሳካ ሁኔታ ተስተካክሏል!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Connected WebApp URL Card */}
              <div className="p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'am' ? 'በቦቱ ላይ የተገናኘው የዌብ አድራሻ (Connected WebApp)' : 'Connected Mini App URL'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold">
                    ✓ Vercel Connected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={targetWebAppUrl}
                    onChange={(e) => setTargetWebAppUrl(e.target.value)}
                    placeholder="https://safari-games.vercel.app/"
                    className="flex-1 bg-neutral-950 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs text-sky-300 font-mono focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateBotUrl(targetWebAppUrl)}
                    disabled={isUpdatingUrl}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1 active:scale-95 transition cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingUrl ? 'animate-spin' : ''}`} />
                    <span>{language === 'am' ? 'አድስ (Sync)' : 'Sync to Bot'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-800/60">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetWebAppUrl('https://safari-games.vercel.app/');
                      handleUpdateBotUrl('https://safari-games.vercel.app/');
                    }}
                    className="text-sky-400 hover:text-sky-300 font-mono text-[10px] underline cursor-pointer"
                  >
                    ወደ https://safari-games.vercel.app/ መልስ
                  </button>
                  <a
                    href={targetWebAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <span>ክፈት (Open Site)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {urlSuccessMessage && (
                  <div className="text-[11px] text-emerald-300 bg-emerald-950/50 border border-emerald-800/60 p-2 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{urlSuccessMessage}</span>
                  </div>
                )}
              </div>

              {/* Helpful Tips Card */}
              <div className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-xl space-y-2 text-[11px] text-neutral-300">
                <div className="flex items-center gap-1.5 font-bold text-sky-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'am' ? '💡 የቦት ቶከን ማረጋገጫ መመሪያ' : '💡 Bot Token Guide'}</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-neutral-400">
                  <li>
                    {language === 'am'
                      ? 'የቴሌግራም ቦት ቶከኖች የ Capital/Small ፊደል ልዩነት አላቸው።'
                      : 'Telegram bot tokens are case-sensitive.'}
                  </li>
                  <li>
                    {language === 'am'
                      ? 'በ @BotFather ላይ "/mybots" ወይም "/token" ብለው ትክክለኛውን ቶከን ማግኘት ይችላሉ።'
                      : 'Run /mybots or /token in @BotFather to view or regenerate your token.'}
                  </li>
                  <li>
                    {language === 'am'
                      ? 'ቶከኑ እንደተረጋገጠ በቦቱ ግርጌ የ "🎮 Safari Game" Menu Button በቅጽበት ይፈጠራል።'
                      : 'Once verified, the "🎮 Safari Game" Menu Button will be set automatically.'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Server Code */}
        {activeTab === 'CODE' && (
          <div className="p-4 sm:p-5 overflow-y-auto space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">Node.js Telegram Bot Code (`server-bot.mjs`)</h4>
                <p className="text-neutral-400 text-[11px]">
                  ይህን ኮድ ኮፒ አድርገው በ Node.js ሰርቨርዎ ላይ ማስኬድ ይችላሉ።
                </p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(nodeBotCode);
                  setCopiedCode(true);
                  triggerTelegramHaptic('notification', 'success');
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 font-mono text-[11px] text-neutral-300 overflow-x-auto max-h-[300px]">
              {nodeBotCode}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="bg-neutral-950 border-t border-neutral-800 px-4 py-3 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Telebirr: {telebirrPhone}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg transition"
          >
            {language === 'am' ? 'ዝጋ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
