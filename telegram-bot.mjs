/**
 * Safari Game - Standalone Telegram Bot Server
 * 
 * Run with:
 *   node telegram-bot.mjs
 * Or:
 *   BOT_TOKEN="your_token_here" node telegram-bot.mjs
 */

const BOT_TOKEN = process.env.BOT_TOKEN || '8806462637:AAHUn6nU3OsugLXby_Cjx9ZIlTK9AnZWXks';
const WEB_APP_URL = process.env.OVERRIDE_WEB_APP_URL || 'https://safari-games.vercel.app/';
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
                const parts = text.split(' ');
                const startParam = parts.length > 1 ? parts[1].trim() : '';
                const hasReferral = Boolean(startParam);

                const welcomeText = hasReferral
                  ? `👋 ሰላም ${sender}!\n\n🎁 **እንኳን ደህና መጡ! በጓደኛዎ ተጋብዘዋል!**\nበ Safari Game ሲመዘገቡ ከ 1 እስከ 5 ብር ፈጣን ቦነስ ያገኛሉ!\n\n🌐 **ይፋዊ ዌብሳይት**: ${WEB_APP_URL}\n💰 **የቴሌብር ቁጥር**: \`${TELEBIRR_NUMBER}\``
                  : `👋 ሰላም ${sender}!\n\nወደ **Safari Game** Aviator & Chicken Road ቦት እንኳን ደህና መጡ!\n\n🇪🇹 በኢትዮጵያ ፈጣኑ እና አስተማማኙ የክራሽ (Crash) እና የዶሮ መንገድ ጨዋታ።\n🎁 **ጓደኛ በመጋበዝ ከ 1 እስከ 5 ብር ቦነስ ያግኙ!**\n\n🌐 **ይፋዊ ዌብሳይት**: ${WEB_APP_URL}\n💰 **የቴሌብር ቁጥር**: \`${TELEBIRR_NUMBER}\``;

                await tgRequest('sendMessage', {
                  chat_id: chatId,
                  text: welcomeText,
                  parse_mode: 'Markdown',
                  reply_markup: {
                    inline_keyboard: [
                      [{ text: '🎮 Safari Game ጀምር (Mini App)', web_app: { url: WEB_APP_URL } }],
                      [
                        { text: '🎁 ሪፈራል (ከ 1-5 ብር ያግኙ)', callback_data: 'REFERRAL' },
                        { text: '🐔 Chicken Road', web_app: { url: WEB_APP_URL } }
                      ],
                      [
                        { text: '💰 ቴሌብር ተቀማጭ', callback_data: 'DEPOSIT' },
                        { text: '📤 ጓደኛ ጋብዝ', switch_inline_query: `🦁 በሳፋሪ ጌም አቪዬተርና ቺከን ሮድ ይጫወቱ! በኔ ሊንክ ሲገቡ ከ 1 እስከ 5 ብር ቦነስ ያገኛሉ: ${WEB_APP_URL}?ref=ref_${chatId}` }
                      ]
                    ],
                  },
                });
              } else if (text.startsWith('/referral')) {
                const refLink = `https://t.me/SafariGameOfficial_bot?startapp=ref_${chatId}`;
                const webRefLink = `${WEB_APP_URL}?ref=ref_${chatId}`;

                await tgRequest('sendMessage', {
                  chat_id: chatId,
                  text: `🎁 **የሳፋሪ ጌም የሪፈራል ፕሮግራም (1.00 - 5.00 ETB)**\n\nለእያንዳንዱ ለሚጋብዙት ጓደኛ **ከ 1 ብር እስከ 5 ብር** ፈጣን ቦነስ በቀጥታ ወደ ዋና ዋሌትዎ ገቢ ይደረጋል!\n\n🔗 **የእርስዎ መጋበዣ ሊንክ (Telegram Bot)**:\n\`${refLink}\`\n\n🌐 **የዌብሳይት ሊንክ (Direct Web)**:\n\`${webRefLink}\`\n\nጓደኞችዎ በእርስዎ ሊንክ ሲመዘገቡ ወዲያውኑ ቦነሱ ወደ ሂሳብዎ ይገባል!`,
                  parse_mode: 'Markdown',
                  reply_markup: {
                    inline_keyboard: [
                      [
                        { 
                          text: '📤 ለጓደኛ አጋራ (Share Link)', 
                          switch_inline_query: `🦁 በሳፋሪ ጌም አቪዬተርና ቺከን ሮድ ይጫወቱ! በኔ ሊንክ ሲገቡ ከ 1 እስከ 5 ብር ቦነስ ያገኛሉ: ${webRefLink}` 
                        }
                      ],
                      [
                        { text: '🎮 ወደ ጨዋታው ግባ (Play Now)', web_app: { url: WEB_APP_URL } }
                      ]
                    ]
                  }
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
              const chatId = query.message?.chat?.id;

              if (query.data === 'DEPOSIT') {
                await tgRequest('sendMessage', {
                  chat_id: chatId,
                  text: `💳 የቴሌብር ቁጥር: **${TELEBIRR_NUMBER}**\nገንዘቡን ከላኩ በኋላ በ Mini App ውስጥ ያለውን የተጠቃሚ ቅጽ ይሙሉ!`,
                  parse_mode: 'Markdown',
                });
              } else if (query.data === 'REFERRAL') {
                const refLink = `https://t.me/SafariGameOfficial_bot?startapp=ref_${chatId}`;
                const webRefLink = `${WEB_APP_URL}?ref=ref_${chatId}`;

                await tgRequest('sendMessage', {
                  chat_id: chatId,
                  text: `🎁 **የሪፈራል ቦነስ (1 - 5 ETB)**:\n\nለእያንዳንዱ ለጋበዙት ሰው ከ 1 እስከ 5 ብር ቦነስ ያግኙ!\n\nየእርስዎ ሊንክ:\n\`${refLink}\`\nወይም:\n\`${webRefLink}\``,
                  parse_mode: 'Markdown',
                  reply_markup: {
                    inline_keyboard: [
                      [{ 
                        text: '📤 አሁኑኑ አጋራ (Share)', 
                        switch_inline_query: `🦁 በሳፋሪ ጌም አቪዬተርና ቺከን ሮድ ይጫወቱ! በኔ ሊንክ ሲገቡ ከ 1 እስከ 5 ብር ቦነስ ያገኛሉ: ${webRefLink}` 
                      }]
                    ]
                  }
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
