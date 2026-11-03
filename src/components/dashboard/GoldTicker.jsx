import React, { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { fetchLiveGoldPrices } from '../../services/goldPriceService';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, RefreshCw, DollarSign, Award, ShieldAlert } from 'lucide-react';

export const GoldTicker = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString('uz-UZ'));

  const handleRefresh = async () => {
    setLoading(true);
    const data = await fetchLiveGoldPrices();
    if (data.success) {
      updateSettings({
        gold_rate_999: data.rates[999],
        gold_rate_750: data.rates[750],
        gold_rate_585: data.rates[585],
        gold_rate_375: data.rates[375],
        usd_to_uzs: data.usdToUzs,
      });
      setLastUpdated(new Date().toLocaleTimeString('uz-UZ'));
    }
    setLoading(false);
  };

  const probas = [
    { proba: 999, title: 'Sof Tilla (24K)', rate: settings.gold_rate_999, color: 'text-amber-400', border: 'border-amber-500/30' },
    { proba: 750, title: 'Standart (18K)', rate: settings.gold_rate_750, color: 'text-yellow-400', border: 'border-yellow-500/30' },
    { proba: 585, title: 'Klassik (14K)', rate: settings.gold_rate_585, color: 'text-orange-400', border: 'border-orange-500/30' },
    { proba: 375, title: 'Past Proba (9K)', rate: settings.gold_rate_375, color: 'text-slate-400', border: 'border-slate-500/30' },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#141824] via-[#161b2a] to-[#141824] border border-gold-500/20 p-4 md:p-5 shadow-gold-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>XAU/USD Real-Vaqt Oltin Kotirovkalari</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                +0.84% Bugun
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Jahon birjasi narxlari asosida 1 gramm uchun hisoblangan qiymatlar (Yangilandi: {lastUpdated})
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="self-start md:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1e2436] hover:bg-[#28314a] border border-luxury-border text-xs text-slate-300 font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gold-400' : ''}`} />
          <span>Narxlarni Yangilash</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {probas.map((p) => {
          const uzsPrice = Math.round(p.rate * (settings.usd_to_uzs || 12850));
          return (
            <div
              key={p.proba}
              className={`p-3 rounded-xl bg-[#0d1017]/80 border ${p.border} relative overflow-hidden`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">{p.title}</span>
                <span className={`font-mono font-bold ${p.color}`}>{p.proba}</span>
              </div>
              <div className="text-lg font-bold font-mono text-white tracking-tight">
                ${Number(p.rate).toFixed(2)}
                <span className="text-xs text-slate-400 font-normal"> / gr</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                ~ {Number(uzsPrice).toLocaleString()} so'm
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
