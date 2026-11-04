import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  X, 
  UserPlus, 
  User, 
  Lock, 
  Phone, 
  Briefcase, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

export const AddEmployeeModal = ({ isOpen, onClose }) => {
  const { createEmployee } = useAuthStore();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('craftsman');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError("Hodimning ism-familiyasini kiriting.");
      return;
    }
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUser) {
      setError("Foydalanuvchi nomini to'g'ri kiriting (faqat lotin harflari va raqamlar).");
      return;
    }
    if (!password || password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    setLoading(true);
    try {
      await createEmployee({
        name: name.trim(),
        username: cleanUser,
        password,
        role,
        phone: phone.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || "Hodim qo'shishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[#0f131d] border border-luxury-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-luxury-border bg-[#141824]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Yangi Hodim Qo'shish</h2>
              <p className="text-xs text-slate-400">Hodimga tizimga kirish uchun login va parol biriktirish</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2030] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start space-x-2 p-3 rounded-lg bg-rose-900/20 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Full name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Ism va Familiya <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Farhod Zargariy"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#141824] border border-luxury-border text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30"
              />
            </div>
          </div>

          {/* Username & Phone in grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Foydalanuvchi Nomi (Login) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-gold-400">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="farhod_zargar"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#141824] border border-luxury-border text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30"
                />
              </div>
              <p className="text-[10px] text-slate-500">Lotin harflari, raqamlar, pastki chiziq</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Telefon Raqami</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123-45-67"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#141824] border border-luxury-border text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Parol <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#141824] border border-luxury-border text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Hodim ushbu login va parol bilan tizimga kiradi</p>
          </div>

          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Briefcase className="w-3.5 h-3.5 text-gold-400" />
              <span>Vazifasi (Roli)</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'craftsman', label: 'Zargar Usta', desc: 'Ishlab chiqarish & ugar nazorati' },
                { id: 'seller', label: 'Sotuvchi', desc: 'Tayyor mahsulotlar savdosi & xaridorlar' },
                { id: 'cashier', label: 'Kassir / POS', desc: 'Savdo va kassa terminali' },
                { id: 'manager', label: 'Menejer', desc: 'Ombor & buyurtmalar boshqaruvi' },
                { id: 'admin', label: 'Administrator', desc: "To'liq boshqaruv huquqlari" },
              ].map((r) => (
                <label
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`p-3 rounded-xl border cursor-pointer text-left transition-all ${
                    role === r.id
                      ? 'bg-gold-500/15 border-gold-500 text-gold-200 shadow-gold-sm'
                      : 'bg-[#141824] border-luxury-border text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <p className="font-semibold text-xs text-slate-100">{r.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{r.desc}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-luxury-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-luxury-border text-xs font-semibold text-slate-300 hover:bg-[#141824] transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-black font-bold text-xs shadow-gold-sm transition-all disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Hodimni Saqlash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
