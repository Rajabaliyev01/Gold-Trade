import React from 'react';
import { formatWeight, formatCurrency, formatDate } from '../../utils/formatters';
import { Printer, CheckCircle2, X, Sparkles } from 'lucide-react';

export const ReceiptModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-[#141824] border border-gold-500/30 shadow-2xl p-6 text-xs space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-luxury-border pb-3">
          <div className="flex items-center space-x-1.5 text-gold-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">Sotuv Muvaffaqiyatli!</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal POS Receipt Design */}
        <div id="pos-receipt" className="p-5 rounded-xl bg-white text-zinc-900 font-mono space-y-3 shadow-md border border-zinc-200">
          <div className="text-center space-y-1 border-b border-dashed border-zinc-300 pb-3">
            <h3 className="font-extrabold text-base tracking-wider text-black">GOLD TRADE</h3>
            <p className="text-[10px] text-zinc-500">Zargarlik Ishlab Chiqarish & Savdo Uyi</p>
            <p className="text-[9px] text-zinc-400">Toshkent sh., Zargarlik bozori, 14-do'kon</p>
            <p className="text-[9px] text-zinc-400">Tel: +998 71 200-00-00</p>
          </div>

          <div className="text-[10px] space-y-0.5 text-zinc-600 border-b border-dashed border-zinc-300 pb-2">
            <div className="flex justify-between">
              <span>Chek ID:</span>
              <span className="font-bold text-black">{transaction.transaction_id}</span>
            </div>
            <div className="flex justify-between">
              <span>Sana:</span>
              <span>{formatDate(transaction.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kassir:</span>
              <span>{transaction.cashier_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Mijoz:</span>
              <span>{transaction.customer_name}</span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-1.5 border-b border-dashed border-zinc-300 pb-2">
            <div className="flex justify-between font-bold text-[10px] text-zinc-500">
              <span>Mahsulot</span>
              <span>Narx</span>
            </div>
            {transaction.items?.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-semibold text-zinc-900">
                  <span className="truncate max-w-[170px]">{item.name}</span>
                  <span>{formatCurrency(item.price)}</span>
                </div>
                <div className="flex justify-between text-[9px] text-zinc-500">
                  <span>
                    {item.purity} Proba • {formatWeight(item.weight)}
                  </span>
                  <span>1 dona</span>
                </div>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="space-y-1 text-[11px] pt-1">
            <div className="flex justify-between">
              <span className="text-zinc-500">Jami hisob:</span>
              <span>{formatCurrency(transaction.subtotal)}</span>
            </div>

            {transaction.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Chegirma:</span>
                <span>-{formatCurrency(transaction.discount)}</span>
              </div>
            )}

            {transaction.trade_in && (
              <div className="flex justify-between text-amber-700 font-semibold bg-amber-50 p-1 rounded">
                <span>Trade-In ({formatWeight(transaction.trade_in.old_gold_weight)} {transaction.trade_in.purity}):</span>
                <span>-{formatCurrency(transaction.trade_in.trade_in_value)}</span>
              </div>
            )}

            <div className="flex justify-between font-black text-sm border-t border-zinc-900 pt-1 text-black">
              <span>TO'LANGAN:</span>
              <span>{formatCurrency(transaction.total_amount)}</span>
            </div>

            {transaction.total_amount_uzs && (
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>So'mda:</span>
                <span>{Number(transaction.total_amount_uzs).toLocaleString()} so'm</span>
              </div>
            )}

            <div className="flex justify-between text-[10px] text-zinc-500 capitalize">
              <span>To'lov turi:</span>
              <span className="font-semibold">{transaction.payment_method}</span>
            </div>
          </div>

          {/* Barcode & Footer note */}
          <div className="text-center pt-2 border-t border-dashed border-zinc-300 space-y-1">
            <div className="inline-block tracking-[3px] font-black text-sm scale-y-125">
              ||| |||| | ||||| || |
            </div>
            <p className="text-[9px] text-zinc-500">Xaridingiz uchun tashakkur! Kafolat 1 yil.</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-gold-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Chekni Chop Etish</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1e2436] hover:bg-[#28314a] text-slate-300 text-xs transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
