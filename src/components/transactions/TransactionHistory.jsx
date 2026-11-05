import React, { useState } from 'react';
import { usePosStore } from '../../store/usePosStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatWeight, formatCurrency, formatDate } from '../../utils/formatters';
import { ReceiptModal } from '../pos/ReceiptModal';
import { 
  Receipt, 
  Search, 
  Filter, 
  CreditCard, 
  Banknote, 
  RefreshCw, 
  Printer,
  Calendar,
  Sparkles
} from 'lucide-react';

export const TransactionHistory = () => {
  const { transactions } = usePosStore();
  const { settings } = useSettingsStore();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState(null);

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
      (tx.customer_name && tx.customer_name.toLowerCase().includes(search.toLowerCase())) ||
      (tx.cashier_name && tx.cashier_name.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (methodFilter === 'all') return true;
    return tx.payment_method === methodFilter;
  });

  const totalSalesUSD = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
  const tradeInCount = transactions.filter((t) => t.trade_in).length;
  const tradeInGoldTotal = transactions
    .filter((t) => t.trade_in)
    .reduce((sum, t) => sum + (t.trade_in.old_gold_weight || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2.5">
          <Receipt className="w-5 h-5 text-gold-400" />
          <span>Kassa Tranzaksiyalari va Sotuvlar Tarixi</span>
        </h1>
        <p className="text-xs text-slate-400">
          POS orqali amalga oshirilgan barcha xaridlar, to'lov turlari va Trade-In qabullari
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Jami Kassa Tushumi</span>
            <span className="text-xl font-bold font-mono text-gold-400">{formatCurrency(totalSalesUSD)}</span>
            <span className="text-[10px] font-mono text-slate-500 block">
              ~ {Number(totalSalesUSD * (settings.usd_to_uzs || 12850)).toLocaleString()} so'm
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Tranzaksiyalar Soni</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{transactions.length} ta chek</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Trade-In Qabul Qilingan Tilla</span>
            <span className="text-xl font-bold font-mono text-amber-400">{formatWeight(tradeInGoldTotal)}</span>
            <span className="text-[10px] text-slate-500 block">{tradeInCount} ta xaridda</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#12141c]/60 backdrop-blur-xl p-3 rounded-2xl border border-white/10">
        <div className="flex items-center space-x-1 text-xs">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'cash', label: 'Naqd Pul' },
            { id: 'card', label: 'Plastik Karta' },
            { id: 'trade_in', label: 'Trade-In' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMethodFilter(m.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                methodFilter === m.id
                  ? 'bg-gold-500 text-black font-bold shadow-gold-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#1a2030]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Chek ID, mijoz ismi, kassir..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-semibold">
                <th className="py-3.5 pl-4">Chek ID</th>
                <th className="py-3.5">Vaqt / Sana</th>
                <th className="py-3.5">Xaridor</th>
                <th className="py-3.5">Kassir</th>
                <th className="py-3.5 text-center">Buyumlar</th>
                <th className="py-3.5 text-center">To'lov Turi</th>
                <th className="py-3.5 text-right">Summa</th>
                <th className="py-3.5 pr-4 text-right">Chek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    Tranzaksiya ma'lumotlari topilmadi.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.transaction_id} className="hover:bg-[#1a2030]/60 transition-colors">
                    <td className="py-3.5 pl-4 font-mono font-bold text-gold-400">
                      #{tx.transaction_id}
                    </td>

                    <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                      {formatDate(tx.timestamp)}
                    </td>

                    <td className="py-3.5">
                      <p className="font-semibold text-slate-200">{tx.customer_name}</p>
                      <p className="text-[10px] text-slate-500">{tx.customer_phone}</p>
                    </td>

                    <td className="py-3.5 text-slate-300">
                      {tx.cashier_name}
                    </td>

                    <td className="py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-[#1e2436] text-slate-300 font-mono">
                        {tx.items?.length || 1} ta
                      </span>
                    </td>

                    <td className="py-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          tx.payment_method === 'cash'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : tx.payment_method === 'card'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {tx.payment_method}
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-mono font-bold text-white">
                      {formatCurrency(tx.total_amount)}
                    </td>

                    <td className="py-3.5 pr-4 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        title="Chekni ko'rish / Chop etish"
                        className="p-1.5 rounded-lg bg-[#1e2436] hover:bg-[#28314a] text-slate-300 hover:text-gold-400 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTx && (
        <ReceiptModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
};
