import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useProductionStore } from '../../store/useProductionStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { calculateUgar } from '../../utils/ugarCalculator';
import { formatWeight, formatPercent } from '../../utils/formatters';
import { 
  X, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Send, 
  Sparkles,
  Gem,
  Hammer
} from 'lucide-react';

export const CraftsmanFinishModal = ({ order, isOpen, onClose }) => {
  const { submitCraftsmanWork } = useProductionStore();
  const { settings } = useSettingsStore();

  const [receivedWeight, setReceivedWeight] = useState('');
  const [returnedScrap, setReturnedScrap] = useState('');
  const [usedStonesCount, setUsedStonesCount] = useState(order?.stones_count || 0);
  const [craftsmanNotes, setCraftsmanNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const goldPricePerGram = settings[`gold_rate_${order.purity}`] || 75;

  // Real-time live calculation of Ugar
  const calculation = useMemo(() => {
    return calculateUgar({
      givenWeight: order.given_weight,
      receivedWeight: parseFloat(receivedWeight) || 0,
      returnedScrap: parseFloat(returnedScrap) || 0,
      allowedLossRate: order.allowed_loss_rate || 2.0,
      goldPricePerGram,
    });
  }, [order.given_weight, receivedWeight, returnedScrap, order.allowed_loss_rate, goldPricePerGram]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const recW = parseFloat(receivedWeight);
    if (!recW || recW <= 0) {
      alert("Iltimos, tayyor bo'lgan mahsulot og'irligini kiriting!");
      return;
    }

    setIsSubmitting(true);
    const res = await submitCraftsmanWork({
      orderId: order.order_id,
      receivedWeight: recW,
      returnedScrap: parseFloat(returnedScrap) || 0,
      usedStonesCount: parseInt(usedStonesCount, 10) || 0,
      craftsmanNotes: craftsmanNotes || "Mahsulot yasab bitkazildi va topshirildi.",
    });

    setIsSubmitting(false);

    if (res.success) {
      if (!calculation.isOverThreshold) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#10B981'],
        });
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-[#141824] border border-luxury-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-luxury-border flex items-center justify-between shrink-0 bg-[#0f131d]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Hammer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Ishni Yakunlash (Usta Topshiruvi)</h2>
              <p className="text-[11px] text-slate-400">
                #{order.order_id} • {order.title} • {order.purity} Proba
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2638] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Order reference banner */}
          <div className="p-3.5 rounded-xl bg-[#0d1017] border border-luxury-border flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Sizga berilgan xomashyo</span>
              <span className="text-base font-bold text-gold-400">{formatWeight(order.given_weight)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Ruxsat etilgan Ugar limiti</span>
              <span className="text-sm font-bold text-slate-300">
                {order.allowed_loss_rate || 2.0}% ({formatWeight((order.given_weight * (order.allowed_loss_rate || 2)) / 100)})
              </span>
            </div>
          </div>

          <form id="craftsman-finish-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Received weight */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  1. Tayyor Mahsulot Og'irligi (gramm) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="Masalan: 96.500"
                    value={receivedWeight}
                    onChange={(e) => setReceivedWeight(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500 font-mono">gr</span>
                </div>
              </div>

              {/* Returned scrap */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  2. Qaytariladigan Qirindi va Chang (gramm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Masalan: 1.800"
                    value={returnedScrap}
                    onChange={(e) => setReturnedScrap(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500 font-mono">gr</span>
                </div>
              </div>
            </div>

            {/* Used stones count */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1.5">
                <Gem className="w-3.5 h-3.5 text-blue-400" />
                <span>3. Ishlatilgan / O'rnatilgan Toshlar Soni (dona)</span>
              </label>
              <input
                type="number"
                min="0"
                value={usedStonesCount}
                onChange={(e) => setUsedStonesCount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Craftsman notes */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                4. Usta Izohi / Ish Tafsiloti
              </label>
              <textarea
                rows="2"
                placeholder="Buyum holati, polishing darajasi yoki o'ziga xos jihatlari..."
                value={craftsmanNotes}
                onChange={(e) => setCraftsmanNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white text-xs placeholder-slate-500 focus:outline-none focus:border-gold-500 resize-none"
              />
            </div>

            {/* Live Ugar Calculation Card */}
            {parseFloat(receivedWeight) > 0 && (
              <div
                className={`p-4 rounded-xl border font-mono transition-all animate-in fade-in ${
                  calculation.isOverThreshold
                    ? 'bg-rose-950/30 border-rose-500/50'
                    : 'bg-emerald-950/30 border-emerald-500/50'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-luxury-border mb-2.5">
                  <div className="flex items-center space-x-2">
                    {calculation.isOverThreshold ? (
                      <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    )}
                    <span
                      className={`text-xs font-bold ${
                        calculation.isOverThreshold ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {calculation.isOverThreshold ? "Ugar Me'yordan Oshdi!" : "Ugar Me'yorda (Standart)"}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white">
                    {calculation.lossPercentage}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded bg-black/30">
                    <span className="text-slate-400 block text-[10px]">Umumiy Qaytarilgan:</span>
                    <span className="font-bold text-slate-200">
                      {formatWeight(calculation.totalReturnedWeight)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-black/30">
                    <span className="text-slate-400 block text-[10px]">Hosil bo'lgan Ugar:</span>
                    <span className="font-bold text-amber-300">
                      {formatWeight(calculation.lossWeight)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-black/30">
                    <span className="text-slate-400 block text-[10px]">Ruxsat etilgan:</span>
                    <span className="font-bold text-slate-300">
                      {formatWeight(calculation.allowedLossWeight)}
                    </span>
                  </div>
                </div>

                {calculation.isOverThreshold && (
                  <p className="mt-2 text-[10px] text-rose-300/90 leading-relaxed font-sans">
                    ⚠️ Me'yordan ortiq yo'qotish: <b>{formatWeight(calculation.excessLossWeight)}</b>. Menejer tekshiruvida tasdiqlanishi talab etiladi.
                  </p>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-luxury-border flex items-center justify-between shrink-0 bg-[#0f131d]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors"
          >
            Bekor qilish
          </button>

          <button
            type="submit"
            form="craftsman-finish-form"
            disabled={isSubmitting || !parseFloat(receivedWeight)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-gold-400 hover:from-amber-400 hover:to-gold-300 text-black font-bold text-xs transition-all shadow-gold-sm disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-black" />
            <span>{isSubmitting ? "Yuborilmoqda..." : "Ishni Yakunlash & Tekshiruvga Topshirish"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
