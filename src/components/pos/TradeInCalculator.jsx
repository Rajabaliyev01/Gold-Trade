import React, { useState } from 'react';
import { usePosStore } from '../../store/usePosStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatWeight, formatCurrency } from '../../utils/formatters';
import { RefreshCw, Coins, ArrowRight, Trash2 } from 'lucide-react';

export const TradeInCalculator = () => {
  const { tradeIn, setTradeIn, removeTradeIn } = usePosStore();
  const { settings } = useSettingsStore();

  const [isOpen, setIsOpen] = useState(Boolean(tradeIn));
  const [weight, setWeight] = useState(tradeIn?.old_gold_weight || '');
  const [purity, setPurity] = useState(tradeIn?.purity || '585');
  
  // Default scrap rate is slightly below raw rate (e.g. $46/g for 585)
  const defaultScrapRate = Math.round((settings[`gold_rate_${purity}`] || 49.5) * 0.92);
  const [scrapRate, setScrapRate] = useState(tradeIn?.scrap_rate_per_gram || defaultScrapRate);

  const calculatedValue = Math.round((parseFloat(weight) || 0) * (parseFloat(scrapRate) || 0) * 100) / 100;

  const handleApply = (e) => {
    e.preventDefault();
    if (!weight || parseFloat(weight) <= 0) return;

    setTradeIn({
      old_gold_weight: parseFloat(weight),
      purity: parseInt(purity, 10),
      scrap_rate_per_gram: parseFloat(scrapRate),
    });
  };

  const handlePurityChange = (newPurity) => {
    setPurity(newPurity);
    const newRate = Math.round((settings[`gold_rate_${newPurity}`] || 49.5) * 0.92);
    setScrapRate(newRate);
  };

  return (
    <div className="rounded-xl bg-[#0d1017] border border-luxury-border overflow-hidden text-xs">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#141824] transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400">
            <RefreshCw className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-slate-200">Trade-In (Eski Tilla Qabuli)</span>
            {tradeIn && (
              <span className="ml-2 text-[10px] text-amber-400 font-mono font-bold">
                -{formatCurrency(tradeIn.trade_in_value)}
              </span>
            )}
          </div>
        </div>

        <span className="text-[10px] text-slate-400 font-medium">
          {isOpen ? 'Yopish' : tradeIn ? 'Faol' : 'Qo\'shish'}
        </span>
      </div>

      {/* Accordion content */}
      {isOpen && (
        <div className="p-3.5 border-t border-luxury-border space-y-3 bg-[#0a0d13]">
          {tradeIn ? (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <p className="font-semibold text-amber-300 font-mono">
                  {formatWeight(tradeIn.old_gold_weight)} ({tradeIn.purity} Proba)
                </p>
                <p className="text-[10px] text-slate-400">
                  Grammi ${tradeIn.scrap_rate_per_gram} dan = <b>{formatCurrency(tradeIn.trade_in_value)}</b> chegirma
                </p>
              </div>
              <button
                onClick={removeTradeIn}
                className="p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-colors"
                title="Trade-Inni olib tashlash"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-3">
              <p className="text-[11px] text-slate-400">
                Xaridor topshirgan eski buyum yoki qirindi tillaning vaznini kiriting. Ushbu summa savatdan avtomatik chegiriladi va omborga kirim qilinadi.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Eski Tilla Probasi</label>
                  <select
                    value={purity}
                    onChange={(e) => handlePurityChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#141824] border border-luxury-border text-white text-xs focus:outline-none focus:border-gold-500"
                  >
                    <option value="999">999.9 Sof</option>
                    <option value="750">750 (18K)</option>
                    <option value="585">585 (14K)</option>
                    <option value="375">375 (9K)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Qabul Narxi ($/g)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={scrapRate}
                    onChange={(e) => setScrapRate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#141824] border border-luxury-border text-white font-mono text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Topshirilgan Vazn (gramm)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Masalan: 8.500"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#141824] border border-luxury-border text-white font-mono text-xs focus:outline-none focus:border-gold-500"
                  />
                  <span className="absolute right-2.5 top-1.5 text-slate-500 font-mono text-[10px]">gr</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-300">
                  Hisoblangan Chegirma: <b className="text-amber-400 font-mono">{formatCurrency(calculatedValue)}</b>
                </span>
                <button
                  type="submit"
                  disabled={!weight || parseFloat(weight) <= 0}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs disabled:opacity-50 transition-colors"
                >
                  Qo'llash
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
