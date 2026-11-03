import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { fetchLiveGoldPrices } from '../../services/goldPriceService';
import { formatCurrency } from '../../utils/formatters';
import { 
  TrendingUp, 
  RefreshCw, 
  Coins, 
  Building2, 
  ExternalLink,
  CheckCircle2,
  Globe2,
  Scale
} from 'lucide-react';

export const GoldTicker = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString('uz-UZ'));
  const [notification, setNotification] = useState(null);

  const handleRefresh = async () => {
    setLoading(true);
    setNotification(null);

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

      setLastUpdated(new Date().toLocaleTimeString('uz-UZ'));
      setNotification(`✅ CBU.uz (${data.cbu?.rate?.toLocaleString()} so'm) va ${data.goldProvider} narxlari muvaffaqiyatli yangilandi!`);
      setTimeout(() => setNotification(null), 4000);
    }

    setLoading(false);
  };

  // Auto-refresh once on initial mount
  useEffect(() => {
    handleRefresh();
  }, []);

  const probas = [
    { proba: 999, title: 'Sof Tilla (24K / 999.9)', rate: settings.gold_rate_999, color: 'text-amber-400', border: 'border-amber-500/30' },
    { proba: 750, title: 'Standart (18K / 750)', rate: settings.gold_rate_750, color: 'text-yellow-400', border: 'border-yellow-500/30' },
    { proba: 585, title: 'Klassik (14K / 585)', rate: settings.gold_rate_585, color: 'text-orange-400', border: 'border-orange-500/30' },
    { proba: 375, title: 'Past Proba (9K / 375)', rate: settings.gold_rate_375, color: 'text-zinc-400', border: 'border-zinc-500/30' },
  ];

  const currentCbuRate = settings.cbu_rate || settings.usd_to_uzs || 11941.65;
  const cbuDiff = settings.cbu_diff || '-81.81';
  const isDiffPositive = !cbuDiff.startsWith('-');

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#141824] via-[#161b2a] to-[#141824] border border-gold-500/20 p-4 md:p-5 shadow-gold-sm space-y-4">
      {/* Top Header: Title, Live Source Badges, Refresh Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Haqiqiy Real-Vaqt Oltin va Valyuta API Kotirovkalari</span>
            </h2>

            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE API</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400 flex-wrap">
            <span className="flex items-center space-x-1 text-slate-300">
              <Globe2 className="w-3.5 h-3.5 text-gold-400" />
              <span>Manba: <b>{settings.active_source || 'GoldAPI.io + CBU.uz'}</b></span>
            </span>
            <span>•</span>
            <span>Yangilandi: {lastUpdated}</span>
            {settings.ounce_price_usd && (
              <>
                <span>•</span>
                <span className="text-gold-300 font-mono">1 Troy unsiya: <b>${settings.ounce_price_usd.toLocaleString()}</b></span>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="self-start md:self-auto flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-gold-500/10 to-amber-500/20 hover:from-gold-500/20 hover:to-amber-500/30 border border-gold-500/40 text-xs text-gold-300 font-semibold transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gold-400' : ''}`} />
          <span>{loading ? "API bilan bog'lanmoqda..." : "Jonli Yangilash (CBU + XAU)"}</span>
        </button>
      </div>

      {notification && (
        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Central Bank of Uzbekistan (CBU) Rate Ribbon */}
      <div className="p-3 rounded-xl bg-[#0d1017] border border-luxury-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-200">O'zbekiston Respublikasi Markaziy Banki (CBU) Rasmiy Kursi</span>
              <a
                href="https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center space-x-0.5"
              >
                <span>cbu.uz</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Sana: {settings.cbu_date || '03.11.2026'} • 1 AQSH Dollari (USD)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-auto font-mono">
          <div className="text-right">
            <span className="text-base font-extrabold text-white">
              {Number(currentCbuRate).toLocaleString()} so'm
            </span>
          </div>

          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              isDiffPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            {isDiffPositive ? `+${cbuDiff}` : cbuDiff} so'm
          </span>
        </div>
      </div>

      {/* 4 Purity Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {probas.map((p) => {
          const uzsPrice = Math.round(p.rate * currentCbuRate);
          return (
            <div
              key={p.proba}
              className={`p-3.5 rounded-xl bg-[#0d1017]/90 border ${p.border} relative overflow-hidden flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300 text-[11px] truncate">{p.title}</span>
                  <span className={`font-mono font-bold ${p.color}`}>{p.proba}</span>
                </div>
                <div className="text-xl font-bold font-mono text-white tracking-tight">
                  ${Number(p.rate).toFixed(2)}
                  <span className="text-xs text-slate-400 font-normal"> / gr</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-luxury-border/50">
                <span className="text-slate-500 text-[10px] block">CBU kursi bo'yicha:</span>
                <span className="text-gold-300 font-bold">{Number(uzsPrice).toLocaleString()}</span> so'm/gr
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
