import React, { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { sendTelegramMessage } from '../../services/telegramService';
import { 
  fetchLiveGoldPrices, 
  fetchCbuUsdRate, 
  fetchGoldApiIo, 
  fetchMetalsApi 
} from '../../services/goldPriceService';
import { isFirebaseConfigured, firebaseConfig } from '../../services/firebase';
import { seedInitialDataToFirestore } from '../../services/firestoreService';
import { 
  Settings, 
  Send, 
  Flame, 
  Coins, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  ExternalLink,
  Sparkles,
  Globe2,
  RefreshCw,
  UploadCloud
} from 'lucide-react';

export const TelegramSettings = () => {
  const { settings, updateSettings } = useSettingsStore();

  const [botToken, setBotToken] = useState(settings.telegram_bot_token || '');
  const [chatId, setChatId] = useState(settings.telegram_chat_id || '');
  const [showToken, setShowToken] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSeedingFirestore, setIsSeedingFirestore] = useState(false);
  const [firestoreFeedback, setFirestoreFeedback] = useState(null);

  // External APIs config
  const [goldApiKey, setGoldApiKey] = useState(settings.gold_api_key || '');
  const [metalsApiKey, setMetalsApiKey] = useState(settings.metals_api_key || '');
  const [provider, setProvider] = useState(settings.gold_api_provider || 'auto');
  const [apiTestFeedback, setApiTestFeedback] = useState(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  // Ugar & Currency settings
  const [maxLoss, setMaxLoss] = useState(settings.max_allowed_loss_percentage || 2.0);
  const [rate999, setRate999] = useState(settings.gold_rate_999 || 88.20);
  const [rate750, setRate750] = useState(settings.gold_rate_750 || 66.15);
  const [rate585, setRate585] = useState(settings.gold_rate_585 || 51.60);
  const [usdToUzs, setUsdToUzs] = useState(settings.usd_to_uzs || 11941.65);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test Telegram Bot
  const handleTestBot = async () => {
    setIsTesting(true);
    setTestResult(null);

    const testText = `
👑 <b>GOLD TRADE ERP - TEST XABAR</b>
━━━━━━━━━━━━━━━━━━━━
✅ Telegram Bot integratsiyasi muvaffaqiyatli ishga tushdi!
📅 <b>Vaqt:</b> ${new Date().toLocaleTimeString('uz-UZ')}
⚖️ Ugar me'yori: ${maxLoss}%
💎 Tizim: Real-vaqt zargarlik nazorati faol.
`;

    const res = await sendTelegramMessage({
      token: botToken,
      chatId,
      text: testText,
    });

    setIsTesting(false);
    if (res.success) {
      setTestResult({
        type: 'success',
        text: "Test xabar Telegramga muvaffaqiyatli yetkazildi! Bot to'g'ri sozlangan.",
      });
    } else {
      setTestResult({
        type: 'error',
        text: res.isSimulation
          ? "Simulyatsiya rejimi: Bot token yoki Chat ID kiritilmagan."
          : `Xatolik: ${res.error || 'Telegram serveriga ulanib bo\'lmadi'}`,
      });
    }
  };

  // Test External APIs directly (GoldAPI.io, Metals-API, CBU.uz)
  const handleTestSpecificApi = async (target) => {
    setIsTestingApi(true);
    setApiTestFeedback(null);

    if (target === 'cbu') {
      const res = await fetchCbuUsdRate();
      setIsTestingApi(false);
      if (res.success) {
        setUsdToUzs(res.rate);
        setApiTestFeedback({
          type: 'success',
          text: `Markaziy Bank (CBU.uz) muvaffaqiyatli javob berdi! 1 USD = ${res.rate.toLocaleString()} so'm (Diff: ${res.diff}, Sana: ${res.date})`,
        });
      } else {
        setApiTestFeedback({
          type: 'error',
          text: `CBU.uz xatosi: ${res.error}`,
        });
      }
    } else if (target === 'goldapi') {
      const res = await fetchGoldApiIo(goldApiKey);
      setIsTestingApi(false);
      if (res.success) {
        setRate999(res.rates[999]);
        setRate750(res.rates[750]);
        setRate585(res.rates[585]);
        setApiTestFeedback({
          type: 'success',
          text: `GoldAPI.io muvaffaqiyatli ulandi! 1 unsiya = $${res.ouncePriceUSD.toLocaleString()}, 999.9 = $${res.rates[999]}/g, 585 = $${res.rates[585]}/g`,
        });
      } else {
        setApiTestFeedback({
          type: 'error',
          text: `GoldAPI.io xatosi: ${res.error} (Iltimos, www.goldapi.io dan x-access-token oling)`,
        });
      }
    } else if (target === 'metalsapi') {
      const res = await fetchMetalsApi(metalsApiKey);
      setIsTestingApi(false);
      if (res.success) {
        setRate999(res.rates[999]);
        setRate750(res.rates[750]);
        setRate585(res.rates[585]);
        setApiTestFeedback({
          type: 'success',
          text: `Metals-API muvaffaqiyatli ulandi! 1 unsiya = $${res.ouncePriceUSD.toLocaleString()}, 999.9 = $${res.rates[999]}/g`,
        });
      } else {
        setApiTestFeedback({
          type: 'error',
          text: `Metals-API xatosi: ${res.error} (Iltimos, metals-api.com dan access_key oling)`,
        });
      }
    } else {
      // Test full live suite
      const res = await fetchLiveGoldPrices({
        goldApiKey,
        metalsApiKey,
        preferredProvider: provider,
      });
      setIsTestingApi(false);
      if (res.success) {
        setRate999(res.rates[999]);
        setRate750(res.rates[750]);
        setRate585(res.rates[585]);
        setUsdToUzs(res.usdToUzs);
        setApiTestFeedback({
          type: 'success',
          text: `Tizim ${res.provider} orqali barcha narxlarni yangiladi! CBU: ${res.cbu?.rate} so'm, 999.9: $${res.rates[999]}/g`,
        });
      }
    }
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    updateSettings({
      telegram_bot_token: botToken,
      telegram_chat_id: chatId,
      gold_api_key: goldApiKey,
      metals_api_key: metalsApiKey,
      gold_api_provider: provider,
      max_allowed_loss_percentage: parseFloat(maxLoss) || 2.0,
      gold_rate_999: parseFloat(rate999) || 88.20,
      gold_rate_750: parseFloat(rate750) || 66.15,
      gold_rate_585: parseFloat(rate585) || 51.60,
      usd_to_uzs: parseFloat(usdToUzs) || 11941.65,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2.5">
          <Settings className="w-5 h-5 text-gold-400" />
          <span>Tizim Sozlamalari va Haqiqiy Tashqi APIlar</span>
        </h1>
        <p className="text-xs text-slate-400">
          GoldAPI.io, Metals-API, O'zbekiston Markaziy Banki (CBU) va Telegram Bot integratsiyasi
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Barcha sozlamalar muvaffaqiyatli saqlandi!</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* 1. REAL EXTERNAL FINANCIAL APIS INTEGRATION (NEW & ENHANCED) */}
        <div className="rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-gold-500/30 p-5 space-y-4 shadow-gold-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
                <Globe2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Tashqi Real-Vaqt Oltin va Valyuta API'lari</h3>
                <p className="text-[11px] text-slate-400">
                  GoldAPI.io, Metals-API va O'zbekiston Markaziy Banki (cbu.uz)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTestSpecificApi('all')}
              disabled={isTestingApi}
              className="px-3 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500 text-gold-300 hover:text-black border border-gold-500/40 text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingApi ? 'animate-spin' : ''}`} />
              <span>Barcha APIni Sinash</span>
            </button>
          </div>

          {/* Feedback banner */}
          {apiTestFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                apiTestFeedback.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-200'
              }`}
            >
              {apiTestFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{apiTestFeedback.text}</span>
            </div>
          )}

          <div className="space-y-4 text-xs pt-1">
            {/* A. Central Bank of Uzbekistan (CBU) */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-slate-200">
                    O'zbekiston Markaziy Banki (CBU) API
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                    BEPUL & OCHIQ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestSpecificApi('cbu')}
                  disabled={isTestingApi}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Kursni tekshirish
                </button>
              </div>

              <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-400">
                <code className="text-slate-300">https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/</code>
                <a
                  href="https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-500 hover:text-white"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400">
                Hozirgi rasmiy kurs: <b className="text-white font-mono">{Number(usdToUzs).toLocaleString()} so'm</b> (Diff: {settings.cbu_diff || '-81.81'} so'm). Har kuni avtomatik yangilanadi.
              </p>
            </div>

            {/* B. GoldAPI.io */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-gold-400" />
                  <span className="font-semibold text-slate-200">GoldAPI.io (XAU/USD Jonli Kotirovka)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <a
                    href="https://www.goldapi.io/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-gold-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Kalit olish</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleTestSpecificApi('goldapi')}
                    disabled={isTestingApi}
                    className="text-xs text-gold-400 hover:text-gold-300 font-medium"
                  >
                    Sinash
                  </button>
                </div>
              </div>

              <div className="font-mono text-[11px] text-slate-400">
                <code>https://www.goldapi.io/api/XAU/USD</code>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  GoldAPI.io Token (Header: <code>x-access-token</code>)
                </label>
                <input
                  type="text"
                  placeholder="goldapi-123abc-token"
                  value={goldApiKey}
                  onChange={(e) => setGoldApiKey(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#12141c]/60 backdrop-blur-xl border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-gold-500/50"
                />
              </div>
            </div>

            {/* C. Metals-API */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-slate-200">Metals-API (Muqobil Birja API)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <a
                    href="https://metals-api.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-amber-400 hover:underline flex items-center space-x-1"
                  >
                    <span>metals-api.com</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleTestSpecificApi('metalsapi')}
                    disabled={isTestingApi}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                  >
                    Sinash
                  </button>
                </div>
              </div>

              <div className="font-mono text-[11px] text-slate-400">
                <code>https://metals-api.com/api/latest?access_key=KEY&base=USD&symbols=XAU</code>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Metals-API Access Key (Param: <code>access_key</code>)
                </label>
                <input
                  type="text"
                  placeholder="metals_access_key_xyz123"
                  value={metalsApiKey}
                  onChange={(e) => setMetalsApiKey(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#12141c]/60 backdrop-blur-xl border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-gold-500/50"
                />
              </div>
            </div>

            {/* Provider Selector */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Afzal Ko'rilgan Oltin API Manbasi</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'auto', label: 'Avtomatik (Tavsiya)' },
                  { id: 'goldapi', label: 'GoldAPI.io' },
                  { id: 'metals_api', label: 'Metals-API' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProvider(item.id)}
                    className={`py-2 px-2 rounded-xl font-medium border text-center transition-colors ${
                      provider === item.id
                        ? 'bg-gold-500 text-black border-gold-500 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-[#1a2030]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Telegram Bot API Integration */}
        <div className="rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Telegram Bot API Integratsiyasi</h3>
              <p className="text-[11px] text-slate-400">
                Rahbariyatga kassa, ugar ortishi va z-hisobotlarni avtomatik jo'natish
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Telegram Bot Token</label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  placeholder="123456789:ABCdefGhIJKlmNoPQRstuvWxyz"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-gold-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">@BotFather orqali olingan token</p>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Admin Chat ID / Guruh ID</label>
              <input
                type="text"
                placeholder="Masalan: 12345678 yoki -100123456789"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-gold-500/50"
              />
              <p className="text-[10px] text-slate-500 mt-1">@userinfobot orqali Chat ID'ni bilishingiz mumkin</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestBot}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors flex items-center space-x-2 self-start"
            >
              <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? "Yuborilmoqda..." : "Telegram Test Xabar Yuborish"}</span>
            </button>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 ${
                  testResult.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{testResult.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Production & Ugar Rules */}
        <div className="rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Ishlab Chiqarish & Ugar Me'yorlari</h3>
              <p className="text-[11px] text-slate-400">
                Ugar chegarasi oshganda Telegramga shoshilinch ogohlantirish yuboriladi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Maksimal Ruxsat Etilgan Ugar Me'yori (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={maxLoss}
                  onChange={(e) => setMaxLoss(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-gold-500/50"
                />
                <span className="absolute right-3 top-2 text-slate-500 font-mono">%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Standart xalqaro me'yor: 1.5% - 2.0%</p>
            </div>

            <div className="space-y-2 pt-1">
              <label className="block text-slate-300 font-medium mb-1">Bildirishnoma Shartlari</label>
              <div className="space-y-1.5">
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notify_on_excess_ugar}
                    onChange={(e) => updateSettings({ notify_on_excess_ugar: e.target.checked })}
                    className="rounded text-gold-500 focus:ring-0"
                  />
                  <span>Ugar {maxLoss}% dan oshganda zudlik bilan alert jo'natish</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notify_on_daily_close}
                    onChange={(e) => updateSettings({ notify_on_daily_close: e.target.checked })}
                    className="rounded text-gold-500 focus:ring-0"
                  />
                  <span>Kassa kunlik yopilganda Z-hisobot yuborish</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Current Rates Overview & Manual Override */}
        <div className="rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Joriy Oltin Narxlari va Markaziy Bank Kursi</h3>
              <p className="text-[11px] text-slate-400">
                API orqali olingan yoki qo'lda belgilangan joriy hisob stavkalari
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">999.9 Proba ($/g)</label>
              <input
                type="number"
                step="0.1"
                value={rate999}
                onChange={(e) => setRate999(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-gold-500/50"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">750 Proba ($/g)</label>
              <input
                type="number"
                step="0.1"
                value={rate750}
                onChange={(e) => setRate750(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-gold-500/50"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">585 Proba ($/g)</label>
              <input
                type="number"
                step="0.1"
                value={rate585}
                onChange={(e) => setRate585(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-gold-500/50"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">1 USD = UZS (CBU)</label>
              <input
                type="number"
                step="1"
                value={usdToUzs}
                onChange={(e) => setUsdToUzs(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-gold-500/50"
              />
            </div>
          </div>
        </div>

        {/* 5. Firebase & Security Status */}
        <div className="rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-300 text-xs font-semibold">
              <Database className="w-4 h-4 text-gold-400" />
              <span>Firebase BaaS & Xavfsizlik Qoidalari</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                isFirebaseConfigured
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isFirebaseConfigured ? `Live: ${firebaseConfig.projectId}` : 'Offline / Mock Rejimi'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Firebase Project ID:</span>
              <span className="text-gold-300 font-bold">{firebaseConfig.projectId}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Auth Domain:</span>
              <span className="text-slate-300">{firebaseConfig.authDomain}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Storage Bucket:</span>
              <span className="text-slate-300">{firebaseConfig.storageBucket}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Tizim TZ bo'yicha <code>firestore.rules</code> qoidalari bilan himoyalangan:
            Admin (to'liq nazorat), Usta (faqat o'ziga tegishli buyurtmalar) va Kassir (savdolar).
          </p>

          {firestoreFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                firestoreFeedback.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-200'
              }`}
            >
              {firestoreFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{firestoreFeedback.text}</span>
            </div>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={async () => {
                setIsSeedingFirestore(true);
                setFirestoreFeedback(null);
                const res = await seedInitialDataToFirestore();
                setIsSeedingFirestore(false);
                if (res.success) {
                  setFirestoreFeedback({ type: 'success', text: res.message });
                } else {
                  setFirestoreFeedback({ type: 'error', text: res.error });
                }
              }}
              disabled={isSeedingFirestore}
              className="px-4 py-2 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 text-xs font-bold transition-all flex items-center space-x-2"
            >
              <UploadCloud className={`w-4 h-4 ${isSeedingFirestore ? 'animate-bounce' : ''}`} />
              <span>
                {isSeedingFirestore
                  ? "Firestore bazasiga yuklanmoqda..."
                  : "Boshlang'ich Ma'lumotlarni Firestore (gold-trade-01) ga Yuklash"}
              </span>
            </button>
          </div>
        </div>

        {/* Save All Button */}
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-gold-500 hover:from-amber-500 hover:to-gold-400 text-black font-extrabold text-xs transition-all shadow-gold-sm"
        >
          Barcha Sozlamalarni Saqlash
        </button>
      </form>
    </div>
  );
};
