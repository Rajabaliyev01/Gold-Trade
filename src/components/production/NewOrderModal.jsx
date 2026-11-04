import React, { useState, useEffect } from 'react';
import { useProductionStore } from '../../store/useProductionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatWeight } from '../../utils/formatters';
import { X, Hammer, ShieldAlert, Sparkles, AlertCircle, Loader2, Gem, Calendar, Ruler } from 'lucide-react';

export const NewOrderModal = ({ isOpen, onClose }) => {
  const { employees, users } = useAuthStore();
  const { createOrder } = useProductionStore();
  const { items } = useInventoryStore();
  const { settings } = useSettingsStore();

  const allStaff = employees && employees.length > 0 ? employees : users || [];
  const craftsmen = allStaff.filter((u) => u.role === 'craftsman');

  const [formData, setFormData] = useState({
    title: '',
    craftsmanId: '',
    purity: '585',
    givenWeight: '',
    stonesCount: '',
    dimensions: '',
    deadline: '',
    allowedLossRate: settings.max_allowed_loss_percentage || 2.0,
    notes: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (craftsmen.length > 0 && !formData.craftsmanId) {
      setFormData((prev) => ({ ...prev, craftsmanId: craftsmen[0].uid }));
    }
  }, [craftsmen]);

  if (!isOpen) return null;

  // Calculate available raw gold in inventory for selected purity
  const availableRawGold = items
    .filter((i) => i.type === 'raw_gold' && i.purity === parseInt(formData.purity, 10) && i.status === 'in_stock')
    .reduce((sum, i) => sum + (i.weight || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const targetCraftsmanId = formData.craftsmanId || craftsmen[0]?.uid;
    if (!targetCraftsmanId) {
      setError("Zavodda birorta ham zargar usta mavjud emas. Avval 'Hodimlar' bo'limidan zargar usta qo'shing.");
      return;
    }

    const weight = parseFloat(formData.givenWeight);
    if (!weight || weight <= 0) {
      setError("Iltimos, berilayotgan xomashyo og'irligini to'g'ri kiriting.");
      return;
    }

    if (weight > availableRawGold) {
      setError(`Omborda ${formData.purity} proba xomashyodan faqat ${formatWeight(availableRawGold)} mavjud.`);
      return;
    }

    const selectedCraftsman = craftsmen.find((c) => c.uid === targetCraftsmanId);

    setSubmitting(true);
    try {
      await createOrder({
        title: formData.title || `${formData.purity} Proba Buyurtma`,
        craftsmanId: targetCraftsmanId,
        craftsmanName: selectedCraftsman?.name || 'Zargar Usta',
        purity: formData.purity,
        givenWeight: weight,
        stonesCount: parseInt(formData.stonesCount, 10) || 0,
        dimensions: formData.dimensions,
        deadline: formData.deadline,
        allowedLossRate: formData.allowedLossRate,
        notes: formData.notes,
      });

      onClose();
    } catch (err) {
      setError(err.message || "Buyurtmani saqlashda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-[#141824] border border-luxury-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-luxury-border flex items-center justify-between shrink-0 bg-[#0f131d]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 border border-gold-500/20">
              <Hammer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Yangi Ishlab Chiqarish Buyurtmasi (Job Card)</h2>
              <p className="text-[11px] text-slate-400">Ustaga xomashyo topshirish orderi va ugar limitini belgilash</p>
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
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form id="new-order-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Buyurtma Nomi / Mahsulot turi *</label>
              <input
                type="text"
                required
                placeholder="Masalan: 585 Proba Italiya Zanjir (Bismark)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Zargar Ustani Tanlang *</label>
                <select
                  value={formData.craftsmanId}
                  onChange={(e) => setFormData({ ...formData, craftsmanId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white focus:outline-none focus:border-gold-500"
                >
                  {craftsmen.map((c) => (
                    <option key={c.uid} value={c.uid}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Oltin Probasi</label>
                <select
                  value={formData.purity}
                  onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="999">999.9 (Sof Bank Tillasi)</option>
                  <option value="750">750 (Italyan / Standart)</option>
                  <option value="585">585 (Klassik Zargarlik)</option>
                  <option value="375">375 (Past Proba)</option>
                </select>
              </div>
            </div>

            {/* Given Weight & Stock info */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Ustaga Beriladigan Oltin (gramm) *</label>
                <span className="text-[10px] text-gold-400 font-mono">
                  Omborda mavjud: <b>{formatWeight(availableRawGold)}</b>
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  required
                  placeholder="100.000"
                  value={formData.givenWeight}
                  onChange={(e) => setFormData({ ...formData, givenWeight: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
                <span className="absolute right-3 top-2 text-slate-500 font-mono">gr</span>
              </div>
            </div>

            {/* Stones count, dimensions & deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                  <Gem className="w-3.5 h-3.5 text-blue-400" />
                  <span>Berilgan Toshlar</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0 dona"
                  value={formData.stonesCount}
                  onChange={(e) => setFormData({ ...formData, stonesCount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                  <Ruler className="w-3.5 h-3.5 text-amber-400" />
                  <span>O'lchamlari</span>
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 60 sm, 18 razmer"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Muddati (Deadline)</span>
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            {/* Allowed Ugar rate */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ruxsat etilgan Ugar limiti (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.allowedLossRate}
                    onChange={(e) => setFormData({ ...formData, allowedLossRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono focus:outline-none focus:border-gold-500"
                  />
                  <span className="absolute right-3 top-2 text-slate-500 font-mono">%</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Maksimal Yo'qotish (gr)</label>
                <div className="px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-gold-400 font-mono">
                  {formData.givenWeight
                    ? formatWeight((parseFloat(formData.givenWeight) * (parseFloat(formData.allowedLossRate) || 2)) / 100)
                    : '0.000 gr'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Texnik Topshiriq / Eskiz Izohi</label>
              <textarea
                rows="2"
                placeholder="To'qilishi, qulfi, yuzasi pardozlash talablari..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-luxury-border flex items-center justify-between shrink-0 bg-[#0f131d]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            form="new-order-form"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-gold-500 hover:from-amber-500 hover:to-gold-400 text-black font-bold transition-all shadow-gold-sm flex items-center space-x-1.5 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <Sparkles className="w-4 h-4 text-black" />
            )}
            <span>{submitting ? 'Saqlanmoqda...' : 'Ustaga Ishni Biriktirish'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
