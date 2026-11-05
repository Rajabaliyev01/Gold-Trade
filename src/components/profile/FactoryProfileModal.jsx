import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { PhoneInput } from '../common/PhoneInput';
import { formatWeight } from '../../utils/formatters';
import { 
  X, 
  Building2, 
  User, 
  Mail, 
  MapPin, 
  FileText, 
  Percent, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Calendar,
  Users,
  Hammer,
  Scale,
  Sparkles,
  Award,
  Check
} from 'lucide-react';

export const FactoryProfileModal = () => {
  const { 
    currentUser, 
    factory, 
    employees, 
    updateFactoryProfile, 
    updateOwnProfile 
  } = useAuthStore();
  const { isProfileModalOpen, closeProfileModal } = useUIStore();

  const isAdmin = currentUser?.role === 'admin';
  const isCraftsman = currentUser?.role === 'craftsman';

  // State for Admin
  const [adminForm, setAdminForm] = useState({
    name: '',
    ownerName: '',
    phone: '',
    address: '',
    inn: '',
    allowedUgarRate: '2.0',
    description: '',
  });

  // State for Employee
  const [empForm, setEmpForm] = useState({
    name: '',
    phone: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      if (isAdmin) {
        setAdminForm({
          name: factory?.name || currentUser?.name || 'Zargarlik Zavodi',
          ownerName: factory?.ownerName || currentUser?.name || '',
          phone: factory?.phone || currentUser?.phone || '',
          address: factory?.address || '',
          inn: factory?.inn || '',
          allowedUgarRate: String(factory?.allowedUgarRate || '2.0'),
          description: factory?.description || '',
        });
      } else {
        setEmpForm({
          name: currentUser?.name || '',
          phone: currentUser?.phone || '',
        });
      }
    }
  }, [factory, currentUser, isProfileModalOpen, isAdmin]);

  if (!isProfileModalOpen) return null;

  const roleLabels = {
    admin: { label: 'Zavod Egasi (Admin)', color: 'bg-gold-500/15 text-gold-300 border-gold-500/40' },
    craftsman: { label: 'Zargar Usta', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' },
    seller: { label: 'Sotuvchi', color: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
    cashier: { label: 'Kassir / POS', color: 'bg-purple-500/15 text-purple-300 border-purple-500/40' },
    manager: { label: 'Ishlab Chiqarish Menejeri', color: 'bg-blue-500/15 text-blue-300 border-blue-500/40' },
  };

  const currentRoleInfo = roleLabels[currentUser?.role] || { 
    label: currentUser?.role || 'Hodim', 
    color: 'bg-slate-700/40 text-slate-300 border-slate-600' 
  };

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      if (isAdmin) {
        await updateFactoryProfile({
          name: adminForm.name.trim(),
          ownerName: adminForm.ownerName.trim(),
          phone: adminForm.phone.trim(),
          address: adminForm.address.trim(),
          inn: adminForm.inn.trim(),
          allowedUgarRate: parseFloat(adminForm.allowedUgarRate) || 2.0,
          description: adminForm.description.trim(),
        });
        setSuccessMsg("Zavod ma'lumotlari muvaffaqiyatli saqlandi!");
      } else {
        if (!empForm.name.trim()) {
          throw new Error("Ism va familiyangizni kiriting.");
        }
        await updateOwnProfile({
          name: empForm.name.trim(),
          phone: empForm.phone.trim(),
        });
        setSuccessMsg("Shaxsiy ma'lumotlaringiz muvaffaqiyatli saqlandi!");
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with User's Real Name instead of generic title */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#141824] shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-gold-500 to-yellow-300 p-[1px] shadow-gold-sm shrink-0">
              <div className="w-full h-full bg-[#0b0e14] rounded-xl flex items-center justify-center">
                {isAdmin ? (
                  <Building2 className="w-5 h-5 text-gold-400" />
                ) : isCraftsman ? (
                  <Hammer className="w-5 h-5 text-emerald-400" />
                ) : (
                  <User className="w-5 h-5 text-gold-400" />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                {/* 2. Foydalanuvchi Profili o'rniga hodimning ismi */}
                <h2 className="text-base font-bold text-slate-100 truncate max-w-[280px] sm:max-w-md">
                  {currentUser?.name || "Profil"}
                </h2>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${currentRoleInfo.color}`}>
                  {currentRoleInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAdmin 
                  ? "Zavod rekvizitlari, aloqa ma'lumotlari va tizim parametrlarini boshqarish"
                  : `${factory?.name || 'Zargarlik Zavodi'} — Shaxsiy ma'lumotlar va hisob tafsilotlari`
                }
              </p>
            </div>
          </div>
          <button
            onClick={closeProfileModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2030] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Feedback banners */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              A. EMPLOYEE PROFILE VIEW (Craftsman, Cashier, Seller, Manager)
             ═══════════════════════════════════════════════════════════════════════ */}
          {!isAdmin && (
            <>
              {/* Craftsman Overview Stats */}
              {isCraftsman ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)]">
                    <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                      <Scale className="w-3.5 h-3.5 text-gold-400" />
                      <span>Qo'lingizdagi Tilla</span>
                    </div>
                    <p className="font-mono font-bold text-sm text-gold-300 mt-1">
                      {formatWeight(currentUser?.current_gold_balance || 0)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)]">
                    <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                      <Percent className="w-3.5 h-3.5 text-emerald-400" />
                      <span>O'rtacha Ugar Me'yori</span>
                    </div>
                    <p className="font-mono font-bold text-sm text-emerald-400 mt-1">
                      {Number(currentUser?.average_loss_rate || 1.5).toFixed(2)}%
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)]">
                    <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                      <Award className="w-3.5 h-3.5 text-blue-400" />
                      <span>Bajarilgan Buyurtmalar</span>
                    </div>
                    <p className="font-mono font-bold text-sm text-blue-300 mt-1">
                      {currentUser?.total_completed_orders || 0} ta
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)]">
                    <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-gold-400" />
                      <span>Biriktirilgan Zavod</span>
                    </div>
                    <p className="font-bold text-xs text-slate-200 mt-1">
                      {factory?.name || "Zargarlik Zavodi"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)]">
                    <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Hisob Holati</span>
                    </div>
                    <p className="font-semibold text-xs text-emerald-400 mt-1 flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      <span>Faol Xodim</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Employee Editable Form */}
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-gold-400" />
                      <span>Ism va Familiya</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={empForm.name}
                      onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                      placeholder="Masalan: Farhod Zargariy"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30"
                    />
                  </div>

                  {/* Username (Login) - Readonly badge */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                      <span className="text-gold-400 font-mono">@</span>
                      <span>Foydalanuvchi Nomi (Login)</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser?.username ? `@${currentUser.username}` : '@hodim'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-mono text-gold-400 cursor-not-allowed select-all"
                    />
                    <p className="text-[10px] text-slate-500">Tizimga kirish uchun biriktirilgan unikal login</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone with non-deletable +998 and format */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Telefon Raqami
                    </label>
                    <PhoneInput
                      value={empForm.phone}
                      onChange={(val) => setEmpForm({ ...empForm, phone: val })}
                      placeholder="90 123 45 67"
                    />
                    <p className="text-[10px] text-slate-500">
                      Raqamni kiriting (masalan: 90 123 45 67)
                    </p>
                  </div>

                  {/* Factory name (Readonly) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ishlaydigan Zavodingiz</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={factory?.name || "Zargarlik Zavodi"}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Submit button for employee */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={closeProfileModal}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-[#141824] transition-colors"
                  >
                    Yopish
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-black font-bold text-xs shadow-gold-sm transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Save className="w-4 h-4 text-black" />
                    )}
                    <span>{saving ? 'Saqlanmoqda...' : 'Ma\'lumotlarimni Saqlash'}</span>
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              B. FACTORY OWNER PROFILE VIEW (Admin)
             ═══════════════════════════════════════════════════════════════════════ */}
          {isAdmin && (
            <>
              {/* Quick Stats overview cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)]">
                  <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                    <span>Roli</span>
                  </div>
                  <p className="font-bold text-xs text-slate-200 mt-1">
                    Bosh Administrator (Zavod Egasi)
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)]">
                  <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>Jami Hodimlar</span>
                  </div>
                  <p className="font-bold text-xs text-blue-300 mt-1">
                    {employees.length} nafar
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)]">
                  <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ro'yxatdan O'tgan</span>
                  </div>
                  <p className="font-mono text-xs text-slate-300 mt-1">
                    {factory?.createdAt ? new Date(factory.createdAt).toLocaleDateString('uz-UZ') : "Bugun"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                {/* Factory Name & Owner Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-gold-400" />
                      <span>Zavod Nomi</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adminForm.name}
                      onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                      placeholder="Masalan: Samarqand Zargarlik Zavodi"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-gold-400" />
                      <span>Zavod Egasi (F.I.SH)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adminForm.ownerName}
                      onChange={(e) => setAdminForm({ ...adminForm, ownerName: e.target.value })}
                      placeholder="Ism Familiya"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email (Google Hisob)</span>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={currentUser?.email || ''}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-400 cursor-not-allowed select-all"
                    />
                    <p className="text-[10px] text-slate-500">Google autentifikatsiyasi orqali biriktirilgan</p>
                  </div>

                  {/* Phone with non-deletable +998 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Telefon Raqami
                    </label>
                    <PhoneInput
                      value={adminForm.phone}
                      onChange={(val) => setAdminForm({ ...adminForm, phone: val })}
                      placeholder="90 123 45 67"
                    />
                    <p className="text-[10px] text-slate-500">
                      Raqamni kiriting (masalan: 90 123 45 67)
                    </p>
                  </div>
                </div>

                {/* Address & INN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-gold-400" />
                      <span>Zavod Manzili</span>
                    </label>
                    <input
                      type="text"
                      value={adminForm.address}
                      onChange={(e) => setAdminForm({ ...adminForm, address: e.target.value })}
                      placeholder="Toshkent sh., Shayxontohur tumani"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-gold-400" />
                      <span>STIR / INN</span>
                    </label>
                    <input
                      type="text"
                      value={adminForm.inn}
                      onChange={(e) => setAdminForm({ ...adminForm, inn: e.target.value })}
                      placeholder="123456789"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)] text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30"
                    />
                  </div>
                </div>

                {/* Allowed Ugar Rate */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                    <Percent className="w-3.5 h-3.5 text-gold-400" />
                    <span>Standart Ruxsat Etilgan Ugar Me'yori (%)</span>
                  </label>
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10.0"
                      value={adminForm.allowedUgarRate}
                      onChange={(e) => setAdminForm({ ...adminForm, allowedUgarRate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)] text-sm font-mono text-slate-100 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-gold-400 font-bold">%</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Ishlab chiqarish jarayonida ushbu me'yordan oshgan ugar avtomatik xavfli qizil ogohlantirishga tushadi.
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Zavod Haqida Qo'shimcha Izoh / Tavsif
                  </label>
                  <textarea
                    rows="2"
                    value={adminForm.description}
                    onChange={(e) => setAdminForm({ ...adminForm, description: e.target.value })}
                    placeholder="Zavod faoliyati, bank rekvizitlari yoki ichki tartib qoidalari..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30"
                  />
                </div>

                {/* Footer Buttons for Admin */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={closeProfileModal}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-[#141824] transition-colors"
                  >
                    Yopish
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-black font-bold text-xs shadow-gold-sm transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Save className="w-4 h-4 text-black" />
                    )}
                    <span>{saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni Saqlash'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
