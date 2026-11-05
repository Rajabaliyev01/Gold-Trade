import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatWeight, formatCurrency, formatDate, PROBA_COLORS } from '../../utils/formatters';
import { AddProductModal } from './AddProductModal';
import { 
  Boxes, 
  Plus, 
  Search, 
  QrCode, 
  Tag, 
  Diamond, 
  Coins, 
  Sparkles,
  CheckCircle2,
  Printer
} from 'lucide-react';

export const InventoryList = () => {
  const { items } = useInventoryStore();
  const { currentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBarcodeItem, setSelectedBarcodeItem] = useState(null);

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.barcode && item.barcode.toLowerCase().includes(search.toLowerCase())) ||
      (item.purity && item.purity.toString().includes(search));

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  // Calculate vault stats
  const totalRawWeight = items
    .filter((i) => i.type === 'raw_gold' && i.status === 'in_stock')
    .reduce((sum, i) => sum + (i.weight || 0), 0);

  const totalFinishedWeight = items
    .filter((i) => i.type === 'finished_product' && i.status === 'in_stock')
    .reduce((sum, i) => sum + (i.weight || 0), 0);

  const totalFinishedValuation = items
    .filter((i) => i.type === 'finished_product' && i.status === 'in_stock')
    .reduce((sum, i) => sum + (i.selling_price || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <Boxes className="w-5 h-5 text-gold-400" />
            <span>Ombor Boshqaruvi (Inventar)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Xomashyo oltin (quymo, qotishma), qimmatbaho toshlar va tayyor zargarlik buyumlari
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-gold-500 hover:from-amber-500 hover:to-gold-400 text-black font-bold text-xs transition-all shadow-gold-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Omborga Kirim Qilish</span>
          </button>
        )}
      </div>

      {/* Mini KPI Cards for Warehouse */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Ombordagi Xomashyo Tilla</span>
            <span className="text-xl font-bold font-mono text-gold-400">{formatWeight(totalRawWeight)}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Tayyor Mahsulotlar ({formatWeight(totalFinishedWeight)})</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{formatCurrency(totalFinishedValuation)}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Diamond className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Qimmatbaho Toshlar</span>
            <span className="text-xl font-bold font-mono text-blue-400">
              {items.filter((i) => i.type === 'gemstone').reduce((sum, i) => sum + (i.pieces_count || 1), 0)} dona
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#12141c]/60 backdrop-blur-xl p-3 rounded-2xl border border-white/10">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 text-xs">
          {[
            { id: 'all', label: 'Barchasi', count: items.length },
            { id: 'raw_gold', label: 'Xomashyo Tilla', count: items.filter((i) => i.type === 'raw_gold').length },
            { id: 'gemstone', label: 'Qimmatbaho Toshlar', count: items.filter((i) => i.type === 'gemstone').length },
            { id: 'finished_product', label: 'Tayyor Mahsulotlar', count: items.filter((i) => i.type === 'finished_product').length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
                  isActive
                    ? 'bg-gold-500 text-black font-bold shadow-gold-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#1a2030]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/20 text-black' : 'bg-[#1e2436] text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Nomi, shtrix-kod, proba..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-semibold">
                <th className="py-3.5 pl-4">Mahsulot / Xomashyo</th>
                <th className="py-3.5">Turi</th>
                <th className="py-3.5">Proba</th>
                <th className="py-3.5 text-right">Vazni (Og'irligi)</th>
                <th className="py-3.5 text-right">Narxi / Qiymati</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 text-center">Shtrix-Kod</th>
                <th className="py-3.5 pr-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    Mos keluvchi inventar ma'lumoti topilmadi.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const probaStyle = item.purity ? PROBA_COLORS[item.purity] || PROBA_COLORS[585] : null;
                  const isSold = item.status === 'sold';

                  return (
                    <tr key={item.id} className="hover:bg-[#1a2030]/60 transition-colors">
                      <td className="py-3.5 pl-4">
                        <div className="flex items-center space-x-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-9 h-9 rounded-lg object-cover border border-gold-500/20"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 font-mono text-xs">
                              {item.purity || '💎'}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-200">{item.name}</p>
                            <p className="text-[10px] text-slate-500">{item.category} • {formatDate(item.created_at)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 capitalize">
                        {item.type === 'raw_gold' && (
                          <span className="text-amber-400 font-medium">Xomashyo</span>
                        )}
                        {item.type === 'gemstone' && (
                          <span className="text-blue-400 font-medium">Tosh</span>
                        )}
                        {item.type === 'finished_product' && (
                          <span className="text-emerald-400 font-medium">Tayyor Buyum</span>
                        )}
                      </td>

                      <td className="py-3.5">
                        {item.purity ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${probaStyle?.bg} ${probaStyle?.text} ${probaStyle?.border}`}
                          >
                            {item.purity}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono">—</span>
                        )}
                      </td>

                      <td className="py-3.5 text-right font-mono font-bold text-slate-200">
                        {formatWeight(item.weight)}
                      </td>

                      <td className="py-3.5 text-right font-mono">
                        {item.selling_price ? (
                          <span className="font-bold text-gold-300">{formatCurrency(item.selling_price)}</span>
                        ) : item.price_per_gram ? (
                          <span className="text-slate-300">${item.price_per_gram}/g</span>
                        ) : item.price_per_unit ? (
                          <span className="text-blue-300">${item.price_per_unit}/dona</span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            isSold
                              ? 'bg-zinc-800 text-zinc-400'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isSold ? 'Sotilgan' : 'Mavjud'}
                        </span>
                      </td>

                      <td className="py-3.5 text-center font-mono text-[11px] text-slate-400">
                        {item.barcode ? (
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                            {item.barcode}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3.5 pr-4 text-right">
                        <button
                          onClick={() => setSelectedBarcodeItem(item)}
                          title="Shtrix-kod / Birka ko'rish"
                          className="p-1.5 rounded-lg bg-[#1e2436] hover:bg-[#28314a] text-slate-300 hover:text-gold-400 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Printable Barcode Label Tag Preview Modal */}
      {selectedBarcodeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-gold-500/40 p-6 shadow-2xl text-center space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="font-extrabold gold-gradient-text tracking-wider uppercase text-xs">Gold Trade ERP</span>
              <button
                onClick={() => setSelectedBarcodeItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Simulated Luxury Jewelry Tag */}
            <div className="p-4 rounded-xl bg-white text-black text-left space-y-2 shadow-inner font-sans border-2 border-gold-500">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-sm leading-tight">{selectedBarcodeItem.name}</h4>
                  <p className="text-[10px] text-gray-600 font-mono">Art: {selectedBarcodeItem.barcode || selectedBarcodeItem.id}</p>
                </div>
                <div className="px-1.5 py-0.5 rounded bg-black text-gold-400 font-mono text-xs font-bold">
                  {selectedBarcodeItem.purity || '585'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-y border-gray-200 py-1.5 font-mono">
                <div>
                  <span className="text-[9px] text-gray-500 block">Vazni:</span>
                  <span className="font-bold text-sm">{formatWeight(selectedBarcodeItem.weight)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-gray-500 block">Narxi:</span>
                  <span className="font-bold text-sm text-amber-700">
                    {selectedBarcodeItem.selling_price
                      ? formatCurrency(selectedBarcodeItem.selling_price)
                      : `$${selectedBarcodeItem.price_per_gram}/g`}
                  </span>
                </div>
              </div>

              {/* Barcode graphic simulation */}
              <div className="text-center pt-1">
                <div className="inline-block tracking-[4px] font-mono text-lg font-black scale-y-125">
                  ||| | |||| | |||||| || |
                </div>
                <p className="text-[9px] font-mono text-gray-600">{selectedBarcodeItem.barcode || '482001928492'}</p>
              </div>
            </div>

            <button
              onClick={() => {
                window.print();
              }}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs shadow-gold-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Birkani Chop Etish (Print Label)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
