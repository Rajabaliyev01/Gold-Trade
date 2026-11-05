import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { preventNegativeKey, sanitizeNonNegative } from '../../utils/precisionMath';
import { X, Boxes, QrCode, Plus } from 'lucide-react';

export const AddProductModal = ({ isOpen, onClose }) => {
  const { addItem } = useInventoryStore();

  const [formData, setFormData] = useState({
    name: '',
    type: 'raw_gold',
    purity: '585',
    weight: '',
    price_per_gram: '',
    selling_price: '',
    category: 'Qotishma',
    barcode: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleGenerateBarcode = () => {
    const prefix = formData.type === 'raw_gold' ? 'RAW' : formData.type === 'gemstone' ? 'GEM' : 'GOLD';
    const code = `${prefix}-${formData.purity || 'ST'}-${Date.now().toString().slice(-6)}`;
    setFormData({ ...formData, barcode: code });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addItem({
      name: formData.name,
      type: formData.type,
      purity: formData.type === 'gemstone' ? null : parseInt(formData.purity, 10),
      weight: parseFloat(formData.weight) || 0,
      price_per_gram: parseFloat(formData.price_per_gram) || 0,
      selling_price: parseFloat(formData.selling_price) || 0,
      category: formData.category,
      barcode: formData.barcode || `ITEM-${Date.now().toString().slice(-6)}`,
      notes: formData.notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-[#141824] border border-luxury-border shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-luxury-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Omborga Yangi Kirim (Inventar)</h2>
              <p className="text-[11px] text-slate-400">Xomashyo, qimmatbaho toshlar yoki tayyor mahsulot qo'shish</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2638] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Ombor Turi</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'raw_gold', label: 'Xomashyo (Tilla)' },
                { id: 'gemstone', label: 'Qimmatbaho Tosh' },
                { id: 'finished_product', label: 'Tayyor Mahsulot' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t.id })}
                  className={`py-2 px-2 rounded-xl font-medium border text-center transition-colors ${
                    formData.type === t.id
                      ? 'bg-gold-500 text-black border-gold-500 font-bold'
                      : 'bg-[#0d1017] border-luxury-border text-slate-400 hover:bg-[#1a2030]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Mahsulot Nomi</label>
            <input
              type="text"
              required
              placeholder="Masalan: 585 Proba Qotishma Tilla yoki Brilliant VVS"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {formData.type !== 'gemstone' ? (
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Proba</label>
                <select
                  value={formData.purity}
                  onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="999">999.9 (Bank Quymasi)</option>
                  <option value="750">750 (18K)</option>
                  <option value="585">585 (14K)</option>
                  <option value="375">375 (9K)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Tosh Turi</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="Brilliant">Brilliant / Olmos</option>
                  <option value="Zumrad">Zumrad (Emerald)</option>
                  <option value="Yoqut">Yoqut (Ruby)</option>
                  <option value="Sapfir">Sapfir (Sapphire)</option>
                  <option value="Zirkon">Zirkon</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Og'irlik (gramm, mg aniqlikda)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  required
                  placeholder="0.000"
                  value={formData.weight}
                  onKeyDown={preventNegativeKey}
                  onChange={(e) => setFormData({ ...formData, weight: sanitizeNonNegative(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono focus:outline-none focus:border-gold-500"
                />
                <span className="absolute right-3 top-2 text-slate-500 font-mono">gr</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Tannarx (Grammi / $)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="50.00"
                  value={formData.price_per_gram}
                  onKeyDown={preventNegativeKey}
                  onChange={(e) => setFormData({ ...formData, price_per_gram: sanitizeNonNegative(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono focus:outline-none focus:border-gold-500"
                />
                <span className="absolute right-3 top-2 text-slate-500 font-mono">$</span>
              </div>
            </div>

            {formData.type === 'finished_product' && (
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Sotish Narxi (Jami $)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="1500"
                    value={formData.selling_price}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setFormData({ ...formData, selling_price: sanitizeNonNegative(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono focus:outline-none focus:border-gold-500"
                  />
                  <span className="absolute right-3 top-2 text-slate-500 font-mono">$</span>
                </div>
              </div>
            )}
          </div>

          {/* Barcode */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-medium">Shtrix-kod / QR-kod (Barcode)</label>
              <button
                type="button"
                onClick={handleGenerateBarcode}
                className="text-gold-400 hover:text-gold-300 flex items-center space-x-1 font-mono text-[10px]"
              >
                <QrCode className="w-3 h-3" />
                <span>Generatsiya qilish</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="GOLD-585-00123"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono placeholder-slate-500 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Izoh</label>
            <textarea
              rows="2"
              placeholder="Qo'shimcha ma'lumotlar..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1e2436] hover:bg-[#28314a] text-slate-300 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-gold-500 hover:from-amber-500 hover:to-gold-400 text-black font-bold transition-all shadow-gold-sm flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Omborga Qo'shish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
