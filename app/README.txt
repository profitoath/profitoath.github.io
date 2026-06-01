profitoath — Telegram Mini App (landing/app/index.html)
=======================================================

WHAT THIS IS
------------
A native-feeling Telegram Mini App (Web App) shell for the profitoath bot.
It links the shared design system (../assets/style.css) and logo
(../assets/logo.svg) and loads the official Telegram WebApp SDK:
  https://telegram.org/js/telegram-web-app.js

It degrades gracefully: opened in a normal browser (no Telegram), the page
still renders and every button is interactive — instead of sending data it
shows an inline note "Buka lewat bot Telegram untuk hasil live / Open via the
Telegram bot for live results."


HOW IT IS LAUNCHED
------------------
1. Host this folder over HTTPS (Telegram requires HTTPS for Web Apps).
   Example public URL:  https://<your-domain>/app/index.html
2. Put that URL in the bot config as WEBAPP_URL in .env, e.g.
       WEBAPP_URL=https://<your-domain>/app/index.html
3. The bot opens it one of these ways:
   a) Inline / reply keyboard button:
        InlineKeyboardButton(text="Open App", web_app=WebAppInfo(url=WEBAPP_URL))
        KeyboardButton(text="Open App", web_app=WebAppInfo(url=WEBAPP_URL))
   b) Chat menu button (also settable once via BotFather → /mybots →
      Bot Settings → Menu Button → set URL to WEBAPP_URL):
        bot.set_chat_menu_button(menu_button=MenuButtonWebApp(text="App", web_app=WebAppInfo(url=WEBAPP_URL)))

   Optional query params appended to the URL:
     ?tier=FREE|PRO|VIP|ADMIN   → renders the tier badge (🆓/⭐/💎/👑) and the
                                   Account card. Defaults to FREE if absent/invalid.
     (you may combine, e.g.  .../app/index.html?tier=PRO )


DATA IT SENDS BACK (tg.sendData payloads)
-----------------------------------------
When running INSIDE Telegram, taps call tg.sendData(JSON.stringify(payload))
and then tg.close(). The bot receives this as message.web_app_data.data
(a JSON string) — parse it and route on the "action" field.

Payload shapes (exact JSON):

  Analyze (ticker input + asset chip + "Analisa" button / MainButton):
    {"action":"analyze","symbol":"BBCA","asset":"stock"}
      - symbol: uppercased, trimmed text from the input
      - asset : one of  "stock" | "forex" | "commodity" | "index" | "crypto"

  Quick Actions (one per grid button):
    {"action":"chart"}
    {"action":"forecast"}
    {"action":"backtest"}
    {"action":"screener"}
    {"action":"portfolio"}
    {"action":"capacity"}

  Account upgrade button:
    {"action":"upgrade"}

Notes for the bot side:
  - sendData has a 4096-byte limit (these payloads are tiny, no concern).
  - sendData only works from a keyboard-button-launched Web App; after it
    fires the Mini App closes automatically.
  - Always JSON.parse defensively and validate "action" against the known set.


TELEGRAM INTEGRATION DETAILS (all guarded)
------------------------------------------
  - tg.ready(); tg.expand()
  - tg.setHeaderColor('#05080c'); tg.setBackgroundColor('#05080c')  (keeps our dark theme)
  - themeParams: only the accent (--emerald) is adapted IF button_color exists;
    the dark base theme is always preserved.
  - tg.MainButton drives the primary "Analisa/Analyze" action (label is
    localized and submits the same analyze payload).
  - tg.BackButton.hide() on root.
  - tg.HapticFeedback.impactOccurred('light') on taps.
  - language auto-detect: localStorage 'po_lang' → Telegram user.language_code
    (id* → id, else en) → navigator.language fallback. A header chip toggles
    ID/EN and persists the choice in localStorage.

If window.Telegram is undefined (normal browser) none of the above runs and
the page falls back to the inline "open in Telegram" note.
