import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUIStore } from '../store/useUIStore';
import { getTranslation } from '../utils/i18n';
import { fetchLiveGoldPrices, fetchCbuUsdRate } from '../services/goldPriceService';
import { 
  TrendingUp, 
  RefreshCw, 
  Coins, 
  Building2, 
  ExternalLink,
  CheckCircle2,
  Globe2,
  Scale,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Clock,
  Layers,
  Info
} from 'lucide-react';

export default function RatesPage() {
  const { settings, updateSettings } = useSettingsStore();
  const { language } = useUIStore();
  const t = (section, key) => getTranslation(language, section, key);

  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString(language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'uz-UZ'));
  const [notification, setNotification] = useState(null);

  const handleRefresh = async () => {
    setLoading(true);
    setNotification(null);

    try {
      const data = await fetchLiveGoldPrices({
        goldApiKey: settings.gold_api_key,
        metalsApiKey: settings.metals_api_key,
        preferredProvider: settings.gold_api_provider,
      });

      if (data.success) {
        updateSettings({
          gold_rate_999: data.rates[999],
          gold_rate_750: data.rates[750],
          gold_rate_585: data.rates[585],
          gold_rate_375: data.rates[375],
          usd_to_uzs: data.usdToUzs,
          cbu_rate: data.cbu?.rate || data.usdToUzs,
          cbu_diff: data.cbu?.diff || '0.00',
          cbu_date: data.cbu?.date || 'Bugun',
          active_source: data.provider,
          ounce_price_usd: data.ouncePriceUSD,
        });

        const timeStr = new Date().toLocaleTimeString(language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'uz-UZ');
        setLastUpdated(timeStr);
        setNotification(
          language === 'ru'
            ? `Курсы успешно синхронизированы: ЦБ РУз (${data.cbu?.rate?.toLocaleString()} UZS) и ${data.goldProvider}`
            : language === 'en'
            ? `Rates refreshed: CBU (${data.cbu?.rate?.toLocaleString()} UZS) & ${data.goldProvider}`
            : `CBU.uz (${data.cbu?.rate?.toLocaleString()} so'm) va ${data.goldProvider} narxlari muvaffaqiyatli yangilandi!`
        );
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const probas = [
    { 
      proba: 999, 
      karat: '24K', 
      title: language === 'ru' ? 'Чистое золото (999.9)' : language === 'en' ? 'Fine Bullion Gold (999.9)' : 'Sof Tilla (24K / 999.9)', 
      desc: language === 'ru' ? 'Инвестиционные слитки и банковские монеты' : language === 'en' ? 'Investment bars & bullion ingots' : 'Bank quymalari va toza investitsion oltin',
      rate: settings.gold_rate_999 || 88.20, 
      color: 'from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/40',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    { 
      proba: 750, 
      karat: '18K', 
      title: language === 'ru' ? 'Европейский стандарт (750)' : language === 'en' ? 'Fine Jewelry Alloy (750)' : 'Standart (18K / 750)', 
      desc: language === 'ru' ? 'Премиум изделия с бриллиантами' : language === 'en' ? 'High-end diamond and gem jewelry' : 'Brilliantli va qimmatbaho elita taqinchoqlar',
      rate: settings.gold_rate_750 || 66.15, 
      color: 'from-yellow-500/20 to-amber-500/10 text-yellow-300 border-yellow-500/40',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
    },
    { 
      proba: 585, 
      karat: '14K', 
      title: language === 'ru' ? 'Классическое золото (585)' : language === 'en' ? 'Commercial Jewelry (585)' : 'Klassik (14K / 585)', 
      desc: language === 'ru' ? 'Основной торговый и производственный стандарт' : language === 'en' ? 'Standard production and market jewelry' : 'Ommabop kundalik zargarlik buyumlari',
      rate: settings.gold_rate_585 || 51.60, 
      color: 'from-orange-500/20 to-amber-500/10 text-orange-300 border-orange-500/40',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
    },
    { 
      proba: 375, 
      karat: '9K', 
      title: language === 'ru' ? 'Бюджетный стандарт (375)' : language === 'en' ? 'Light Alloy (375)' : 'Past Proba (9K / 375)', 
      desc: language === 'ru' ? 'Легковесные и экономичные сплавы' : language === 'en' ? 'Economical lightweight jewelry alloys' : 'Yengil va arzonlashtirilgan qotishmalar',
      rate: settings.gold_rate_375 || 33.10, 
      color: 'from-slate-500/20 to-zinc-500/10 text-zinc-300 border-zinc-500/40',
      badgeColor: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40'
    },
  ];

  const currentCbuRate = settings.cbu_rate || settings.usd_to_uzs || 12850;
  const cbuDiff = settings.cbu_diff || '-81.81';
  const isDiffPositive = !cbuDiff.toString().startsWith('-');

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gold-400 mb-1 font-semibold uppercase tracking-wider">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Market Intelligence</span>
            </span>
            <span>•</span>
            <span>CBU + LBMA / GoldAPI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <TrendingUp className="w-7 h-7 text-gold-400" />
            <span>{language === 'ru' ? 'Биржевые Котировки и Курсы' : language === 'en' ? 'Live Rates & Precious Metal Market' : 'Jonli Oltin Kotirovkalari va Kurslar'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {language === 'ru' 
              ? 'Официальный курс доллара ЦБ Узбекистана, мировые спотовые котировки золота (XAU/USD) и расчетная стоимость проб в реальном времени.' 
              : language === 'en'
              ? 'Real-time Central Bank of Uzbekistan USD exchange rate, live London/NY gold spot (XAU), and automated purity valuations.'
              : "O'zbekiston Markaziy Banki rasmiy dollar kursi, London/Nyu-York birja oltin spot (XAU) va barcha probadagi sof narxlar."}
          </p>
        </div>

        {/* Sync Button */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-black text-xs font-bold shadow-gold hover:shadow-gold-glow transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            aria-label="Kurslarni jonli yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? (language === 'ru' ? 'Обновление...' : language === 'en' ? 'Syncing...' : 'Yangilanmoqda...') : (language === 'ru' ? 'Обновить котировки' : language === 'en' ? 'Sync Live Rates' : 'Kurslarni Yangilash')}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div 
          role="status"
          className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center space-x-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Top 2 Highlight Cards: CBU Currency & Troy Ounce Spot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CBU Official Rate Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#12141c]/70 backdrop-blur-xl border border-blue-500/30 p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Markaziy Bank (CBU.uz) Kursi</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Sana: {settings.cbu_date || 'Bugun'} • 1 USD
                </p>
              </div>
            </div>

            <a
              href="https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/"
              target="_blank"
              rel="noreferrer"
              className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/30 flex items-center space-x-1 transition-all"
            >
              <span>cbu.uz</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-baseline justify-between pt-2">
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">1 AQSH Dollari</span>
              <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                {Number(currentCbuRate).toLocaleString()}
                <span className="text-sm font-sans font-normal text-slate-400 ml-1.5">UZS</span>
              </span>
            </div>

            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
                isDiffPositive
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
              }`}
            >
              {isDiffPositive ? `+${cbuDiff}` : cbuDiff} so'm
            </span>
          </div>
        </div>

        {/* Global Troy Ounce Gold Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#12141c]/70 backdrop-blur-xl border border-gold-500/30 p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Dunyo Spot Narxi (XAU/USD)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Manba: {settings.active_source || 'GoldAPI.io (London/NY)'}
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] font-mono text-slate-400">
              <span className="text-gold-400">1 oz = 31.1035 g</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-2">
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">1 Troy Unsiya Oltin</span>
              <span className="text-3xl font-extrabold font-mono text-gold-300 tracking-tight">
                ${(settings.ounce_price_usd || (settings.gold_rate_999 * 31.1035) || 2742.50).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-sm font-sans font-normal text-slate-400 ml-1.5">USD</span>
              </span>
            </div>

            <div className="text-right font-mono text-xs">
              <span className="text-slate-400 block text-[10px]">1 gramm 24K:</span>
              <span className="font-bold text-emerald-400">${Number(settings.gold_rate_999 || 88.20).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Purity Breakdown Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Coins className="w-4 h-4 text-gold-400" />
            <span>Probalar Kesimida Jonli Narxlar (1 gramm uchun)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">So'nggi yangilanish: {lastUpdated}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {probas.map((p) => {
            const uzsPrice = Math.round(p.rate * currentCbuRate);
            return (
              <div
                key={p.proba}
                className="relative overflow-hidden rounded-2xl bg-[#12141c]/65 backdrop-blur-xl border border-white/10 p-5 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:border-gold-500/40 hover:-translate-y-1 hover:shadow-gold-glow group"
              >
                {/* Glow accent */}
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gold-500/10 blur-xl group-hover:bg-gold-500/20 transition-all pointer-events-none"></div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white tracking-wide">{p.title}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-extrabold border ${p.badgeColor}`}>
                      {p.karat} • {p.proba}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 min-h-[32px] line-clamp-2 leading-relaxed mb-4">
                    {p.desc}
                  </p>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                      Valyuta ($ / USD):
                    </span>
                    <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
                      ${Number(p.rate).toFixed(2)}
                      <span className="text-xs font-normal text-slate-400 ml-1">/ gr</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">So'mda (UZS):</span>
                  <span className="text-sm font-bold font-mono text-gold-300">
                    {Number(uzsPrice).toLocaleString()} <span className="text-[11px] text-slate-400 font-normal">so'm</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Production Calculation Guide Card */}
      <div className="rounded-2xl bg-gradient-to-br from-gold-500/10 via-[#12141c]/80 to-[#12141c]/80 backdrop-blur-xl border border-gold-500/20 p-5 shadow-2xl">
        <div className="flex items-start space-x-3.5">
          <div className="w-9 h-9 rounded-xl bg-gold-500/20 flex items-center justify-center text-gold-400 shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white text-sm">
              {language === 'ru' ? 'Формула пересчета чистоты' : language === 'en' ? 'Purity Calculation Method' : "Proba Hisoblash Qoidasi"}
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Zargarlik ishlab chiqarishida barcha hisob-kitoblar 999.9 sof tilla kursidan kelib chiqqan holda metrik proba koeffitsienti bo'yicha proporsional belgilanadi. Masalan: <b>585 narxi = 999 kursi × 0.585</b>. Kassa va zaxira baholash doimiy ravishda real-vaqtda ushbu formula bo'yicha qayta hisoblanadi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
