import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useProductionStore } from '../../store/useProductionStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { calculateUgar } from '../../utils/ugarCalculator';
import { formatWeight, formatCurrency, formatPercent } from '../../utils/formatters';
import { preventNegativeKey, sanitizeNonNegative } from '../../utils/precisionMath';
import { 
  X, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Send, 
  Sparkles,
  PackageCheck
} from 'lucide-react';

export const ReturnWorkModal = ({ order, isOpen, onClose }) => {
  const { completeOrder } = useProductionStore();
  const { settings } = useSettingsStore();

  const [receivedWeight, setReceivedWeight] = useState('');
  const [returnedScrap, setReturnedScrap] = useState('');
  const [productName, setProductName] = useState(order?.title || '');
  const [sellingPrice, setSellingPrice] = useState('');
  const [category, setCategory] = useState('Zanjir');
  const [deductFromCraftsman, setDeductFromCraftsman] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultFeedback, setResultFeedback] = useState(null);

  if (!isOpen || !order) return null;

  const goldPricePerGram = settings[`gold_rate_${order.purity}`] || 75;

  // Real-time live calculation of Ugar
  const calculation = useMemo(() => {
    return calculateUgar({
      givenWeight: order.given_weight,
      receivedWeight: parseFloat(receivedWeight) || 0,
      returnedScrap: parseFloat(returnedScrap) || 0,
      allowedLossRate: order.allowed_loss_rate || settings.max_allowed_loss_percentage || 2.0,
      goldPricePerGram,
    });
  }, [order.given_weight, receivedWeight, returnedScrap, order.allowed_loss_rate, settings.max_allowed_loss_percentage, goldPricePerGram]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receivedWeight || parseFloat(receivedWeight) <= 0) {
      alert("Iltimos, qaytarilgan tayyor mahsulot og'irligini kiriting.");
      return;
    }

    setIsSubmitting(true);
    const res = await completeOrder({
      orderId: order.order_id,
      receivedWeight: parseFloat(receivedWeight),
      returnedScrap: parseFloat(returnedScrap) || 0,
      productName: productName || order.title,
      sellingPrice: parseFloat(sellingPrice) || (parseFloat(receivedWeight) * (goldPricePerGram + 30)),
      category,
      notes: notes + (calculation.isOverThreshold && deductFromCraftsman ? ` [Zarar $${calculation.financialLoss} ustadan ushlab qolindi]` : ''),
    });

    setIsSubmitting(false);

    if (res.success) {
      if (!calculation.isOverThreshold) {
        // Confetti celebration for good work!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#FFDF00', '#10B981'],
        });
      }

      setResultFeedback(res);
      setTimeout(() => {
        onClose();
        setResultFeedback(null);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-[#141824] border border-luxury-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-luxury-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Ishni Qabul Qilish & Ugar Hisoblash</h2>
              <p className="text-[11px] text-slate-400">
                #{order.order_id} • {order.craftsman_name} • {order.purity} Proba
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Order reference banner */}
          <div className="p-3.5 rounded-xl bg-[#0d1017] border border-luxury-border flex items-center justify-between font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Ustaga berilgan xomashyo</span>
              <span className="text-base font-bold text-gold-400">{formatWeight(order.given_weight)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Ruxsat etilgan limit</span>
              <span className="text-sm font-bold text-slate-300">
                {order.allowed_loss_rate || 2.0}% ({formatWeight((order.given_weight * (order.allowed_loss_rate || 2)) / 100)})
              </span>
            </div>
          </div>

          <form id="return-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Received weight */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  1. Tayyor Mahsulot Og'irligi (gramm) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    required
                    placeholder="Masalan: 96.000"
                    value={receivedWeight}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setReceivedWeight(sanitizeNonNegative(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500 font-mono">gr</span>
                </div>
              </div>

              {/* Returned scrap */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  2. Qaytarilgan Qirindi va Chang (gramm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Masalan: 2.500"
                    value={returnedScrap}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setReturnedScrap(sanitizeNonNegative(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500 font-mono">gr</span>
                </div>
              </div>
            </div>

            {/* DYNAMIC UGAR CALCULATION CARD (Real-time Feedback) */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                calculation.isOverThreshold
                  ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/40'
                  : 'bg-emerald-950/20 border-emerald-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                  {calculation.isOverThreshold ? (
                    <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>Milligramm Ugar Hisob-kitobi</span>
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                    calculation.isOverThreshold
                      ? 'bg-rose-500 text-black'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {calculation.isOverThreshold ? "ME'YORDAN OSHDI" : "YASHIL TASDIQ"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-luxury-border/50 font-mono my-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Jami Qaytdi</span>
                  <span className="font-bold text-slate-200">{formatWeight(calculation.returnedTotal)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Yo'qotish (Ugar)</span>
                  <span
                    className={`font-bold ${
                      calculation.isOverThreshold ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatWeight(calculation.lossWeight)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Ugar Foizi</span>
                  <span
                    className={`font-bold ${
                      calculation.isOverThreshold ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatPercent(calculation.lossPercentage)}
                  </span>
                </div>
              </div>

              {/* Status explanation */}
              {calculation.isOverThreshold ? (
                <div className="space-y-2 mt-3 pt-1">
                  <div className="flex items-start space-x-2 text-rose-300 text-[11px]">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        Yo'qotish ruxsat etilgan {order.allowed_loss_rate}% dan oshdi!
                      </p>
                      <p className="text-slate-300">
                        Ortiqcha yo'qotish: <b>{formatWeight(calculation.excessLossWeight)}</b>. Moliyaviy zarar:{' '}
                        <b className="text-amber-400">{formatCurrency(calculation.financialLoss)}</b>.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0d1017] border border-rose-500/30 flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer text-slate-200">
                      <input
                        type="checkbox"
                        checked={deductFromCraftsman}
                        onChange={(e) => setDeductFromCraftsman(e.target.checked)}
                        className="rounded border-rose-500 text-rose-500 focus:ring-0"
                      />
                      <span>Zararni (${calculation.financialLoss}) usta hisobidan yechish</span>
                    </label>
                    <span className="text-[10px] text-blue-400 flex items-center space-x-1">
                      <Send className="w-3 h-3" />
                      <span>Telegram Alert</span>
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-emerald-400/90 mt-2">
                  ✅ Ugar ruxsat etilgan {order.allowed_loss_rate}% me'yor ichida. Tranzaksiya tasdiqlanadi va omborga
                  kirim qilinadi.
                </p>
              )}
            </div>

            {/* Finished product details to be registered into inventory */}
            <div className="space-y-3 pt-2 border-t border-luxury-border">
              <h4 className="font-semibold text-slate-200 flex items-center space-x-2">
                <PackageCheck className="w-4 h-4 text-gold-400" />
                <span>Omborga Qabul Qilinadigan Tayyor Mahsulot</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Mahsulot Nomi</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Masalan: Bismark Qalin Zanjir"
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Kategoriya</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="Zanjir">Zanjir</option>
                    <option value="Uzuk">Uzuk</option>
                    <option value="Sirg'a">Sirg'a</option>
                    <option value="Bilakuzuk">Bilakuzuk</option>
                    <option value="Kulon">Kulon</option>
                    <option value="Komplekt">Komplekt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Taxminiy Sotuv Narxi ($ USD)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder={`Tavsiya: $${Math.round((parseFloat(receivedWeight) || 0) * (goldPricePerGram + 30))}`}
                    value={sellingPrice}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setSellingPrice(sanitizeNonNegative(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono focus:outline-none focus:border-gold-500"
                  />
                  <span className="absolute right-3 top-2 text-slate-500 font-mono">$</span>
                </div>
              </div>
            </div>
          </form>

          {/* Feedback status */}
          {resultFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Ish muvaffaqiyatli qabul qilindi, ombor va usta balansi yangilandi!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-luxury-border flex items-center justify-end space-x-3 shrink-0 bg-[#0d1017]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1e2436] hover:bg-[#28314a] text-slate-300 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            form="return-form"
            disabled={isSubmitting}
            className={`px-5 py-2 rounded-xl font-bold transition-all shadow-gold-sm flex items-center space-x-2 ${
              calculation.isOverThreshold
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-gradient-to-r from-amber-600 to-gold-500 hover:from-amber-500 hover:to-gold-400 text-black'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Qabul qilinmoqda...' : 'Tasdiqlash & Qabul Qilish'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
