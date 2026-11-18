import React, { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useUIStore } from '../../store/useUIStore';
import { getTranslation } from '../../utils/i18n';
import { 
  fetchLiveGoldPrices, 
  fetchCbuUsdRate, 
  fetchGoldApiIo, 
  fetchMetalsApi 
} from '../../services/goldPriceService';
import { isFirebaseConfigured } from '../../services/firebase';
import { seedInitialDataToFirestore } from '../../services/firestoreService';
import { 
  Settings, 
  Flame, 
  Coins, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  UploadCloud,
  Globe
} from 'lucide-react';

export const SettingsPage = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { language, setLanguage } = useUIStore();
  const t = (section, key) => getTranslation(language, section, key);

  // Ugar & Currency settings
  const [maxLoss, setMaxLoss] = useState(settings.max_allowed_loss_percentage || 2.0);
  const [rate999, setRate999] = useState(settings.gold_rate_999 || 88.20);
  const [rate750, setRate750] = useState(settings.gold_rate_750 || 66.15);
  const [rate585, setRate585] = useState(settings.gold_rate_585 || 51.60);
  const [usdToUzs, setUsdToUzs] = useState(settings.usd_to_uzs || 12850);

  // External APIs config
  const [goldApiKey, setGoldApiKey] = useState(settings.gold_api_key || '');
  const [metalsApiKey, setMetalsApiKey] = useState(settings.metals_api_key || '');
  const [provider, setProvider] = useState(settings.gold_api_provider || 'auto');
  const [apiTestFeedback, setApiTestFeedback] = useState(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  // Firestore seed state
  const [isSeedingFirestore, setIsSeedingFirestore] = useState(false);
  const [firestoreFeedback, setFirestoreFeedback] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test External APIs directly
  const handleTestSpecificApi = async (target) => {
    setIsTestingApi(true);
    setApiTestFeedback(null);

    if (target === 'cbu') {
      const res = await fetchCbuUsdRate();
      setIsTestingApi(false);
      if (res && res.rate) {
        setUsdToUzs(res.rate);
        setApiTestFeedback({
          type: 'success',
          text: `CBU.uz: 1 USD = ${res.rate.toLocaleString()} UZS (${res.date || ''})`,
        });
      } else {
        setApiTestFeedback({
          type: 'error',
          text: language === 'ru' ? 'Ошибка получения курса ЦБ' : language === 'en' ? 'Failed to fetch CBU rate' : "CBU kursi olinmadi",
        });
      }
    } else if (target === 'goldapi') {
      const res = await fetchGoldApiIo(goldApiKey);
      setIsTestingApi(false);
      if (res && res.success) {
        if (res.rates['999']) setRate999(res.rates['999']);
        if (res.rates['750']) setRate750(res.rates['750']);
        if (res.rates['585']) setRate585(res.rates['585']);
        setApiTestFeedback({
          type: 'success',
          text: `GoldAPI.io: 999 = $${res.rates['999'] || 0}/g, Ounce = $${res.price_gram_24k * 31.1035 || 0}`,
        });
      } else {
        setApiTestFeedback({
          type: 'error',
          text: `GoldAPI.io: ${res?.error || (language === 'ru' ? 'Неверный ключ' : language === 'en' ? 'Invalid API key' : 'API kalit xato')}`,
        });
      }
    } else if (target === 'metals_api') {
      const res = await fetchMetalsApi(metalsApiKey);
      setIsTestingApi(false);
      if (res && res.success) {
        if (res.rates['999']) setRate999(res.rates['999']);
        if (res.rates['750']) setRate750(res.rates['750']);
        if (res.rates['585']) setRate585(res.rates['585']);
        setApiTestFeedback({
          type: 'success',
          text: `Metals-API: 999 = $${res.rates['999'] || 0}/g`,
        });
      } else {
        setApiTestFeedback({
          type: 'error',
          text: `Metals-API: ${res?.error || (language === 'ru' ? 'Неверный ключ' : language === 'en' ? 'Invalid API key' : 'API kalit xato')}`,
        });
      }
    } else {
      const res = await fetchLiveGoldPrices();
      setIsTestingApi(false);
      if (res && res.rates) {
        if (res.rates['999']) setRate999(res.rates['999']);
        if (res.rates['750']) setRate750(res.rates['750']);
        if (res.rates['585']) setRate585(res.rates['585']);
        setApiTestFeedback({
          type: 'success',
          text: `${res.source}: 999 = $${res.rates['999']}/g`,
        });
      } else {
        setIsTestingApi(false);
      }
    }

    setTimeout(() => setApiTestFeedback(null), 6000);
  };

  // Save Settings
  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({
      max_allowed_loss_percentage: parseFloat(maxLoss) || 2.0,
      gold_rate_999: parseFloat(rate999) || 0,
      gold_rate_750: parseFloat(rate750) || 0,
      gold_rate_585: parseFloat(rate585) || 0,
      usd_to_uzs: parseFloat(usdToUzs) || 12850,
      gold_api_key: goldApiKey,
      metals_api_key: metalsApiKey,
      gold_api_provider: provider,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Seed demo data to Firestore
  const handleSeedData = async () => {
    const confirmMsg = language === 'ru' 
      ? 'Firestore bazasiga boshlang\'ich demo ma\'lumotlarni kiritasizmi?' 
      : language === 'en' 
      ? 'Seed initial demo data into Firestore?' 
      : "Firestore bazasiga boshlang'ich demo ma'lumotlarni kiritasizmi?";
    if (!window.confirm(confirmMsg)) return;
    setIsSeedingFirestore(true);
    setFirestoreFeedback(null);
    try {
      const result = await seedInitialDataToFirestore();
      if (result.success) {
        setFirestoreFeedback({
          type: 'success',
          text: language === 'ru' ? 'Демо-данные успешно загружены в Firestore!' : language === 'en' ? 'Demo data seeded successfully!' : "Demo ma'lumotlar Firestore bazasiga muvaffaqiyatli kiritildi!",
        });
      } else {
        setFirestoreFeedback({
          type: 'error',
          text: result.message || (language === 'ru' ? 'Ошибка загрузки' : language === 'en' ? 'Seed failed' : "Kiritishda xatolik yuz berdi"),
        });
      }
    } catch (err) {
      setFirestoreFeedback({ type: 'error', text: err.message });
    } finally {
      setIsSeedingFirestore(false);
      setTimeout(() => setFirestoreFeedback(null), 6000);
    }
  };

  const languagesList = [
    { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <Settings className="w-6 h-6 text-gold-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{t('settings', 'title')}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">{t('settings', 'subtitle')}</p>
        </div>

        {saveSuccess && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('common', 'success')}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Language Selection Card */}
        <div className="rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
            <Globe className="w-4 h-4 text-gold-400" />
            <h2 className="font-bold text-sm text-white">{t('common', 'language')} (System Language)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {languagesList.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gold-500/20 text-gold-300 border-gold-500/50 shadow-gold'
                      : 'bg-[#181b26]/50 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-gold-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Gold Pricing and Ugar Norm Card */}
        <div className="rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-gold-400" />
              <h2 className="font-bold text-sm text-white">{t('settings', 'goldRate')} &amp; Ugar Limit</h2>
            </div>
            <button
              type="button"
              onClick={() => handleTestSpecificApi('auto')}
              disabled={isTestingApi}
              className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-lg bg-gold-500/20 text-gold-300 hover:bg-gold-500/30 transition-all border border-gold-500/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingApi ? 'animate-spin' : ''}`} />
              <span>{t('settings', 'update')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">999 (24K) - 1g ($)</label>
              <input
                type="number"
                step="0.01"
                value={rate999}
                onChange={(e) => setRate999(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181b26] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">750 (18K) - 1g ($)</label>
              <input
                type="number"
                step="0.01"
                value={rate750}
                onChange={(e) => setRate750(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181b26] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">585 (14K) - 1g ($)</label>
              <input
                type="number"
                step="0.01"
                value={rate585}
                onChange={(e) => setRate585(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181b26] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400">1 USD = UZS (CBU)</label>
                <button
                  type="button"
                  onClick={() => handleTestSpecificApi('cbu')}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>CBU Sinxronlash</span>
                </button>
              </div>
              <input
                type="number"
                step="1"
                value={usdToUzs}
                onChange={(e) => setUsdToUzs(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181b26] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Ruxsat etilgan Ugar (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={maxLoss}
                  onChange={(e) => setMaxLoss(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181b26] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. External API Integration (Live Gold Pricing) */}
        <div className="rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 p-5 space-y-4">
          <div className="pb-3 border-b border-white/10">
            <h2 className="font-bold text-sm text-white">Jonli Oltin Narxlari API Provayderlari</h2>
            <p className="text-xs text-slate-400 mt-0.5">GoldAPI.io va Metals-API integratsiyasi</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Provayderni tanlang</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181b26] border border-white/10 text-white text-xs focus:outline-none focus:border-gold-500"
              >
                <option value="auto">Avtomatik (CBU + GoldAPI / Fallback)</option>
                <option value="goldapi">GoldAPI.io (Asosiy)</option>
                <option value="metals_api">Metals-API.com</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">GoldAPI.io Kaliti</label>
                  <button
                    type="button"
                    onClick={() => handleTestSpecificApi('goldapi')}
                    className="text-[11px] text-gold-400 hover:text-gold-300"
                  >
                    Test Qilish
                  </button>
                </div>
                <input
                  type="password"
                  value={goldApiKey}
                  onChange={(e) => setGoldApiKey(e.target.value)}
                  placeholder="goldapi-xxxx-io"
                  className="w-full px-3 py-2 rounded-xl bg-[#181b26] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">Metals-API Kaliti</label>
                  <button
                    type="button"
                    onClick={() => handleTestSpecificApi('metals_api')}
                    className="text-[11px] text-gold-400 hover:text-gold-300"
                  >
                    Test Qilish
                  </button>
                </div>
                <input
                  type="password"
                  value={metalsApiKey}
                  onChange={(e) => setMetalsApiKey(e.target.value)}
                  placeholder="metals-api-key"
                  className="w-full px-3 py-2 rounded-xl bg-[#181b26] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            {apiTestFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  apiTestFeedback.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
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
          </div>
        </div>

        {/* 4. Firebase Cloud Seed */}
        <div className="rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-gold-400" />
              <h2 className="font-bold text-sm text-white">{t('settings', 'seedData')}</h2>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                isFirebaseConfigured()
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isFirebaseConfigured() ? 'Firebase Online' : 'Local Mock Mode'}
            </span>
          </div>

          <p className="text-xs text-slate-400">{t('settings', 'seedDesc')}</p>

          <button
            type="button"
            onClick={handleSeedData}
            disabled={isSeedingFirestore}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <UploadCloud className={`w-4 h-4 text-gold-400 ${isSeedingFirestore ? 'animate-pulse' : ''}`} />
            <span>{isSeedingFirestore ? t('common', 'processing') : t('settings', 'seed')}</span>
          </button>

          {firestoreFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                firestoreFeedback.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
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
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-black font-bold text-xs shadow-gold hover:opacity-95 transition-all cursor-pointer"
          >
            {t('common', 'save')}
          </button>
        </div>
      </form>
    </div>
  );
};
