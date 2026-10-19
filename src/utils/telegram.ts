// Telegram Mini App (TMA) SDK Interface & Bot API Utilities

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: string;
    hash?: string;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation?: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && Boolean(window.Telegram?.WebApp?.initData || window.Telegram?.WebApp?.platform);
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

export function initTelegramApp(): TelegramUser | null {
  const tg = getTelegramWebApp();
  if (!tg) return null;

  try {
    tg.ready();
    tg.expand();
    if (tg.enableClosingConfirmation) {
      tg.enableClosingConfirmation();
    }
    tg.setHeaderColor('#0a0a0c');
    tg.setBackgroundColor('#0a0a0c');

    if (tg.initDataUnsafe?.user) {
      return tg.initDataUnsafe.user;
    }
  } catch (e) {
    console.warn('Telegram WebApp init notice:', e);
  }
  return null;
}

export function triggerTelegramHaptic(
  type: 'impact' | 'notification' | 'selection',
  style?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning'
) {
  const tg = getTelegramWebApp();
  if (!tg?.HapticFeedback) return;

  try {
    if (type === 'impact') {
      tg.HapticFeedback.impactOccurred((style as 'medium') || 'medium');
    } else if (type === 'notification') {
      tg.HapticFeedback.notificationOccurred((style as 'success') || 'success');
    } else if (type === 'selection') {
      tg.HapticFeedback.selectionChanged();
    }
  } catch {
    // Silent fallback
  }
}

export function shareOnTelegram(text: string, url: string) {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  const tg = getTelegramWebApp();
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(shareUrl);
  } else {
    window.open(shareUrl, '_blank');
  }
}

// Official Telegram Bot API Verification and Menu Button Setup
export interface BotInfoResponse {
  ok: boolean;
  result?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
  };
  description?: string;
}

export async function verifyBotToken(token: string): Promise<BotInfoResponse> {
  const cleanToken = token.trim();
  const res = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
  return await res.json();
}

export async function setBotMenuButton(token: string, webAppUrl: string): Promise<{ ok: boolean; description?: string }> {
  const cleanToken = token.trim();
  const res = await fetch(`https://api.telegram.org/bot${cleanToken}/setChatMenuButton`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      menu_button: {
        type: 'web_app',
        text: '🎮 Safari Game',
        web_app: {
          url: webAppUrl,
        },
      },
    }),
  });
  return await res.json();
}
