import React, { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { sendTelegramMessage } from '../../services/telegramService';
import { isFirebaseConfigured } from '../../services/firebase';
import { 
  Settings, 
  Send, 
  Flame, 
  DollarSign, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Coins
} from 'lucide-react';

export const TelegramSettings = () => {
  const { settings, updateSettings } = useSettingsStore();

  const [botToken, setBotToken] = useState(settings.telegram_bot_token || '');
  const [chatId, setChatId] = useState(settings.telegram_chat_id || '');
  const [showToken, setShowToken] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Ugar & Currency settings
  const [maxLoss, setMaxLoss] = useState(settings.max_allowed_loss_percentage || 2.0);
  const [rate999, setRate999] = useState(settings.gold_rate_999 || 84.50);
  const [rate750, setRate750] = useState(settings.gold_rate_750 || 63.40);
  const [rate585, setRate585] = useState(settings.gold_rate_585 || 49.50);
  const [usdToUzs, setUsdToUzs] = useState(settings.usd_to_uzs || 12850);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test Telegram Bot connection
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

  const handleSaveAll = (e) => {
    e.preventDefault();
    updateSettings({
      telegram_bot_token: botToken,
      telegram_chat_id: chatId,
      max_allowed_loss_percentage: parseFloat(maxLoss) || 2.0,
      gold_rate_999: parseFloat(rate999) || 84.50,
      gold_rate_750: parseFloat(rate750) || 63.40,
      gold_rate_585: parseFloat(rate585) || 49.50,
      usd_to_uzs: parseFloat(usdToUzs) || 12850,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2.5">
          <Settings className="w-5 h-5 text-gold-400" />
          <span>Tizim Sozlamalari va Tashqi Integratsiyalar</span>
        </h1>
        <p className="text-xs text-slate-400">
          Telegram Bot xabarnomalari, ugar limitlari, oltin narxlari va Firebase BaaS holati
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Barcha sozlamalar muvaffaqiyatli saqlandi!</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* 1. Telegram Bot API Integration */}
        <div className="rounded-2xl bg-[#141824] border border-luxury-border p-5 space-y-4">
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
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono focus:outline-none focus:border-gold-500"
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
                className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono focus:outline-none focus:border-gold-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">@userinfobot orqali Chat ID'ni bilishingiz mumkin</p>
            </div>
          </div>

          {/* Test connection button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestBot}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors flex items-center space-x-2 self-start"
            >
              <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? "Yuborilmoqda..." : "Test Xabar Yuborish"}</span>
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

        {/* 2. Production & Ugar Rules */}
        <div className="rounded-2xl bg-[#141824] border border-luxury-border p-5 space-y-4">
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
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono focus:outline-none focus:border-gold-500"
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

        {/* 3. Gold Rates & Currency Exchange */}
        <div className="rounded-2xl bg-[#141824] border border-luxury-border p-5 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Oltin Narxlari va Valyuta Kursi</h3>
              <p className="text-[11px] text-slate-400">Tannarx va Trade-In qabul narxlarini hisoblash uchun</p>
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
                className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">750 Proba ($/g)</label>
              <input
                type="number"
                step="0.1"
                value={rate750}
                onChange={(e) => setRate750(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">585 Proba ($/g)</label>
              <input
                type="number"
                step="0.1"
                value={rate585}
                onChange={(e) => setRate585(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">1 USD = UZS</label>
              <input
                type="number"
                step="10"
                value={usdToUzs}
                onChange={(e) => setUsdToUzs(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Firebase & Security Status */}
        <div className="rounded-2xl bg-[#141824] border border-luxury-border p-5 space-y-3">
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
              {isFirebaseConfigured ? 'Live Firebase Ulandi' : 'Offline / Mock Rejimi'}
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Tizim TZ bo'yicha <code>firestore.rules</code> qoidalari bilan himoyalangan:
            Admin (to'liq nazorat), Usta (faqat o'ziga tegishli buyurtmalar) va Kassir (savdolar).
          </p>
        </div>

        {/* Save All Button */}
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-gold-500 hover:from-amber-500 hover:to-gold-400 text-black font-extrabold text-xs transition-all shadow-gold-sm"
        >
          Sozlamalarni Saqlash
        </button>
      </form>
    </div>
  );
};
