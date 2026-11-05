import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatWeight, formatCurrency } from '../../utils/formatters';
import { preventNegativeKey, sanitizeNonNegative } from '../../utils/precisionMath';
import {
  Boxes,
  Flame,
  Hammer,
  ShieldCheck,
  Tag,
  Plus,
  ArrowRight,
  Sparkles,
  Scale,
  Gem,
  CheckCircle2,
  FileText,
  Calculator,
  Send,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const JewelryPipelineHub = ({ onOpenNewOrder, isOpen = true, onToggle }) => {
  const { addRawMaterialInward, addGemstoneOrFittingInward, recordMeltingSheet } = useInventoryStore();
  const { currentUser } = useAuthStore();

  const [activeModal, setActiveModal] = useState(null); // 'raw_inward' | 'gem_inward' | 'melting' | 'hallmark'

  // Form states for Raw Material Inward Slip
  const [supplier, setSupplier] = useState('');
  const [rawWeight, setRawWeight] = useState('');
  const [rawPurity, setRawPurity] = useState('585');
  const [usdValuation, setUsdValuation] = useState('');
  const [materialType, setMaterialType] = useState('scrap_gold');
  const [rawNotes, setRawNotes] = useState('');
  const [rawLoading, setRawLoading] = useState(false);

  // Form states for Gemstone / Fitting Inward
  const [gemName, setGemName] = useState('');
  const [gemType, setGemType] = useState('gemstone');
  const [gemCarats, setGemCarats] = useState('');
  const [gemPieces, setGemPieces] = useState('1');
  const [gemCut, setGemCut] = useState('Dumaloq (Brilliant)');
  const [gemClarity, setGemClarity] = useState('VVS1');
  const [gemPrice, setGemPrice] = useState('');
  const [gemLoading, setGemLoading] = useState(false);

  // Form states for Melting & Ligature (Alloying) Sheet
  const [pureGoldInput, setPureGoldInput] = useState('');
  const [copperInput, setCopperInput] = useState('');
  const [silverInput, setSilverInput] = useState('');
  const [targetPurity, setTargetPurity] = useState('585');
  const [outputIngot, setOutputIngot] = useState('');
  const [furnaceLoss, setFurnaceLoss] = useState('');
  const [meltLoading, setMeltLoading] = useState(false);

  // Hallmark Transfer Form State
  const [hallmarkCount, setHallmarkCount] = useState('');
  const [hallmarkWeight, setHallmarkWeight] = useState('');
  const [hallmarkOffice, setHallmarkOffice] = useState("O'zbekiston Davlat Proba Palatasi (Toshkent)");
  const [hallmarkSuccess, setHallmarkSuccess] = useState(false);

  // 1. Handle Raw Material Inward
  const handleRawInwardSubmit = async (e) => {
    e.preventDefault();
    if (!rawWeight || parseFloat(rawWeight) <= 0) return;
    setRawLoading(true);
    await addRawMaterialInward({
      supplier: supplier.trim() || 'Noma\'lum mijoz / ta\'minotchi',
      materialType,
      grossWeight: parseFloat(rawWeight),
      purity: parseInt(rawPurity, 10),
      usdValuation: parseFloat(usdValuation) || 0,
      notes: rawNotes,
    });
    setRawLoading(false);
    setActiveModal(null);
    setSupplier('');
    setRawWeight('');
    setUsdValuation('');
    setRawNotes('');
  };

  // 2. Handle Gemstone Inward
  const handleGemInwardSubmit = async (e) => {
    e.preventDefault();
    setGemLoading(true);
    await addGemstoneOrFittingInward({
      name: gemName,
      itemType: gemType,
      carats: parseFloat(gemCarats) || 0,
      piecesCount: parseInt(gemPieces, 10) || 1,
      cutShape: gemCut,
      clarity: gemClarity,
      totalUsd: parseFloat(gemPrice) || 0,
      supplier,
    });
    setGemLoading(false);
    setActiveModal(null);
    setGemName('');
    setGemCarats('');
    setGemPrice('');
  };

  // 3. Handle Melting & Ligature Record
  const handleMeltingSubmit = async (e) => {
    e.preventDefault();
    if (!pureGoldInput || parseFloat(pureGoldInput) <= 0) return;
    setMeltLoading(true);
    await recordMeltingSheet({
      pureGoldWeight: parseFloat(pureGoldInput),
      ligatureCopper: parseFloat(copperInput) || 0,
      ligatureSilver: parseFloat(silverInput) || 0,
      targetPurity: parseInt(targetPurity, 10),
      outputIngotWeight: parseFloat(outputIngot) || (parseFloat(pureGoldInput) + (parseFloat(copperInput) || 0) + (parseFloat(silverInput) || 0)),
      furnaceLossWeight: parseFloat(furnaceLoss) || 0,
      operatorName: currentUser?.name || 'Bosh Erituvchi',
    });
    setMeltLoading(false);
    setActiveModal(null);
    setPureGoldInput('');
    setCopperInput('');
    setSilverInput('');
    setOutputIngot('');
    setFurnaceLoss('');
  };

  // 4. Handle Hallmark Form submit
  const handleHallmarkSubmit = (e) => {
    e.preventDefault();
    setHallmarkSuccess(true);
    setTimeout(() => {
      setHallmarkSuccess(false);
      setActiveModal(null);
    }, 1800);
  };

  return (
    <div id="jewelry-pipeline-hub" className="space-y-4">
      {/* 5-Stage Process Pipeline Bar */}
      <div className="bg-[#10141f] border border-luxury-border rounded-2xl p-4 sm:p-5 transition-all">
        <div 
          onClick={onToggle}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group select-none"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-sm font-bold text-white group-hover:text-gold-300 transition-colors">
                  5 Bosqichli Zargarlik Ishlab Chiqarish Tizimi
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/30 font-semibold">
                  Sanoat Zanjiri
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Xomashyo kirimidan tortib tayyor zargarlik birkasigacha bo'lgan to'liq sanoat zanjiri
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center">
            <span className="text-xs text-gold-400 font-semibold">
              {isOpen ? "Yopish" : "Ochish"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#141824] border border-luxury-border flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
              {isOpen ? <ChevronUp className="w-4 h-4 text-gold-400" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Stages Cards Grid (Shown when isOpen is true) */}
        {isOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4 border-t border-luxury-border mt-4 animate-in fade-in duration-200">
          
          {/* Stage 1: Raw Material */}
          <div className="p-3.5 rounded-xl bg-[#141926] border border-luxury-border flex flex-col justify-between hover:border-gold-500/40 transition-all space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 font-mono">
                  1-BOSQICH
                </span>
                <Boxes className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-100">RAW MATERIAL</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Lom, 999.9 ingot, tosh va furnitura kirim nakladnoyasi
              </p>
            </div>
            
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => setActiveModal('raw_inward')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Xomashyo Kirimi</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('gem_inward')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Gem className="w-3 h-3" />
                <span>Tosh / Qulf Kirimi</span>
              </button>
            </div>
          </div>

          {/* Stage 2: Metal Processing */}
          <div className="p-3.5 rounded-xl bg-[#141926] border border-luxury-border flex flex-col justify-between hover:border-gold-500/40 transition-all space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-orange-400 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 font-mono">
                  2-BOSQICH
                </span>
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-100">METAL PROCESSING</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Eritish, ligatura qo'shish (999 &rarr; 585) va pechdagi yo'qotish
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setActiveModal('melting')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[11px] font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Calculator className="w-3 h-3" />
                <span>Eritish &amp; Ligatura Akti</span>
              </button>
            </div>
          </div>

          {/* Stage 3: Production & Orders */}
          <div className="p-3.5 rounded-xl bg-[#141926] border border-luxury-border flex flex-col justify-between hover:border-gold-500/40 transition-all space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gold-400 px-2 py-0.5 rounded bg-gold-500/10 border border-gold-500/30 font-mono">
                  3-BOSQICH
                </span>
                <Hammer className="w-4 h-4 text-gold-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-100">PRODUCTION</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Ustaga xomashyo topshirish orderi, job card va yasash jarayoni
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenNewOrder}
                className="w-full py-1.5 px-2.5 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 text-[11px] font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Yangi Buyurtma Biriktirish</span>
              </button>
            </div>
          </div>

          {/* Stage 4: Finishing & QC */}
          <div className="p-3.5 rounded-xl bg-[#141926] border border-luxury-border flex flex-col justify-between hover:border-gold-500/40 transition-all space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-teal-400 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30 font-mono">
                  4-BOSQICH
                </span>
                <ShieldCheck className="w-4 h-4 text-teal-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-100">FINISHING &amp; QC</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Ugar hisobi, Davlat Proba Palatasi akti va sifat nazorati
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setActiveModal('hallmark')}
                className="w-full py-1.5 px-2.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <FileText className="w-3 h-3" />
                <span>Proba Palatasi Akti</span>
              </button>
            </div>
          </div>

          {/* Stage 5: Finished Goods */}
          <div className="p-3.5 rounded-xl bg-[#141926] border border-luxury-border flex flex-col justify-between hover:border-gold-500/40 transition-all space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 font-mono">
                  5-BOSQICH
                </span>
                <Tag className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-100">FINISHED GOODS</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Tayyor mahsulot ombori, unikal shtrix-kod va zargarlik birkasi
              </p>
            </div>

            <div className="pt-1">
              <div className="w-full py-1.5 px-2 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium text-center">
                Buyurtmadan avtomatik
              </div>
            </div>
          </div>

          </div>
        )}
      </div>

      {/* ── MODAL 1: RAW MATERIAL INWARD (Xomashyo Kirimi) ── */}
      {activeModal === 'raw_inward' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#141824] border border-luxury-border shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-luxury-border flex items-center justify-between bg-[#0f131d]">
              <div className="flex items-center space-x-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Xomashyo Kirim Nakladnoyasi (Material Inward Slip)</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRawInwardSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kimdan qabul qilindi (Ta'minotchi / Mijoz) *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Alisher Valiyev (Tadbirkor)"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Xomashyo Turi</label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white text-xs focus:outline-none focus:border-gold-500"
                  >
                    <option value="scrap_gold">Lom / Qayta ishlash tillasi</option>
                    <option value="ingot_999">Sof Ingot (999.9)</option>
                    <option value="granules">Oltin Granulasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Probasi</label>
                  <select
                    value={rawPurity}
                    onChange={(e) => setRawPurity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white text-xs focus:outline-none focus:border-gold-500"
                  >
                    <option value="999">999.9 (Sof oltin)</option>
                    <option value="750">750 (18K)</option>
                    <option value="585">585 (14K)</option>
                    <option value="375">375 (9K)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sof Vazni (gramm) *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    required
                    placeholder="Masalan: 150.000"
                    value={rawWeight}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setRawWeight(sanitizeNonNegative(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dollar Qiymati ($)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Masalan: 9500"
                    value={usdValuation}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setUsdValuation(sanitizeNonNegative(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {parseFloat(rawWeight) > 0 && (
                <div className="p-3 rounded-xl bg-black/40 border border-luxury-border font-mono text-[11px] flex justify-between items-center text-slate-300">
                  <span>999.9 ga o'tkazilgan sof tilla ekvivalenti:</span>
                  <span className="font-bold text-gold-400">
                    {formatWeight((parseFloat(rawWeight) * parseInt(rawPurity, 10)) / 999.9)}
                  </span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={rawLoading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  {rawLoading ? "Saqlanmoqda..." : "Kirim Nakladnoyasini Tasdiqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: GEMSTONE / FITTING INWARD (Tosh va Qulflar Kirimi) ── */}
      {activeModal === 'gem_inward' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#141824] border border-luxury-border shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-luxury-border flex items-center justify-between bg-[#0f131d]">
              <div className="flex items-center space-x-2">
                <Gem className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Tosh va Furnitura Kirim Akti</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGemInwardSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nomi / Tavsifi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Yakut Brilliant 0.50 ct yoki 585 Qulf Karabin"
                  value={gemName}
                  onChange={(e) => setGemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Turi</label>
                  <select
                    value={gemType}
                    onChange={(e) => setGemType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white text-xs focus:outline-none focus:border-gold-500"
                  >
                    <option value="gemstone">Qimmatbaho Tosh (Brilliant, Yoqut va hk)</option>
                    <option value="fitting">Furnitura / Qulflar / Zanjir qismlari</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Soni (dona)</label>
                  <input
                    type="number"
                    min="1"
                    value={gemPieces}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setGemPieces(sanitizeNonNegative(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {gemType === 'gemstone' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Karat (ct)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Masalan: 1.25"
                      value={gemCarats}
                      onKeyDown={preventNegativeKey}
                      onChange={(e) => setGemCarats(sanitizeNonNegative(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tozalik / Rang</label>
                    <input
                      type="text"
                      placeholder="VVS1 / D-E"
                      value={gemClarity}
                      onChange={(e) => setGemClarity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white text-xs focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Umumiy Qiymati (USD)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="$ narxi"
                  value={gemPrice}
                  onKeyDown={preventNegativeKey}
                  onChange={(e) => setGemPrice(sanitizeNonNegative(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={gemLoading}
                  className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  {gemLoading ? "Saqlanmoqda..." : "Kirimni Qabul Qilish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: MELTING & LIGATURE (Eritish va Qotishma) ── */}
      {activeModal === 'melting' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#141824] border border-luxury-border shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-luxury-border flex items-center justify-between bg-[#0f131d]">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Eritish va Ligatura Akti (Melting Sheet)</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMeltingSubmit} className="p-6 space-y-3.5 text-xs">
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Sof tillani (999.9) mis va kumush ligaturalari bilan eritib, kerakli probaga (585 yoki 750) ingot quyish:
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Eritiladigan Sof Oltin 999.9 (gramm) *</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  required
                  placeholder="Masalan: 100.000"
                  value={pureGoldInput}
                  onKeyDown={preventNegativeKey}
                  onChange={(e) => {
                    const val = sanitizeNonNegative(e.target.value);
                    setPureGoldInput(val);
                    if (val && parseFloat(val) > 0) {
                      // Auto calculate ligature for 585: 100g 999.9 -> 100 / 0.585 = 170.94g total alloy (70.94g ligature)
                      const targetP = parseInt(targetPurity, 10);
                      const totalAlloy = (parseFloat(val) * 999.9) / targetP;
                      const totalLigature = totalAlloy - parseFloat(val);
                      setCopperInput((totalLigature * 0.7).toFixed(3));
                      setSilverInput((totalLigature * 0.3).toFixed(3));
                      setOutputIngot((totalAlloy * 0.998).toFixed(3));
                      setFurnaceLoss((totalAlloy * 0.002).toFixed(3));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Maqsadli Proba</label>
                  <select
                    value={targetPurity}
                    onChange={(e) => setTargetPurity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white text-xs focus:outline-none focus:border-gold-500"
                  >
                    <option value="585">585 Proba (14K)</option>
                    <option value="750">750 Proba (18K)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mis Ligatura (gr)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={copperInput}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setCopperInput(sanitizeNonNegative(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kumush Ligatura (gr)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={silverInput}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setSilverInput(sanitizeNonNegative(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Olingan Ingot Vazni (gr) *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    required
                    value={outputIngot}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setOutputIngot(sanitizeNonNegative(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pechdagi Yo'qotish (Furnace Loss)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={furnaceLoss}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setFurnaceLoss(sanitizeNonNegative(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={meltLoading}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  {meltLoading ? "Qayd etilmoqda..." : "Eritish Aktini Tasdiqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: HALLMARKING TRANSFER (Proba Palatasi Topshirish Akti) ── */}
      {activeModal === 'hallmark' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#141824] border border-luxury-border shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-luxury-border flex items-center justify-between bg-[#0f131d]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Davlat Proba Palatasi Topshirish-Qabul Akti</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleHallmarkSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Proba Palatasi Muassasasi</label>
                <input
                  type="text"
                  value={hallmarkOffice}
                  onChange={(e) => setHallmarkOffice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white text-xs focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Topshirilayotgan Buyumlar Soni</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Masalan: 12 dona"
                    value={hallmarkCount}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setHallmarkCount(sanitizeNonNegative(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jami Og'irligi (gramm)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    required
                    placeholder="Masalan: 84.500"
                    value={hallmarkWeight}
                    onKeyDown={preventNegativeKey}
                    onChange={(e) => setHallmarkWeight(sanitizeNonNegative(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0d1017] border border-luxury-border text-white font-mono text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {hallmarkSuccess && (
                <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/50 text-teal-200 text-xs flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Proba palatasi dalolatnomasi muvaffaqiyatli rasmiylashtirildi!</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  Aktni Rasmiylashtirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
