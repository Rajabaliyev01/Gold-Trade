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
  Sparkles,
  PackageCheck,
  ShieldCheck,
  RotateCcw,
  Tag,
  DollarSign
} from 'lucide-react';

export const ManagerQCReviewModal = ({ order, isOpen, onClose }) => {
  const { reviewAndApproveOrder, rejectAndReturnToCraftsman } = useProductionStore();
  const { settings } = useSettingsStore();

  const initialRecWeight = order?.craftsman_received_weight || order?.received_weight || '';
  const initialRetScrap = order?.craftsman_returned_scrap || order?.returned_scrap || 0;

  const [approvedWeight, setApprovedWeight] = useState(initialRecWeight);
  const [approvedScrap, setApprovedScrap] = useState(initialRetScrap);
  const [productName, setProductName] = useState(order?.title || '');
  const [category, setCategory] = useState(order?.category || 'Zanjir');
  const [sellingPrice, setSellingPrice] = useState('');
  const [managerNotes, setManagerNotes] = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QC Checklist state
  const [qcChecklist, setQcChecklist] = useState({
    dimensionsMatch: true,
    stonesSecure: true,
    polishingQuality: true,
    hallmarkingApproved: true,
  });

  if (!isOpen || !order) return null;

  const goldPricePerGram = settings[`gold_rate_${order.purity}`] || 75;

  const calculation = useMemo(() => {
    return calculateUgar({
      givenWeight: order.given_weight,
      receivedWeight: parseFloat(approvedWeight) || 0,
      returnedScrap: parseFloat(approvedScrap) || 0,
      allowedLossRate: order.allowed_loss_rate || 2.0,
      goldPricePerGram,
    });
  }, [order.given_weight, approvedWeight, approvedScrap, order.allowed_loss_rate, goldPricePerGram]);

  // Handle Approval & Addition to Inventory
  const handleApprove = async (e) => {
    e.preventDefault();
    const finalWeight = parseFloat(approvedWeight);
    if (!finalWeight || finalWeight <= 0) {
      alert("Iltimos, tasdiqlangan tayyor mahsulot og'irligini kiriting!");
      return;
    }

    setIsSubmitting(true);
    const res = await reviewAndApproveOrder({
      orderId: order.order_id,
      approvedWeight: finalWeight,
      approvedScrap: parseFloat(approvedScrap) || 0,
      productName: productName || order.title,
      category,
      sellingPrice: parseFloat(sellingPrice) || (finalWeight * (goldPricePerGram + 30)),
      qcChecklist,
      managerNotes,
    });

    setIsSubmitting(false);

    if (res.success) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#10B981'],
      });
      onClose();
    }
  };

  // Handle Rejection back to craftsman
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Iltimos, qaytarish sababini yozing!");
      return;
    }
    setIsSubmitting(true);
    await rejectAndReturnToCraftsman(order.order_id, rejectReason.trim());
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-[#141824] border border-luxury-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-luxury-border flex items-center justify-between shrink-0 bg-[#0f131d]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Menejer Tekshiruvi &amp; Sifat Nazorati (QC)</h2>
              <p className="text-[11px] text-slate-400">
                #{order.order_id} • Usta: <b className="text-slate-200">{order.craftsman_name}</b> • {order.purity} Proba
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Summary Weights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0d1017] p-3.5 rounded-xl border border-luxury-border font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Ustaga berilgan:</span>
              <span className="text-sm font-bold text-gold-400">{formatWeight(order.given_weight)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Ustadan kelgan:</span>
              <span className="text-sm font-bold text-emerald-400">
                {formatWeight(order.craftsman_received_weight || approvedWeight)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Qaytarilgan qirindi:</span>
              <span className="text-sm font-bold text-slate-300">
                {formatWeight(order.craftsman_returned_scrap || approvedScrap)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Hosil bo'lgan Ugar:</span>
              <span
                className={`text-sm font-bold ${
                  calculation.isOverThreshold ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {formatWeight(calculation.lossWeight)} ({calculation.lossPercentage}%)
              </span>
            </div>
          </div>

          {/* Craftsman Notes if any */}
          {order.craftsman_notes && (
            <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 text-blue-200 text-xs">
              <span className="font-semibold block text-blue-300 mb-0.5">Usta izohi:</span>
              <p className="italic text-slate-300">"{order.craftsman_notes}"</p>
            </div>
          )}

          {/* Ugar Alert Notice */}
          {calculation.isOverThreshold && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/50 flex items-start space-x-2.5 text-rose-200">
              <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-rose-300">Ugar belgilangan me'yordan oshgan!</p>
                <p className="text-[11px] text-rose-200/90 mt-0.5">
                  Ruxsat etilgan limit: {order.allowed_loss_rate || 2}%. Amaldagi: {calculation.lossPercentage}%.
                  Ortiqcha zarar: <b>{formatWeight(calculation.excessLossWeight)}</b> (${calculation.financialLoss}).
                </p>
              </div>
            </div>
          )}

          {/* Reject Mode Form */}
          {rejectMode ? (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-3">
              <h3 className="font-bold text-sm text-rose-300 flex items-center space-x-2">
                <RotateCcw className="w-4 h-4" />
                <span>Ustaga Qayta Ishlashga Yuborish</span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Mahsulotda qanday kamchilik aniqlanganini yozing. Buyurtma holati qaytadan "Jarayonda" rejimiga o'tadi:
              </p>
              <textarea
                rows="3"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Masalan: Polishing yetarli emas, tosh biriktirilishida qaltirash bor..."
                className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-rose-500/40 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-400 resize-none"
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRejectMode(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
                >
                  Ustaga Qaytarish
                </button>
              </div>
            </div>
          ) : (
            <form id="manager-qc-form" onSubmit={handleApprove} className="space-y-4">
              {/* Section 1: Quality Control (QC) Checklist */}
              <div className="p-4 rounded-xl bg-[#0d1017] border border-luxury-border space-y-2.5">
                <h3 className="font-bold text-slate-200 text-xs flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Sifat Nazorati (QC Protocol Checklist)</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <label className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#141824] border border-luxury-border cursor-pointer hover:border-gold-500/40">
                    <input
                      type="checkbox"
                      checked={qcChecklist.dimensionsMatch}
                      onChange={(e) => setQcChecklist({ ...qcChecklist, dimensionsMatch: e.target.checked })}
                      className="w-4 h-4 rounded text-gold-500 focus:ring-0 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-300 text-xs">O'lcham va eskizga muvofiq</span>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#141824] border border-luxury-border cursor-pointer hover:border-gold-500/40">
                    <input
                      type="checkbox"
                      checked={qcChecklist.stonesSecure}
                      onChange={(e) => setQcChecklist({ ...qcChecklist, stonesSecure: e.target.checked })}
                      className="w-4 h-4 rounded text-gold-500 focus:ring-0 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-300 text-xs">Toshlar mustahkam o'rnatilgan</span>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#141824] border border-luxury-border cursor-pointer hover:border-gold-500/40">
                    <input
                      type="checkbox"
                      checked={qcChecklist.polishingQuality}
                      onChange={(e) => setQcChecklist({ ...qcChecklist, polishingQuality: e.target.checked })}
                      className="w-4 h-4 rounded text-gold-500 focus:ring-0 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-300 text-xs">Jilolash (polishing) a'lo darajada</span>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#141824] border border-luxury-border cursor-pointer hover:border-gold-500/40">
                    <input
                      type="checkbox"
                      checked={qcChecklist.hallmarkingApproved}
                      onChange={(e) => setQcChecklist({ ...qcChecklist, hallmarkingApproved: e.target.checked })}
                      className="w-4 h-4 rounded text-gold-500 focus:ring-0 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-300 text-xs">Proba shtampi tasdiqlangan</span>
                  </label>
                </div>
              </div>

              {/* Section 2: Weight Verification (Menejer tarozi tasdig'i) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tasdiqlangan Mahsulot Vazni (gr) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      required
                      value={approvedWeight}
                      onKeyDown={preventNegativeKey}
                      onChange={(e) => setApprovedWeight(sanitizeNonNegative(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                    />
                    <span className="absolute right-3 top-2 text-slate-500 font-mono">gr</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tasdiqlangan Qirindi/Lom (gr)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={approvedScrap}
                      onKeyDown={preventNegativeKey}
                      onChange={(e) => setApprovedScrap(sanitizeNonNegative(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                    />
                    <span className="absolute right-3 top-2 text-slate-500 font-mono">gr</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Finished Goods Details for Warehouse & Jewelry Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Ombordagi Mahsulot Nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Masalan: 585 Italiya Zanjiri (Bismark)"
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategoriya</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white text-xs focus:outline-none focus:border-gold-500"
                  >
                    <option value="Zanjir">Zanjir</option>
                    <option value="Uzuk">Uzuk</option>
                    <option value="Zirak">Zirak</option>
                    <option value="Bilakuzuk">Bilakuzuk</option>
                    <option value="Kulon">Kulon</option>
                    <option value="Komplekt">Komplekt</option>
                    <option value="Boshqa">Boshqa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kassada Sotuv Narxi (USD)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder={`Avtomatik: $${Math.round((parseFloat(approvedWeight) || 0) * (goldPricePerGram + 30))}`}
                    value={sellingPrice}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setSellingPrice(sanitizeNonNegative(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Menejer Izohi
                </label>
                <input
                  type="text"
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  placeholder="Sifat nazorati xulosasi yoki qo'shimcha ko'rsatma..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white text-xs placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-luxury-border flex items-center justify-between shrink-0 bg-[#0f131d]">
          {!rejectMode ? (
            <>
              <button
                type="button"
                onClick={() => setRejectMode(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Qayta ishlashga qaytarish</span>
              </button>

              <button
                type="submit"
                form="manager-qc-form"
                disabled={isSubmitting || !parseFloat(approvedWeight)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                <PackageCheck className="w-4 h-4 text-white" />
                <span>{isSubmitting ? "Saqlanmoqda..." : "Tekshiruvni Tasdiqlash & Omborga Qo'shish"}</span>
              </button>
            </>
          ) : (
            <div className="w-full text-right">
              <span className="text-[11px] text-slate-500">Qaytarish sababi yuqorida to'ldirilishi kerak</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
