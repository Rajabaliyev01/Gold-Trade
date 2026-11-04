import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { formatWeight, formatCurrency, formatDate } from '../../utils/formatters';
import {
  X,
  Printer,
  Sparkles,
  Tag,
  QrCode,
  ShieldCheck,
  Building2,
  Check
} from 'lucide-react';

export const JewelryTagModal = ({ order, isOpen, onClose }) => {
  const { factory } = useAuthStore();
  if (!isOpen || !order) return null;

  const factoryName = factory?.name || "Zargarlik Zavodi";
  const barcode = order.barcode || `FP-${order.purity}-${order.order_id?.replace(/[^0-9]/g, '') || '101'}`;
  const netWeight = order.received_weight || order.given_weight || 0;
  const stonesCount = order.craftsman_used_stones || order.stones_count || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-[#141824] border border-luxury-border shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-luxury-border flex items-center justify-between shrink-0 bg-[#0f131d]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 border border-gold-500/20">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Zargarlik Birkasi / Teg (Certificate Label)</h2>
              <p className="text-[11px] text-slate-400">
                Shtrix-kod, unikal seriya raqami va sifat kafolati
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

        {/* Tag Preview Area */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex flex-col items-center">
          {/* Printable Jewelry Tag Container */}
          <div 
            id="printable-tag"
            className="w-full max-w-sm rounded-xl p-5 bg-gradient-to-br from-amber-50 via-white to-amber-100 text-slate-900 shadow-2xl border-2 border-amber-300/80 relative overflow-hidden font-sans"
          >
            {/* Top decorative gold bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

            {/* Brand / Factory Header */}
            <div className="flex items-center justify-between border-b border-amber-300/60 pb-3 pt-1">
              <div>
                <span className="text-[9px] uppercase tracking-widest font-extrabold text-amber-900 block">
                  Davlat Standarti / O'zbekiston
                </span>
                <h3 className="text-sm font-black text-slate-900 tracking-wide uppercase">
                  {factoryName}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-800">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
            </div>

            {/* Product Details Grid */}
            <div className="py-3 space-y-2 border-b border-amber-300/60 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans text-[11px]">Mahsulot:</span>
                <span className="font-bold text-slate-900">{order.title}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans text-[11px]">Metali &amp; Probasi:</span>
                <span className="font-extrabold text-xs px-2 py-0.5 rounded bg-amber-400/30 text-amber-900 border border-amber-400">
                  Oltin (Au) • {order.purity} Proba
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans text-[11px]">Umumiy Og'irligi:</span>
                <span className="font-black text-sm text-slate-900">{formatWeight(netWeight)}</span>
              </div>

              {stonesCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-sans text-[11px]">Toshlar soni:</span>
                  <span className="font-bold text-slate-900">{stonesCount} dona</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-sans text-[11px]">Sana:</span>
                <span className="font-bold text-slate-800">{formatDate(order.completed_at || order.added_to_inventory_at || order.timestamp)}</span>
              </div>

              {order.selling_price > 0 && (
                <div className="flex justify-between items-center pt-1 border-t border-amber-200">
                  <span className="text-slate-600 font-sans text-[11px]">Chakana Narx:</span>
                  <span className="font-black text-emerald-800 text-sm">{formatCurrency(order.selling_price, 'USD')}</span>
                </div>
              )}
            </div>

            {/* Barcode & Hologram Verification Section */}
            <div className="pt-3 flex items-center justify-between">
              {/* Fake Barcode representation */}
              <div className="space-y-1">
                <div className="h-9 flex items-center space-x-0.5 bg-white p-1 rounded border border-amber-300">
                  <div className="w-1 h-7 bg-black" />
                  <div className="w-0.5 h-7 bg-black" />
                  <div className="w-1.5 h-7 bg-black" />
                  <div className="w-0.5 h-7 bg-black" />
                  <div className="w-1 h-7 bg-black" />
                  <div className="w-2 h-7 bg-black" />
                  <div className="w-0.5 h-7 bg-black" />
                  <div className="w-1 h-7 bg-black" />
                  <div className="w-1.5 h-7 bg-black" />
                  <div className="w-0.5 h-7 bg-black" />
                  <div className="w-1 h-7 bg-black" />
                  <div className="w-2 h-7 bg-black" />
                  <div className="w-0.5 h-7 bg-black" />
                  <div className="w-1.5 h-7 bg-black" />
                </div>
                <span className="block font-mono text-[9px] tracking-wider text-center text-slate-700 font-bold">
                  {barcode}
                </span>
              </div>

              {/* Quality Seal */}
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-amber-600 flex items-center justify-center p-0.5">
                  <div className="w-full h-full rounded-full bg-amber-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-amber-800" />
                  </div>
                </div>
                <span className="text-[8px] font-bold text-amber-900 uppercase mt-0.5">QC APPROVED</span>
              </div>
            </div>

            {/* Bottom mini footer */}
            <p className="mt-2 text-[8px] text-center text-slate-500 border-t border-amber-200/60 pt-1">
              Mahsulot Davlat Proba Palatasi talablariga to'liq javob beradi
            </p>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Ushbu birkani zargarlik buyumi qutisiga yoki ip bilan buyumga biriktirib mijozga taqdim etish mumkin.
          </p>
        </div>

        {/* Footer with Print Action */}
        <div className="px-6 py-4 border-t border-luxury-border flex items-center justify-between shrink-0 bg-[#0f131d]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors"
          >
            Yopish
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-black font-bold text-xs transition-all shadow-gold-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-black" />
            <span>Birkani Chop Etish (Print)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
