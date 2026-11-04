import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { 
  X, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Percent, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Calendar,
  Users
} from 'lucide-react';

export const FactoryProfileModal = () => {
  const { currentUser, factory, employees, updateFactoryProfile } = useAuthStore();
  const { isProfileModalOpen, closeProfileModal } = useUIStore();

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    address: '',
    inn: '',
    allowedUgarRate: '2.0',
    description: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (factory || currentUser) {
      setFormData({
        name: factory?.name || currentUser?.name || 'Zargarlik Zavodi',
        ownerName: factory?.ownerName || currentUser?.name || '',
        phone: factory?.phone || currentUser?.phone || '',
        address: factory?.address || '',
        inn: factory?.inn || '',
        allowedUgarRate: factory?.allowedUgarRate || '2.0',
        description: factory?.description || '',
      });
    }
  }, [factory, currentUser, isProfileModalOpen]);

  if (!isProfileModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateFactoryProfile({
        name: formData.name.trim(),
        ownerName: formData.ownerName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        inn: formData.inn.trim(),
        allowedUgarRate: parseFloat(formData.allowedUgarRate) || 2.0,
        description: formData.description.trim(),
      });
      setSuccessMsg("Zavod ma'lumotlari muvaffaqiyatli saqlandi!");
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#0f131d] border border-luxury-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-luxury-border bg-[#141824] shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-gold-500 to-yellow-300 p-[1px] shadow-gold-sm">
              <div className="w-full h-full bg-[#0b0e14] rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-gold-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100">
                  {isAdmin ? "Zavod Egasi Profili" : "Foydalanuvchi Profili"}
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/30">
                  {isAdmin ? "Zavod Boshqaruvi" : currentUser?.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAdmin ? "Zavod rekvizitlari, aloqa ma'lumotlari va tizim parametrlarini boshqarish" : "Shaxsiy ma'lumotlar va hisob tafsilotlari"}
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

        {/* Form Body */}
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

          {/* Quick Stats overview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#141824] border border-luxury-border">
              <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                <span>Roli</span>
              </div>
              <p className="font-bold text-xs text-slate-200 mt-1 capitalize">
                {isAdmin ? "Zavod Egasi (Admin)" : currentUser?.role}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#141824] border border-luxury-border">
              <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Biriktirilgan Hodimlar</span>
              </div>
              <p className="font-bold text-xs text-blue-300 mt-1">
                {employees.length} nafar
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#141824] border border-luxury-border">
              <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ro'yxatdan O'tgan</span>
              </div>
              <p className="font-mono text-xs text-slate-300 mt-1">
                {factory?.createdAt ? new Date(factory.createdAt).toLocaleDateString('uz-UZ') : "Bugun"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                  disabled={!isAdmin}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masalan: Samarqand Zargarlik Zavodi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-luxury-border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 disabled:opacity-60"
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
                  disabled={!isAdmin}
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Ism Familiya"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-luxury-border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 disabled:opacity-60"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0e14] border border-luxury-border text-sm text-slate-400 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500">Google autentifikatsiyasi orqali biriktirilgan</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-gold-400" />
                  <span>Telefon Raqami</span>
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+998 90 123-45-67"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-luxury-border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 disabled:opacity-60"
                />
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
                  disabled={!isAdmin}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Toshkent sh., Shayxontohur tumani"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-luxury-border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-gold-400" />
                  <span>STIR / INN</span>
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={formData.inn}
                  onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                  placeholder="123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-luxury-border text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 disabled:opacity-60"
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
                  disabled={!isAdmin}
                  value={formData.allowedUgarRate}
                  onChange={(e) => setFormData({ ...formData, allowedUgarRate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-luxury-border text-sm font-mono text-slate-100 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 disabled:opacity-60"
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
                disabled={!isAdmin}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Zavod faoliyati, bank rekvizitlari yoki ichki tartib qoidalari..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-luxury-border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 disabled:opacity-60"
              />
            </div>

            {/* Footer Buttons */}
            {isAdmin && (
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-luxury-border">
                <button
                  type="button"
                  onClick={closeProfileModal}
                  className="px-4 py-2.5 rounded-xl border border-luxury-border text-xs font-semibold text-slate-300 hover:bg-[#141824] transition-colors"
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
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
