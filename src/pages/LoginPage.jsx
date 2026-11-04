import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import {
  Sparkles,
  User,
  Lock,
  LogIn,
  Loader2,
  AlertCircle,
  ShieldAlert,
  Mail,
  Building2,
  Compass,
  ArrowRight,
  UserPlus
} from 'lucide-react';

// Google "G" icon SVG
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.4 0 6.4 1.2 8.8 3.2l6.5-6.5C35.2 2.5 29.9 0 24 0 14.6 0 6.6 5.6 2.7 13.7l7.6 5.9C12.1 13 17.6 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-16.9z"/>
    <path fill="#FBBC05" d="M10.3 28.4A14.9 14.9 0 0 1 9.5 24c0-1.5.3-3 .8-4.4l-7.6-5.9A24 24 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.6-6.3z"/>
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.4 0-11.9-3.5-13.7-8.6l-7.6 6.3C6.6 42.4 14.6 48 24 48z"/>
  </svg>
);

export default function LoginPage() {
  const {
    signInWithGoogle,
    signInWithGoogleRedirect,
    signInFactoryWithEmail,
    registerFactoryWithEmail,
    signInAsEmployee
  } = useAuthStore();

  // Factory Owner State
  const [ownerMethod, setOwnerMethod] = useState('google'); // 'google' | 'email'
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleHangDetected, setGoogleHangDetected] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // Email / Password for Factory Owner
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [factoryName, setFactoryName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [factoryEmail, setFactoryEmail] = useState('');
  const [factoryPassword, setFactoryPassword] = useState('');
  const [factoryEmailLoading, setFactoryEmailLoading] = useState(false);
  const [factoryEmailError, setFactoryEmailError] = useState('');

  // Employee State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [empLoading, setEmpLoading] = useState(false);
  const [empError, setEmpError] = useState('');

  // Detect when Google popup might be hanging (COOP / popup blocked)
  useEffect(() => {
    let timer;
    if (googleLoading) {
      timer = setTimeout(() => {
        setGoogleHangDetected(true);
      }, 3500);
    } else {
      setGoogleHangDetected(false);
    }
    return () => clearTimeout(timer);
  }, [googleLoading]);

  // Handle Google Popup sign-in
  const handleGoogleSignIn = async () => {
    setGoogleError('');
    setGoogleLoading(true);
    setGoogleHangDetected(false);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.warn("handleGoogleSignIn catch:", err);
      setGoogleError(err.message || "Google bilan kirish muvaffaqiyatsiz bo'ldi.");
      setGoogleLoading(false);
    }
  };

  // Handle direct Google Redirect sign-in (100% immune to COOP / popup blockers)
  const handleGoogleRedirectSignIn = async () => {
    setGoogleError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogleRedirect();
    } catch (err) {
      setGoogleError(err.message || "Google yo'naltirishda xatolik yuz berdi.");
      setGoogleLoading(false);
    }
  };

  // Handle Factory Email/Password (Login or Register)
  const handleFactoryEmailSubmit = async (e) => {
    e.preventDefault();
    setFactoryEmailError('');

    const cleanEmail = factoryEmail.trim();
    if (!cleanEmail) {
      setFactoryEmailError("Email manzilingizni kiriting");
      return;
    }
    if (!factoryPassword || factoryPassword.length < 6) {
      setFactoryEmailError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setFactoryEmailLoading(true);
    try {
      if (isRegisterMode) {
        if (!factoryName.trim()) {
          setFactoryEmailError("Zavod nomini kiriting");
          setFactoryEmailLoading(false);
          return;
        }
        await registerFactoryWithEmail(cleanEmail, factoryPassword, factoryName.trim(), ownerName.trim());
      } else {
        await signInFactoryWithEmail(cleanEmail, factoryPassword);
      }
    } catch (err) {
      setFactoryEmailError(err.message || "Kirishda xatolik yuz berdi.");
    } finally {
      setFactoryEmailLoading(false);
    }
  };

  // Handle Employee Login
  const handleEmployeeSignIn = async (e) => {
    e.preventDefault();
    setEmpError('');

    const cleanUser = username.trim();
    if (!cleanUser) {
      setEmpError("Foydalanuvchi nomini (login) kiriting");
      return;
    }
    if (!password) {
      setEmpError("Parolni kiriting");
      return;
    }

    setEmpLoading(true);
    try {
      await signInAsEmployee(cleanUser, password);
    } catch (err) {
      setEmpError(err.message || "Login yoki parol xato! Qaytadan tekshiring.");
    } finally {
      setEmpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gold-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-600/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gold-500/3 blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative mb-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-gold-500 to-yellow-300 p-[2px] shadow-gold mb-4">
          <div className="w-full h-full bg-[#0b0e14] rounded-2xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-gold-400" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold tracking-widest gold-gradient-text uppercase">
          Gold Trade
        </h1>
        <span className="text-xs font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/30 mt-1">
          ERP 2.0
        </span>
        <p className="text-sm text-slate-400 mt-2">Zargarlik Ishlab Chiqarish &amp; Kassa Tizimi</p>
      </div>

      {/* Login cards */}
      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ── Left: Factory Owner (Google or Email/Password) ── */}
        <div className="bg-[#0f131d] border border-luxury-border rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-2xl">
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 mb-2">
                <Sparkles className="w-6 h-6 text-gold-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">Zavod Egasi</h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Zavod boshqaruvi uchun Google yoki Email orqali kiring
              </p>
            </div>

            {/* Toggle tabs for Owner: Google vs Email */}
            <div className="flex rounded-xl bg-[#141824] p-1 border border-luxury-border">
              <button
                type="button"
                onClick={() => {
                  setOwnerMethod('google');
                  setFactoryEmailError('');
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  ownerMethod === 'google'
                    ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Google Hisob
              </button>
              <button
                type="button"
                onClick={() => {
                  setOwnerMethod('email');
                  setGoogleError('');
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  ownerMethod === 'email'
                    ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Email &amp; Parol
              </button>
            </div>

            {/* Google error alert block */}
            {googleError && (
              <div className="w-full p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-300">Google orqali kirishda xatolik</p>
                  <p className="text-[11px] text-rose-200/90 mt-0.5 leading-relaxed">{googleError}</p>
                  <button
                    type="button"
                    onClick={handleGoogleRedirectSignIn}
                    className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 text-[11px] font-semibold transition-all"
                  >
                    <Compass className="w-3.5 h-3.5 text-gold-400" />
                    <span>To'g'ridan-to'g'ri o'tish orqali kiring (Redirect)</span>
                  </button>
                </div>
              </div>
            )}

            {/* If Google popup is hanging (>3.5s) */}
            {googleHangDetected && googleLoading && (
              <div className="w-full p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-amber-300">Google oynasi aylanib qoldimi?</p>
                    <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                      Brauzer pop-up oynani bloklagan bo'lishi mumkin. To'g'ridan-to'g'ri o'tish orqali xavfsiz kiring:
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={handleGoogleRedirectSignIn}
                    className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>To'g'ridan-to'g'ri o'tish (Redirect)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleLoading(false);
                      setGoogleHangDetected(false);
                    }}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            )}

            {/* Email error alert */}
            {factoryEmailError && (
              <div className="w-full p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-300">Xatolik</p>
                  <p className="text-[11px] text-rose-200/90 mt-0.5 leading-relaxed">{factoryEmailError}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Tab Content: GOOGLE ── */}
          {ownerMethod === 'google' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center space-x-3 py-3 px-5 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-semibold text-sm transition-all duration-200 disabled:opacity-60 shadow-lg cursor-pointer"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{googleLoading ? "Google orqali tekshirilmoqda..." : "Google bilan kirish"}</span>
              </button>

              {/* Direct Redirect fallback link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleGoogleRedirectSignIn}
                  disabled={googleLoading}
                  className="inline-flex items-center space-x-1.5 text-xs text-gold-400 hover:text-gold-300 underline underline-offset-4 cursor-pointer transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Oyna ochilmasa: To'g'ridan-to'g'ri o'tish (Redirect)</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Birinchi kirishda yangi zavod avtomatik yaratiladi
              </p>
            </div>
          )}

          {/* ── Tab Content: EMAIL & PASSWORD ── */}
          {ownerMethod === 'email' && (
            <form onSubmit={handleFactoryEmailSubmit} className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-slate-400">
                  {isRegisterMode ? "Yangi zavodni ro'yxatdan o'tkazish" : "Mavjud zavod hisobiga kirish"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setFactoryEmailError('');
                  }}
                  className="text-xs text-gold-400 hover:text-gold-300 font-semibold cursor-pointer underline"
                >
                  {isRegisterMode ? "Kirishga o'tish" : "Yangi Zavod ochish"}
                </button>
              </div>

              {isRegisterMode && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Zavod Nomi</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={factoryName}
                        onChange={(e) => setFactoryName(e.target.value)}
                        placeholder="Masalan: Toshkent Zargarlik Zavodi"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141824] border border-luxury-border text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/60"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Egasi F.I.SH</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Masalan: Javohir Rajabaliyev"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141824] border border-luxury-border text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/60"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Manzil</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={factoryEmail}
                    onChange={(e) => setFactoryEmail(e.target.value)}
                    placeholder="zavod@example.com"
                    autoComplete="email"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141824] border border-luxury-border text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/60"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Parol</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={factoryPassword}
                    onChange={(e) => setFactoryPassword(e.target.value)}
                    placeholder="Kamida 6 ta belgi"
                    autoComplete={isRegisterMode ? "new-password" : "current-password"}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141824] border border-luxury-border text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={factoryEmailLoading}
                className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-sm transition-all duration-200 disabled:opacity-60 shadow-gold-sm cursor-pointer"
              >
                {factoryEmailLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : isRegisterMode ? (
                  <UserPlus className="w-4 h-4 text-black" />
                ) : (
                  <LogIn className="w-4 h-4 text-black" />
                )}
                <span>
                  {factoryEmailLoading
                    ? "Tekshirilmoqda..."
                    : isRegisterMode
                    ? "Zavodni Ro'yxatdan O'tkazish"
                    : "Zavodga Kirish"}
                </span>
              </button>
            </form>
          )}

        </div>

        {/* ── Right: Employee Username & Password Login ── */}
        <div className="bg-[#0f131d] border border-luxury-border rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-2xl">
          <div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 mb-2">
                <User className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">Hodim Kirishi</h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Zavod bergan login va parol bilan tizimga kiring
              </p>
            </div>

            <div className="w-full border-t border-luxury-border my-4" />

            {/* Prominent Login or Password Error Block */}
            {empError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-950/50 border-2 border-rose-500/60 text-rose-200 text-xs flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-rose-950/30">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-300 text-xs">Login yoki parol noto'g'ri!</p>
                  <p className="text-[11px] text-rose-200/95 mt-0.5 leading-relaxed">{empError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleEmployeeSignIn} className="flex flex-col space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Foydalanuvchi nomi (Login)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (empError) setEmpError('');
                    }}
                    placeholder="Masalan: usta_farhod"
                    autoComplete="username"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#141824] border border-luxury-border text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Parol</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (empError) setEmpError('');
                    }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#141824] border border-luxury-border text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={empLoading}
                className="w-full mt-2 flex items-center justify-center space-x-2 py-3 px-5 rounded-xl bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-black font-bold text-sm transition-all duration-200 disabled:opacity-60 shadow-gold-sm cursor-pointer"
              >
                {empLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <LogIn className="w-4 h-4 text-black" />
                )}
                <span>{empLoading ? "Tekshirilmoqda..." : "Tizimga Kirish"}</span>
              </button>
            </form>
          </div>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Hisobingiz yo'qmi? Zavod egasiga murojaat qiling
          </p>
        </div>

      </div>

      {/* Footer */}
      <p className="relative mt-8 text-xs text-slate-600">
        © 2026 Gold Trade ERP — Zargarlik Ishlab Chiqarish &amp; Kassa Tizimi
      </p>
    </div>
  );
}
