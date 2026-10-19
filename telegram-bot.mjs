/**
 * Safari Game - Standalone Telegram Bot Server
 * 
 * Run with:
 *   node telegram-bot.mjs
 * Or:
 *   BOT_TOKEN="your_token_here" node telegram-bot.mjs
 */

const BOT_TOKEN = process.env.BOT_TOKEN || '8806462637:AAHUn6nU3OsugLXby_Cjx9ZIlTK9AnZWXks';
const WEB_APP_URL = process.env.APP_URL || 'https://ais-pre-qch5b7g5osydcuvmdrh4mf-49011619423.europe-west2.run.app';
const TELEBIRR_NUMBER = '0932335247';

console.log('----------------------------------------------------');
console.log('🦁 Safari Game Telegram Bot Server');
console.log(`📡 WebApp URL: ${WEB_APP_URL}`);
console.log(`📱 Telebirr Receiver: ${TELEBIRR_NUMBER}`);
console.log('----------------------------------------------------');

if (BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  console.log('ℹ️ To connect your live bot, set your token from @BotFather:');
  console.log('   export BOT_TOKEN="123456789:ABCdef..."');
  console.log('   node telegram-bot.mjs');
}

async function tgRequest(method, data = {}) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

async function startPolling() {
  if (BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') return;

  try {
    const me = await tgRequest('getMe');
    if (!me.ok) {
      console.error('❌ Failed to connect with bot token:', me.description);
      return;
    }
    console.log(`✅ Connected as @${me.result.username} (${me.result.first_name})`);

    // Set Menu Button
    await tgRequest('setChatMenuButton', {
      menu_button: {
        type: 'web_app',
        text: '🎮 Safari Game',
        web_app: { url: WEB_APP_URL },
      },
    });

    let offset = 0;
    while (true) {
      try {
        const updates = await tgRequest('getUpdates', { offset, timeout: 30 });
        if (updates.ok && updates.result) {
          for (const u of updates.result) {
            offset = u.update_id + 1;

            if (u.message && u.message.text) {
              const chatId = u.message.chat.id;
              const text = u.message.text.trim();
              const sender = u.message.from?.first_name || 'ተጫዋች';

              if (text.startsWith('/start')) {
                await tgRequest('sendMessage', {
                  chat_id: chatId,
                  text: `👋 ሰላም ${sender}!\n\nወደ **Safari Game** Aviator & Chicken Road ቦት እንኳን ደህና መጡ!\n\n🇪🇹 በኢትዮጵያ ፈጣኑ እና አስተማማኙ የክራሽ (Crash) እና የዶሮ መንገድ ጨዋታ።\n\n💰 **የቴሌብር ቁጥር**: \`${TELEBIRR_NUMBER}\`\n\nጨዋታውን ለመጀመር ከታች ያለውን አዝራር ይጫኑ:`,
                  parse_mode: 'Markdown',
                  reply_markup: {
                    inline_keyboard: [
                      [{ text: '🎮 Safari Game ጀምር (Mini App)', web_app: { url: WEB_APP_URL } }],
                      [
                        { text: '💰 ቴሌብር ተቀማጭ', callback_data: 'DEPOSIT' },
                        { text: '🐔 Chicken Road', web_app: { url: WEB_APP_URL } }
                      ],
                      [
                        { text: '📤 ጓደኛ ጋብዝ (Share)', switch_inline_query: 'Play Safari Game Aviator & Chicken Road!' }
                      ]
                    ],
                  },
                });
              } else if (text.startsWith('/deposit')) {
                await tgRequest('sendMessage', {
                  chat_id: chatId,
                  text: `💳 **የቴሌብር ተቀማጭ መመሪያ**:\n\n1. ወደ ቴሌብር አፕሊኬሽን ወይም *127# ይደውሉ\n2. ወደ **${TELEBIRR_NUMBER}** (Safari Cashier) ገንዘብ ይላኩ\n3. የደረሰኝ ቁጥሩን በጨዋታው ውስጥ 'ተቀማጭ' በሚለው ቅጽ ላይ ያስገቡ\n4. አድሚን ወዲያውኑ አረጋግጦ ሂሳብዎን ይሞላል!`,
                  parse_mode: 'Markdown',
                  reply_markup: {
                    inline_keyboard: [
                      [{ text: '👉 አሁን ተቀማጭ አድርግ', web_app: { url: WEB_APP_URL } }]
                    ]
                  }
                });
              }
            } else if (u.callback_query) {
              const query = u.callback_query;
              if (query.data === 'DEPOSIT') {
                await tgRequest('sendMessage', {
                  chat_id: query.message.chat.id,
                  text: `💳 የቴሌብር ቁጥር: **${TELEBIRR_NUMBER}**\nገንዘቡን ከላኩ በኋላ በ Mini App ውስጥ ያለውን የተጠቃሚ ቅጽ ይሙሉ!`,
                  parse_mode: 'Markdown',
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  } catch (e) {
    console.error('Error in bot:', e);
  }
}

startPolling();
