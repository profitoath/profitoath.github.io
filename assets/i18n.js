/* ============================================================
   profitoath — bilingual (ID / EN) language toggle
   Self-contained, no dependencies. Link on every page AFTER site.js.
   - Default language: Indonesian ('id'). Indonesian stays the literal
     in-HTML text so no-JS users always see Indonesian.
   - Translatable nodes carry data-i18n="key" (textContent) or
     data-i18n-html="key" (innerHTML, for strings containing <span>).
   - Persists choice in localStorage 'po_lang'. No page reload.
   - Exposes window.PO_I18N = { setLang, getLang, t }.
   Every routine no-ops gracefully if a key or element is missing.
   ============================================================ */
(function () {
  "use strict";

  var STORE_KEY = "po_lang";
  var DEFAULT_LANG = "id";

  /* ---------- dictionary ---------- */
  /* Each entry: { id: "<Indonesian>", en: "<English>" }.
     The id value mirrors the literal HTML text exactly. */
  var DICT = {
    /* ===== nav ===== */
    nav_features:   { id: "Fitur",        en: "Features" },
    nav_quant:      { id: "Quant Engine", en: "Quant Engine" },
    nav_blog:       { id: "Blog",         en: "Blog" },
    nav_glossary:   { id: "Glosarium",    en: "Glossary" },
    nav_docs:       { id: "Docs",         en: "Docs" },
    nav_pricing:    { id: "Harga",        en: "Pricing" },
    cta_primary:    { id: "Mulai Gratis →", en: "Start Free →" },

    /* ===== footer ===== */
    footer_about: {
      id: "Platform analisa saham AI & quantitative finance kelas institusional, langsung di Telegram. Data realtime, 43 negara.",
      en: "Institutional-grade AI stock analysis & quantitative finance platform, right inside Telegram. Real-time data, 43 countries."
    },
    footer_product:   { id: "Produk",      en: "Product" },
    footer_resources: { id: "Sumber Daya", en: "Resources" },
    footer_company:   { id: "Perusahaan",  en: "Company" },
    footer_contact:   { id: "Kontak",      en: "Contact" },
    footer_about_link:{ id: "Tentang",     en: "About" },
    footer_education: { id: "Edukasi",     en: "Education" },
    footer_made:      { id: "Dibuat untuk para analis kuantitatif", en: "Built for quantitative analysts" },
    footer_disclaimer: {
      id: "⚠️ profitoath adalah alat analisis & edukasi, BUKAN nasihat investasi, rekomendasi, atau ajakan transaksi. Tidak berafiliasi/berizin OJK/BEI. Kinerja masa lalu & hasil backtest tidak menjamin hasil masa depan. Investasi saham berisiko termasuk kehilangan modal. Keputusan ada di tangan Anda (DYOR).",
      en: "⚠️ profitoath is an analysis & education tool, NOT investment advice, a recommendation, or a solicitation to transact. Not affiliated with or licensed by OJK/BEI. Past performance & backtest results do not guarantee future results. Stock investing carries risk including loss of capital. The decision is yours (DYOR)."
    },

    /* ===== homepage · hero ===== */
    hero_pill: {
      id: '<span class="dot"></span>Data realtime · 43 negara · 69.221 instrumen',
      en: '<span class="dot"></span>Real-time data · 43 countries · 69,221 instruments'
    },
    hero_h1: {
      id: 'Riset saham kelas <span class="g-text">institusi</span>, langsung dari <span class="g-text">Telegram</span> Anda.',
      en: '<span class="g-text">Institutional</span>-grade stock research, straight from your <span class="g-text">Telegram</span>.'
    },
    hero_lead: {
      id: "profitoath menyatukan analisa teknikal, forecast AI, backtest IDX-realistis, dan optimasi portofolio kuantitatif dalam satu bot. Tanpa terminal mahal, tanpa spreadsheet rumit, cukup ketik tickernya.",
      en: "profitoath unites technical analysis, AI forecasting, IDX-realistic backtesting, and quantitative portfolio optimization in one bot. No expensive terminal, no messy spreadsheets — just type the ticker."
    },
    hero_cta1: { id: "Coba 7 hari gratis →",   en: "Try 7 days free →" },
    hero_cta2: { id: "Lihat quant engine",     en: "See the quant engine" },
    scroll_hint: { id: "Gulir", en: "Scroll" },

    /* ===== homepage · features preview ===== */
    s_feat_eyebrow: { id: "Satu bot · seluruh alur riset", en: "One bot · the whole research flow" },
    s_feat_h2: {
      id: 'Dari sinyal mentah ke keputusan <span class="g-text">terukur</span>',
      en: 'From raw signal to a <span class="g-text">measured</span> decision'
    },
    s_feat_lead: {
      id: "Enam modul inti yang saling terhubung. Mulai dari membaca grafik sampai mengukur risiko portofolio dalam Rupiah, semuanya dipanggil lewat perintah singkat.",
      en: "Six interconnected core modules. From reading charts to measuring portfolio risk in Rupiah, all called with a short command."
    },
    card_feat_link: { id: "Pelajari fitur", en: "Explore feature" },
    feat1_h3: { id: "Chart & Analisa Teknikal", en: "Charts & Technical Analysis" },
    feat1_p: {
      id: "Grafik candlestick multi-timeframe lengkap dengan RSI, MACD, Bollinger Bands, EMA, dan deteksi support/resistance otomatis. Render rapi langsung di chat.",
      en: "Multi-timeframe candlestick charts complete with RSI, MACD, Bollinger Bands, EMA, and automatic support/resistance detection. Cleanly rendered right in chat."
    },
    feat2_h3: { id: "Forecast AI", en: "AI Forecast" },
    feat2_p: {
      id: "Proyeksi pergerakan harga berbasis model machine learning dengan rentang keyakinan, bukan satu angka tunggal. Konteks tren, momentum, dan volatilitas disertakan.",
      en: "Price-movement projections from machine-learning models with confidence ranges, not a single number. Trend, momentum, and volatility context included."
    },
    feat3_h3: { id: "Backtest IDX-Realistis", en: "IDX-Realistic Backtest" },
    feat3_p: {
      id: "Uji strategi dengan aturan bursa nyata: lot 100 lembar, batas ARA/ARB, dan biaya transaksi. Hasil mendekati kondisi eksekusi sebenarnya, bukan simulasi ideal.",
      en: "Test strategies with real exchange rules: 100-share lots, ARA/ARB limits, and transaction costs. Results close to real execution, not an idealized simulation."
    },
    feat4_h3: { id: "Screener", en: "Screener" },
    feat4_p: {
      id: "Saring ribuan emiten dengan filter teknikal dan fundamental dalam hitungan detik. Temukan kandidat sesuai kriteria momentum, valuasi, atau breakout Anda.",
      en: "Filter thousands of listings with technical and fundamental filters in seconds. Find candidates matching your momentum, valuation, or breakout criteria."
    },
    feat5_h3: { id: "Deteksi Regime", en: "Regime Detection" },
    feat5_p: {
      id: "Kenali apakah pasar sedang trending, ranging, atau bergejolak. profitoath mengklasifikasikan regime sehingga strategi Anda menyesuaikan kondisi, bukan melawannya.",
      en: "Recognize whether the market is trending, ranging, or volatile. profitoath classifies the regime so your strategy adapts to conditions instead of fighting them."
    },
    feat6_h3: { id: "Alert Cerdas", en: "Smart Alerts" },
    feat6_p: {
      id: "Pasang notifikasi pada level harga, persilangan indikator, atau pergeseran regime. Bot memantau pasar 24 jam dan mengabari Anda saat momen yang dipantau tiba.",
      en: "Set notifications on price levels, indicator crossovers, or regime shifts. The bot watches the market 24/7 and pings you when the moment you tracked arrives."
    },

    /* ===== homepage · quant teaser ===== */
    s_quant_eyebrow: { id: "Quant Engine", en: "Quant Engine" },
    s_quant_h2: {
      id: 'Matematika portofolio yang biasanya <span class="g-text">terkunci</span> di meja institusi',
      en: 'Portfolio math usually <span class="g-text">locked</span> away on institutional desks'
    },
    s_quant_lead: {
      id: "profitoath menjalankan optimasi bobot Mean-Variance (Markowitz), Risk Parity, dan Hierarchical Risk Parity (HRP) di balik layar. Ukur Value at Risk dan Conditional VaR langsung dalam Rupiah, lalu cek kapasitas strategi hingga modal miliaran tanpa menggeser harga pasar.",
      en: "profitoath runs Mean-Variance (Markowitz), Risk Parity, and Hierarchical Risk Parity (HRP) weight optimization behind the scenes. Measure Value at Risk and Conditional VaR directly in Rupiah, then check strategy capacity up to billions in capital without moving the market price."
    },
    s_quant_li1: { id: "Alokasi MV / RP / HRP dengan batas bobot yang dapat diatur", en: "MV / RP / HRP allocation with adjustable weight limits" },
    s_quant_li2_html: { id: "VaR &amp; CVaR dalam nominal Rupiah, bukan persentase abstrak", en: "VaR &amp; CVaR in Rupiah terms, not abstract percentages" },
    s_quant_li3: { id: "Analisa kapasitas: berapa modal yang masih realistis dijalankan", en: "Capacity analysis: how much capital is still realistic to deploy" },
    s_quant_cta: { id: "Jelajahi quant engine →", en: "Explore the quant engine →" },

    /* ===== homepage · telegram mockup ===== */
    s_tg_eyebrow: { id: "Tanpa instalasi · tanpa kurva belajar", en: "No install · no learning curve" },
    s_tg_h2: {
      id: 'Sekuat terminal pro, <span class="g-text">sesederhana</span> mengirim pesan',
      en: 'As powerful as a pro terminal, <span class="g-text">as simple</span> as sending a message'
    },
    s_tg_cta: { id: "Lihat semua perintah →", en: "See all commands →" },

    /* ===== homepage · pricing preview ===== */
    s_price_eyebrow: { id: "Harga transparan", en: "Transparent pricing" },
    s_price_h2: {
      id: 'Mulai gratis, naik level saat <span class="g-text">siap</span>',
      en: 'Start free, level up when <span class="g-text">ready</span>'
    },
    s_price_lead: {
      id: "Tiga tier sederhana. Bayar pakai Telegram Stars atau QRIS, tanpa kontrak, batalkan kapan saja.",
      en: "Three simple tiers. Pay with Telegram Stars or QRIS, no contract, cancel anytime."
    },
    tier_free: { id: "Free", en: "Free" },
    tier_pro:  { id: "Pro",  en: "Pro" },
    tier_vip:  { id: "VIP",  en: "VIP" },
    tier_popular: { id: "Populer", en: "Popular" },
    pp_free_per: { id: "/ selamanya", en: "/ forever" },
    pp_pro_per:  { id: "/ bulan",     en: "/ month" },
    pp_vip_per:  { id: "/ bulan",     en: "/ month" },
    pp_free_li1_html: { id: "Chart &amp; indikator teknikal dasar", en: "Charts &amp; basic technical indicators" },
    pp_free_li2:      { id: "Akses 69.221 instrumen offline", en: "Access to 69,221 offline instruments" },
    pp_free_li3:      { id: "Screener terbatas harian", en: "Limited daily screener" },
    pp_free_li4_html: { id: "Komunitas &amp; edukasi", en: "Community &amp; education" },
    pp_free_cta:      { id: "Mulai gratis", en: "Start free" },
    pp_pro_li1:       { id: "Semua fitur Free, tanpa batas harian", en: "All Free features, no daily limit" },
    pp_pro_li2_html:  { id: "Forecast AI &amp; deteksi regime", en: "AI forecast &amp; regime detection" },
    pp_pro_li3:       { id: "Backtest IDX-realistis (lot 100, ARA/ARB)", en: "IDX-realistic backtest (lot 100, ARA/ARB)" },
    pp_pro_li4:       { id: "Alert cerdas tak terbatas", en: "Unlimited smart alerts" },
    pp_pro_cta:       { id: "Pilih Pro →", en: "Choose Pro →" },
    pp_vip_li1:       { id: "Semua fitur Pro", en: "All Pro features" },
    pp_vip_li2:       { id: "Quant engine penuh: MV · RP · HRP", en: "Full quant engine: MV · RP · HRP" },
    pp_vip_li3_html:  { id: "VaR/CVaR Rupiah &amp; analisa kapasitas", en: "VaR/CVaR in Rupiah &amp; capacity analysis" },
    pp_vip_li4_html:  { id: "Prioritas data realtime &amp; dukungan", en: "Priority real-time data &amp; support" },
    pp_vip_cta:       { id: "Pilih VIP", en: "Choose VIP" },

    /* ===== homepage · blog teaser ===== */
    s_blog_eyebrow: { id: "Dari ruang riset", en: "From the research room" },
    s_blog_h2: {
      id: 'Belajar membaca pasar seperti <span class="g-text">kuant</span>',
      en: 'Learn to read the market like a <span class="g-text">quant</span>'
    },
    s_blog_lead: {
      id: "Panduan teknis yang ringkas dan jujur, ditulis untuk analis yang ingin paham mesin di balik angka.",
      en: "Concise, honest technical guides, written for analysts who want to understand the engine behind the numbers."
    },
    blog_all_cta: { id: "Lihat semua artikel →", en: "See all articles →" },

    /* ===== shared · CTA band (homepage) ===== */
    cta_band_eyebrow: { id: "Siap menganalisa lebih cerdas?", en: "Ready to analyze smarter?" },
    cta_band_h2: {
      id: 'Mulai riset kuantitatif Anda <span class="g-text">hari ini</span>',
      en: 'Start your quantitative research <span class="g-text">today</span>'
    },
    cta_band_p: {
      id: "Gratis 7 hari penuh fitur. Tanpa kartu kredit, cukup akun Telegram. Tingkatkan ke Pro atau VIP kapan pun lewat Telegram Stars atau QRIS.",
      en: "7 days free with full features. No credit card, just a Telegram account. Upgrade to Pro or VIP anytime via Telegram Stars or QRIS."
    },
    cta_band_cta1: { id: "Coba 7 hari gratis →", en: "Try 7 days free →" },
    cta_band_cta2: { id: "Baca dokumentasi", en: "Read the docs" },

    /* ===== generic / page chrome (inner pages) ===== */
    crumb_home:    { id: "Beranda", en: "Home" },
    crumb_home_en: { id: "Home",    en: "Home" },

    /* features.html */
    feat_page_eyebrow: { id: "Katalog fitur lengkap", en: "Full feature catalog" },
    feat_page_h2: {
      id: "Satu bot, kelengkapan terminal kuantitatif.",
      en: "One bot, the completeness of a quant terminal."
    },
    feat_page_lead_html: {
      id: 'Dari candlestick neon sampai optimasi portofolio HRP — setiap fitur profitoath dibangun di atas mesin Python yang sama dengan meja kuantitatif profesional, lalu dikemas dalam antarmuka chat Telegram. Berikut isi mesinnya, fitur demi fitur. Selami matematikanya di <a href="./quant.html" style="color:var(--emerald2)">Quant Engine</a>, atau cek paket di <a href="./pricing.html" style="color:var(--emerald2)">Harga</a>.',
      en: 'From neon candlesticks to HRP portfolio optimization — every profitoath feature is built on the same Python engine as a professional quant desk, then wrapped in a Telegram chat interface. Here is what is inside the engine, feature by feature. Dive into the math in <a href="./quant.html" style="color:var(--emerald2)">Quant Engine</a>, or check the plans in <a href="./pricing.html" style="color:var(--emerald2)">Pricing</a>.'
    },

    /* quant.html */
    quant_page_eyebrow: { id: "Under the Hood · Mesin Kuantitatif", en: "Under the Hood · The Quant Engine" },
    quant_page_h1_html: {
      id: 'Bukan sekadar bot.<br/><span class="g-text">Riset kuant beneran.</span>',
      en: 'Not just a bot.<br/><span class="g-text">Real quant research.</span>'
    },
    quant_page_lead: {
      id: "Di balik setiap sinyal, ada pipeline Python yang sama disiplinnya dengan meja riset institusional: data bersih, asumsi pasar IDX yang jujur, backtest tanpa kebocoran data, dan ukuran risiko dalam Rupiah. Halaman ini membongkar persis bagaimana semuanya bekerja.",
      en: "Behind every signal is a Python pipeline as disciplined as an institutional research desk: clean data, honest IDX market assumptions, leak-free backtesting, and risk measured in Rupiah. This page breaks down exactly how it all works."
    },

    /* about.html */
    about_page_eyebrow: { id: "Tentang kami", en: "About us" },
    about_page_h1_html: {
      id: 'Alat kuantitatif institusi, untuk <span class="g-text">setiap investor.</span>',
      en: 'Institutional quant tools, for <span class="g-text">every investor.</span>'
    },
    about_page_lead: {
      id: "profitoath lahir dari satu keyakinan sederhana: matematika yang dipakai meja kuantitatif hedge-fund tidak seharusnya jadi hak istimewa segelintir institusi. Kami mengemasnya ke dalam bot Telegram yang berbicara bahasamu — transparan, jujur soal risiko, dan tanpa janji ajaib.",
      en: "profitoath was born from one simple belief: the math used on hedge-fund quant desks shouldn't be the privilege of a handful of institutions. We package it into a Telegram bot that speaks your language — transparent, honest about risk, and free of magic promises."
    },

    /* docs.html */
    docs_page_eyebrow: { id: "Dokumentasi", en: "Documentation" },
    docs_page_h1_html: {
      id: 'Panduan <span class="g-text">profitoath</span>',
      en: 'The <span class="g-text">profitoath</span> guide'
    },
    docs_page_lead_html: {
      id: 'Semua yang Anda butuhkan untuk menjalankan analisa kuantitatif kelas institusional langsung dari Telegram — dari perintah pertama sampai riset lewat CLI. Mesin di baliknya kami bedah di <a class="mono" style="color:var(--emerald2)" href="./quant.html">Quant Engine</a>.',
      en: 'Everything you need to run institutional-grade quantitative analysis straight from Telegram — from your first command to research via the CLI. We break down the engine behind it in <a class="mono" style="color:var(--emerald2)" href="./quant.html">Quant Engine</a>.'
    },

    /* contact.html */
    contact_page_eyebrow: { id: "Hubungi kami", en: "Contact us" },
    contact_page_h1_html: {
      id: 'Ada pertanyaan? <span class="g-text">Sapa tim kami.</span>',
      en: 'Have a question? <span class="g-text">Say hi to our team.</span>'
    },
    contact_page_lead: {
      id: "Cara tercepat menjangkau kami adalah lewat bot Telegram — di situ pula seluruh produk profitoath berjalan. Untuk urusan teknis, kerja sama, atau pers, kirim pesan lewat email atau formulir di bawah. Kami membaca setiap pesan.",
      en: "The fastest way to reach us is through the Telegram bot — that's where the entire profitoath product runs. For technical matters, partnerships, or press, send a message by email or the form below. We read every message."
    },

    /* blog/index.html */
    blog_page_eyebrow: { id: "Wawasan &amp; Edukasi", en: "Insights &amp; Education" },
    blog_page_h2_html: {
      id: 'Belajar membaca pasar seperti <span class="g-text">analis kuantitatif</span>',
      en: 'Learn to read the market like a <span class="g-text">quantitative analyst</span>'
    },
    blog_page_lead: {
      id: "Catatan teknis dari ruang riset profitoath. Kami bedah indikator, metode backtest, matematika portofolio, dan manajemen risiko dengan bahasa yang lugas, jujur soal keterbatasan, dan selalu relevan dengan realita Bursa Efek Indonesia. Bukan janji cuan, tapi kerangka berpikir yang bisa Anda uji sendiri.",
      en: "Technical notes from the profitoath research room. We dissect indicators, backtest methods, portfolio math, and risk management in plain language, honest about limitations, and always relevant to the reality of the Indonesia Stock Exchange. Not a profit promise, but a way of thinking you can test yourself."
    },

    /* glossary/index.html */
    gloss_page_eyebrow: { id: "KAMUS QUANT &amp; TRADING", en: "QUANT &amp; TRADING DICTIONARY" },
    gloss_page_h2_html: {
      id: 'Glosarium istilah <span class="g-text">analisa kuantitatif</span> &amp; pasar saham.',
      en: 'A glossary of <span class="g-text">quantitative analysis</span> &amp; stock-market terms.'
    },
    gloss_page_lead: {
      id: "Lebih dari 40 istilah teknikal, statistik, dan mikrostruktur pasar — dari RSI hingga HRP — dijelaskan akurat dalam bahasa Indonesia. Setiap istilah punya tautan langsung; gunakan untuk memahami output bot profitoath, dari sinyal indikator sampai laporan risiko Rupiah.",
      en: "More than 40 technical, statistical, and market-microstructure terms — from RSI to HRP — explained accurately. Each term has a direct link; use it to understand profitoath bot output, from indicator signals to Rupiah risk reports."
    },

    /* pricing.html page */
    pricing_page_eyebrow: { id: "PAKET &amp; HARGA", en: "PLANS &amp; PRICING" },
    pricing_page_h1_html: {
      id: 'Mulai gratis. <span class="g-text">Naik level</span> saat siap.',
      en: 'Start free. <span class="g-text">Level up</span> when ready.'
    },
    pricing_page_lead: {
      id: "Akses analisa saham AI &amp; quantitative finance kelas institusional langsung dari Telegram. Tanpa kartu kredit untuk mulai, tanpa kontrak, batalkan kapan saja. Harga dalam Rupiah, sudah final.",
      en: "Institutional-grade AI stock analysis &amp; quantitative finance, straight from Telegram. No credit card to start, no contract, cancel anytime. Prices in Rupiah, final."
    },
    pr_tname_free: { id: "FREE", en: "FREE" },
    pr_tname_pro:  { id: "PRO",  en: "PRO" },
    pr_tname_vip:  { id: "VIP",  en: "VIP" },
    pr_badge_pro:  { id: "★ Paling Laris", en: "★ Best Seller" },
    pr_badge_vip:  { id: "Institusional",  en: "Institutional" },
    pr_free_cta:   { id: "Mulai di Telegram", en: "Start in Telegram" },
    pr_pro_cta:    { id: "Pilih PRO →", en: "Choose PRO →" },
    pr_vip_cta:    { id: "Pilih VIP →", en: "Choose VIP →" },
    pr_cta_eyebrow:{ id: "SIAP MULAI?", en: "READY TO START?" },
    pr_cta_h2_html:{
      id: 'Analisa saham kelas kuant, <span class="g-text">di saku Anda</span>',
      en: 'Quant-grade stock analysis, <span class="g-text">in your pocket</span>'
    },
    pr_cta_p: {
      id: "Buka bot, ketik ticker pertama Anda, dan rasakan mesin yang sama yang dipakai untuk forecast, backtest, dan optimasi portofolio. Gratis untuk memulai.",
      en: "Open the bot, type your first ticker, and feel the same engine used for forecasting, backtesting, and portfolio optimization. Free to start."
    },
    pr_cta_btn1: { id: "Mulai Gratis di Telegram →", en: "Start Free in Telegram →" },
    pr_cta_btn2: { id: "Lihat Semua Fitur", en: "See All Features" }
  };

  /* ---------- state ---------- */
  function safeGet() {
    try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function safeSet(v) {
    try { localStorage.setItem(STORE_KEY, v); } catch (e) {}
  }

  var lang = (function () {
    var s = safeGet();
    return s === "en" || s === "id" ? s : DEFAULT_LANG;
  })();

  /* ---------- translation helpers ---------- */
  function t(key, l) {
    var entry = DICT[key];
    if (!entry) return null;
    var v = entry[l || lang];
    return typeof v === "string" ? v : (entry.id != null ? entry.id : null);
  }

  function translate(l) {
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var val = t(el.getAttribute("data-i18n"), l);
      if (val != null) el.textContent = val;
    }
    var hnodes = document.querySelectorAll("[data-i18n-html]");
    for (var j = 0; j < hnodes.length; j++) {
      var hel = hnodes[j];
      var hval = t(hel.getAttribute("data-i18n-html"), l);
      if (hval != null) hel.innerHTML = hval;
    }
  }

  /* ---------- toggle control ---------- */
  function injectStyles() {
    if (document.getElementById("po-i18n-style")) return;
    var css =
      ".po-lang{display:inline-flex;align-items:center;gap:0;border:1px solid var(--line2);" +
      "border-radius:100px;overflow:hidden;font-family:var(--mono);font-size:11.5px;" +
      "background:rgba(255,255,255,.02);line-height:1}" +
      ".po-lang button{appearance:none;border:none;background:none;cursor:pointer;color:var(--mut);" +
      "font-family:inherit;font-size:inherit;font-weight:600;letter-spacing:.04em;padding:6px 11px;" +
      "transition:color .3s,background .3s}" +
      ".po-lang button:hover{color:var(--txt)}" +
      ".po-lang button.active{color:#04130e;background:linear-gradient(135deg,var(--emerald),var(--cyan))}" +
      ".po-lang .sep{width:1px;align-self:stretch;background:var(--line2)}" +
      ".po-lang.po-lang-drawer{margin-top:26px;font-size:14px}" +
      ".po-lang.po-lang-drawer button{padding:10px 18px}";
    var st = document.createElement("style");
    st.id = "po-i18n-style";
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  function buildToggle(isDrawer) {
    var wrap = document.createElement("div");
    wrap.className = "po-lang" + (isDrawer ? " po-lang-drawer" : "");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Language / Bahasa");

    var bid = document.createElement("button");
    bid.type = "button";
    bid.textContent = "ID";
    bid.setAttribute("data-lang", "id");
    bid.setAttribute("aria-label", "Bahasa Indonesia");

    var sep = document.createElement("span");
    sep.className = "sep";

    var ben = document.createElement("button");
    ben.type = "button";
    ben.textContent = "EN";
    ben.setAttribute("data-lang", "en");
    ben.setAttribute("aria-label", "English");

    wrap.appendChild(bid);
    wrap.appendChild(sep);
    wrap.appendChild(ben);

    wrap.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("button[data-lang]") : null;
      if (!b) return;
      setLang(b.getAttribute("data-lang"));
    });
    return wrap;
  }

  function injectToggles() {
    // desktop nav: into .nav-right before the menu button
    var navRights = document.querySelectorAll("nav.site .nav-right");
    for (var i = 0; i < navRights.length; i++) {
      var nr = navRights[i];
      if (nr.querySelector(".po-lang")) continue;
      var toggle = buildToggle(false);
      var menuBtn = nr.querySelector(".menu-btn");
      if (menuBtn) nr.insertBefore(toggle, menuBtn);
      else nr.appendChild(toggle);
    }
    // mobile drawer
    var drawers = document.querySelectorAll("#drawer");
    for (var j = 0; j < drawers.length; j++) {
      var d = drawers[j];
      if (d.querySelector(".po-lang")) continue;
      d.appendChild(buildToggle(true));
    }
  }

  function refreshToggleState() {
    var btns = document.querySelectorAll(".po-lang button[data-lang]");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
    }
  }

  /* ---------- public API ---------- */
  function applyLang(l, opts) {
    opts = opts || {};
    lang = l === "en" ? "en" : "id";
    try { document.documentElement.setAttribute("lang", lang); } catch (e) {}
    // On the very first paint with the default language the HTML already holds
    // the Indonesian text, so skip rewriting (keeps the hero stagger intact).
    if (!(opts.initial && lang === "id")) translate(lang);
    refreshToggleState();
  }

  function setLang(l) {
    var next = l === "en" ? "en" : "id";
    safeSet(next);
    applyLang(next, { initial: false });
  }

  function getLang() { return lang; }

  window.PO_I18N = { setLang: setLang, getLang: getLang, t: function (k) { return t(k); } };

  /* ---------- boot ---------- */
  function boot() {
    // Merge any page-specific dictionary declared inline BEFORE this script,
    // e.g. <script>window.PO_I18N_PAGE = { key: {id,en}, ... }</script>.
    // This lets each page translate its OWN body copy fully without bloating
    // the shared dictionary.
    if (window.PO_I18N_PAGE && typeof window.PO_I18N_PAGE === "object") {
      for (var k in window.PO_I18N_PAGE) {
        if (Object.prototype.hasOwnProperty.call(window.PO_I18N_PAGE, k)) {
          DICT[k] = window.PO_I18N_PAGE[k];
        }
      }
    }
    injectStyles();
    injectToggles();
    applyLang(lang, { initial: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
