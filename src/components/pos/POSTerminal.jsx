import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useInventoryStore } from '../../store/useInventoryStore';
import { usePosStore } from '../../store/usePosStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatWeight, formatCurrency, PROBA_COLORS } from '../../utils/formatters';
import { TradeInCalculator } from './TradeInCalculator';
import { ReceiptModal } from './ReceiptModal';
import { 
  Store, 
  Search, 
  QrCode, 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  Banknote, 
  RefreshCw, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const POSTerminal = () => {
  const { items } = useInventoryStore();
  const { cart, addToCart, removeFromCart, clearCart, discount, setDiscount, getCartTotals, checkout, lastReceipt } = usePosStore();
  const { currentUser } = useAuthStore();
  const { settings } = useSettingsStore();

  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  // Finished products available in stock
  const availableProducts = items.filter(
    (item) => item.type === 'finished_product' && item.status === 'in_stock'
  );

  const filteredProducts = availableProducts.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.barcode && item.barcode.toLowerCase().includes(search.toLowerCase())) ||
      (item.purity && item.purity.toString().includes(search));

    if (!matchesSearch) return false;
    if (categoryFilter === 'all') return true;
    return item.category === categoryFilter;
  });

  // Handle Quick Barcode Scanner input
  const handleBarcodeScan = (e) => {
    e.preventDefault();
    if (!barcodeInput) return;

    const matched = availableProducts.find(
      (p) => p.barcode && p.barcode.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (matched) {
      addToCart(matched);
      setScanMessage(`"${matched.name}" savatga qo'shildi!`);
      setBarcodeInput('');
    } else {
      setScanMessage(`"${barcodeInput}" kodli mahsulot topilmadi.`);
    }

    setTimeout(() => setScanMessage(''), 3000);
  };

  const totals = getCartTotals();

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const res = checkout({
      cashierName: currentUser?.name || 'Kassir',
      customerName: customerName || 'Doimiy Xaridor',
      customerPhone: customerPhone || '-',
      paymentMethod,
    });

    if (res.success) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      setShowReceiptModal(true);
      setCustomerName('');
      setCustomerPhone('');
    }
  };

  const categories = ['all', 'Zanjir', 'Uzuk', 'Sirg\'a', 'Bilakuzuk', 'Kulon'];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <Store className="w-5 h-5 text-gold-400" />
            <span>Kassa & POS Terminal</span>
          </h1>
          <p className="text-xs text-slate-400">
            Shtrix-kod skaneri, savat, Trade-In (eski tilla qabuli) va tezkor to'lov
          </p>
        </div>

        {/* Quick Barcode Scanner Form */}
        <form onSubmit={handleBarcodeScan} className="flex items-center space-x-2">
          <div className="relative">
            <QrCode className="w-4 h-4 absolute left-3 top-2.5 text-gold-400" />
            <input
              type="text"
              placeholder="Shtrix-kodni skanerlang / kiriting..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl bg-[#141824] border border-gold-500/30 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-gold-500 w-64 shadow-gold-sm"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs transition-colors"
          >
            Skaner
          </button>
        </form>
      </div>

      {scanMessage && (
        <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Main Layout: Products Grid (Left) + Cart Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Products Selection (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141824] p-3 rounded-2xl border border-luxury-border">
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl capitalize font-medium transition-colors shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-gold-500 text-black font-bold shadow-gold-sm'
                      : 'text-slate-400 hover:text-white hover:bg-[#1a2030]'
                  }`}
                >
                  {cat === 'all' ? 'Barchasi' : cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Mahsulot qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0d1017] border border-luxury-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Product cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredProducts.length === 0 ? (
              <div className="col-span-2 p-12 text-center rounded-2xl bg-[#141824] border border-luxury-border">
                <Store className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">Tayyor mahsulotlar mavjud emas</p>
                <p className="text-xs text-slate-500">Omborga yangi mahsulot kiriting yoki ishlab chiqarishdan qabul qiling.</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const probaStyle = PROBA_COLORS[product.purity] || PROBA_COLORS[585];
                const uzsPrice = Math.round((product.selling_price || 0) * (settings.usd_to_uzs || 12850));

                return (
                  <div
                    key={product.id}
                    className="rounded-2xl bg-[#141824] border border-luxury-border p-4 hover:border-gold-500/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-36 rounded-xl overflow-hidden mb-3 bg-[#0d1017] border border-luxury-border">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gold-400 font-mono text-2xl">
                            👑
                          </div>
                        )}
                        <span
                          className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold border backdrop-blur-md ${probaStyle.bg} ${probaStyle.text} ${probaStyle.border}`}
                        >
                          {product.purity} Proba
                        </span>

                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 text-white font-mono text-xs font-semibold">
                          {formatWeight(product.weight)}
                        </span>
                      </div>

                      <h3 className="font-semibold text-sm text-slate-100 truncate mb-1">{product.name}</h3>
                      <p className="text-[11px] font-mono text-slate-500 mb-2">Art: {product.barcode}</p>
                    </div>

                    <div className="pt-2 border-t border-luxury-border flex items-center justify-between">
                      <div>
                        <div className="text-base font-bold font-mono text-gold-300">
                          {formatCurrency(product.selling_price)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          ~ {Number(uzsPrice).toLocaleString()} so'm
                        </div>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        className="px-3.5 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500 text-gold-400 hover:text-black border border-gold-500/30 text-xs font-bold transition-all flex items-center space-x-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Savatga</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Cart & Checkout (1 Column) */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#141824] border border-luxury-border p-5 space-y-4 sticky top-20 shadow-xl">
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-luxury-border pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-gold-400" />
                <h3 className="font-bold text-sm text-white">Savat ({cart.length})</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Tozalash
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Savat bo'sh. Mahsulotlarni tanlang yoki shtrix-kod orqali qo'shing.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-[#0d1017] border border-luxury-border flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-200 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.purity} • {formatWeight(item.weight)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-gold-300">{formatCurrency(item.selling_price)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Trade-In Module Accordion */}
            <TradeInCalculator />

            {/* Customer info & Discount */}
            <div className="space-y-2.5 pt-2 border-t border-luxury-border text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Mijoz Ismi</label>
                  <input
                    type="text"
                    placeholder="Azizbek"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0d1017] border border-luxury-border text-white text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Chegirma ($)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="0"
                    value={discount || ''}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0d1017] border border-luxury-border text-white font-mono text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">To'lov Usuli</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'cash', label: 'Naqd', icon: Banknote },
                    { id: 'card', label: 'Karta', icon: CreditCard },
                    { id: 'trade_in', label: 'Trade-In', icon: RefreshCw },
                  ].map((pm) => {
                    const Icon = pm.icon;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`py-1.5 rounded-lg border text-center flex items-center justify-center space-x-1 text-xs transition-colors ${
                          paymentMethod === pm.id
                            ? 'bg-gold-500 text-black border-gold-500 font-bold'
                            : 'bg-[#0d1017] border-luxury-border text-slate-400 hover:bg-[#1a2030]'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-3 rounded-xl bg-[#0d1017] border border-luxury-border space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Jami Vazn:</span>
                <span className="font-bold text-slate-200">{formatWeight(totals.totalWeight)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Oraliq hisob:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>

              {totals.tradeInDeduction > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Trade-In Chegirma:</span>
                  <span>-{formatCurrency(totals.tradeInDeduction)}</span>
                </div>
              )}

              {totals.discount > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Qo'shimcha Chegirma:</span>
                  <span>-{formatCurrency(totals.discount)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-luxury-border text-sm font-bold text-white">
                <span>TO'LANADIGAN:</span>
                <span className="text-lg text-gold-400">{formatCurrency(totals.finalAmountUSD)}</span>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                ~ {Number(totals.finalAmountUZS).toLocaleString()} so'm
              </div>
            </div>

            {/* Big Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-gold-500 to-yellow-400 hover:from-amber-500 hover:to-gold-300 text-black font-extrabold text-sm tracking-wide transition-all shadow-gold-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>To'lovni Qabul Qilish (Checkout)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {showReceiptModal && (
        <ReceiptModal
          transaction={lastReceipt}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
};
