import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useUIStore } from '../../store/useUIStore';
import { getTranslation } from '../../utils/i18n';
import { 
  Sparkles, 
  ChevronDown,
  LogOut,
  Building2,
  Menu,
  X,
  UserCog,
  Globe
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, factory, signOut } = useAuthStore();
  const { settings } = useSettingsStore();
  const { isSidebarOpen, toggleSidebar, openProfileModal, language, setLanguage } = useUIStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const t = (section, key) => getTranslation(language, section, key);

  const roleLabels = {
    admin: { label: language === 'ru' ? 'Владелец (Админ)' : language === 'en' ? 'Factory Owner (Admin)' : 'Zavod Egasi (Admin)', color: 'bg-gold-500/20 text-gold-400 border-gold-500/40' },
    manager: { label: language === 'ru' ? 'Менеджер производства' : language === 'en' ? 'Production Manager' : 'Ishlab Chiqarish Menejeri', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
    craftsman: { label: language === 'ru' ? 'Ювелир-мастер' : language === 'en' ? 'Master Jeweler' : 'Zargar Usta', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    cashier: { label: language === 'ru' ? 'Кассир / POS' : language === 'en' ? 'Cashier / POS' : 'Kassir / POS Operator', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
    seller: { label: language === 'ru' ? 'Продавец' : language === 'en' ? 'Sales Associate' : 'Sotuvchi', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  };

  const languages = [
    { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await signOut();
  };

  return (
    <header className="h-16 border-b border-white/10 bg-[#12141c]/60 backdrop-blur-xl sticky top-0 z-30 px-3 sm:px-4 lg:px-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" style={{ WebkitBackdropFilter: 'blur(20px)' }}>
      {/* Left: Mobile Toggle + Brand & Gold Price Ticker */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleSidebar}
          aria-label="Menyuni ochish/yopish"
          className="lg:hidden p-2 rounded-xl bg-[#12141c]/60 hover:bg-[#1a1d29]/80 border border-white/10 text-gold-400 transition-colors"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-gold-500 to-yellow-300 p-[1.5px] shadow-gold shrink-0">
            <div className="w-full h-full bg-[#12141c] rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gold-400" />
            </div>
          </div>
          <div>
            <span className="font-black text-sm tracking-tight text-white flex items-center space-x-1.5">
              <span>Gold Trade</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30 font-bold">
                ERP
              </span>
            </span>
            <p className="text-[10px] text-slate-400 hidden sm:block truncate max-w-[200px]">
              {factory?.name || t('common', 'appSubtitle')}
            </p>
          </div>
        </div>

        {/* Live Gold Ticker */}
        <div className="hidden xl:flex items-center space-x-3 pl-4 border-l border-white/10 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">999:</span>
            <span className="font-mono font-bold text-gold-300">${settings.gold_rate_999 || 88.20}/g</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">750:</span>
            <span className="font-mono font-bold text-amber-300">${settings.gold_rate_750 || 66.15}/g</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">585:</span>
            <span className="font-mono font-bold text-slate-200">${settings.gold_rate_585 || 51.60}/g</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">USD:</span>
            <span className="font-mono font-bold text-emerald-400">{settings.usd_to_uzs?.toLocaleString() || '12,850'}</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Language Switcher + User Profile */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Language Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#12141c]/60 hover:bg-[#1a1d29]/80 border border-white/10 text-xs text-slate-200 transition-all cursor-pointer"
            title="Tilni o'zgartirish / Switch language"
          >
            <span className="text-sm">{currentLangObj.flag}</span>
            <span className="font-semibold hidden sm:inline">{currentLangObj.label}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLangOpen && (
            <div
              className="absolute right-0 mt-2 w-36 rounded-2xl bg-[#12141c]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setIsLangOpen(false)}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    language === lang.code
                      ? 'bg-gold-500/20 text-gold-300 font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Menu with Factory Profile & Sign Out */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 sm:space-x-2.5 p-1 sm:p-1.5 sm:pr-2.5 rounded-xl bg-[#12141c]/60 hover:bg-[#1a1d29]/80 border border-white/10 transition-all text-left cursor-pointer"
          >
            <img
              src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=d4af37&color=000`}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-lg object-cover border border-gold-500/30 shrink-0"
            />
            <div className="hidden sm:block text-xs">
              <p className="font-semibold text-slate-200 truncate max-w-[120px]">{currentUser?.name}</p>
              <p className="text-[10px] text-gold-400 capitalize">{roleLabels[currentUser?.role]?.label || currentUser?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{ WebkitBackdropFilter: 'blur(28px)' }}
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              {/* Profile Details */}
              <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                <p className="text-xs font-bold text-slate-100 truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-gold-400 mt-0.5">
                  {roleLabels[currentUser?.role]?.label || currentUser?.role}
                </p>
                {factory?.name && (
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1 truncate">
                    <Building2 className="w-3 h-3 text-gold-400 shrink-0" />
                    <span>{factory.name}</span>
                  </p>
                )}
                {currentUser?.username && (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    @{currentUser.username}
                  </p>
                )}
              </div>

              {/* Zavod Profili tugmasi */}
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  openProfileModal();
                }}
                className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-left text-xs text-slate-300 hover:bg-[#1f2638] hover:text-gold-300 transition-colors mb-1 cursor-pointer"
              >
                <UserCog className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="font-semibold">
                  {currentUser?.role === 'admin' 
                    ? (language === 'ru' ? 'Профиль фабрики' : language === 'en' ? 'Factory Profile' : 'Zavod Profili') 
                    : t('nav', 'profile')}
                </span>
              </button>

              {/* Sign out button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-left text-xs text-rose-300 hover:bg-rose-950/30 hover:text-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold">{t('nav', 'logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
