import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { usePosStore } from '../../store/usePosStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useProductionStore } from '../../store/useProductionStore';
import { useUIStore } from '../../store/useUIStore';
import { sendTelegramMessage, formatDailyReportMessage } from '../../services/telegramService';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  LogOut,
  Building2,
  Menu,
  X,
  UserCog
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, factory, signOut } = useAuthStore();
  const { settings } = useSettingsStore();
  const { isSidebarOpen, toggleSidebar, openProfileModal } = useUIStore();
  const transactions = usePosStore((state) => state.transactions);
  const getVaultSummary = useInventoryStore((state) => state.getVaultSummary);
  const orders = useProductionStore((state) => state.orders);

  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportFeedback, setReportFeedback] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Send Daily Z-Report to Telegram
  const handleSendDailyReport = async () => {
    setIsSendingReport(true);
    setReportFeedback(null);

    const vault = getVaultSummary();
    const today = new Date().toISOString().slice(0, 10);
    const todayTxs = transactions.filter((t) => t.timestamp && t.timestamp.startsWith(today));

    const totalSalesUSD = todayTxs.reduce((sum, t) => sum + (t.total_amount || 0), 0);
    const cashTotal = todayTxs.filter((t) => t.payment_method === 'cash').reduce((sum, t) => sum + t.total_amount, 0);
    const cardTotal = todayTxs.filter((t) => t.payment_method === 'card').reduce((sum, t) => sum + t.total_amount, 0);
    
    let tradeInGoldGrams = 0;
    let tradeInValue = 0;
    todayTxs.forEach((t) => {
      if (t.trade_in) {
        tradeInGoldGrams += t.trade_in.old_gold_weight || 0;
        tradeInValue += t.trade_in.trade_in_value || 0;
      }
    });

    const totalLossGrams = orders
      .filter((o) => o.status === 'completed' && o.completed_at && o.completed_at.startsWith(today))
      .reduce((sum, o) => sum + (o.loss_weight || 0), 0);

    const reportMessage = formatDailyReportMessage({
      totalSalesUSD,
      totalSalesUZS: totalSalesUSD * (settings.usd_to_uzs || 12850),
      cashTotal,
      cardTotal,
      tradeInGoldGrams,
      tradeInValue,
      vaultGoldGrams: vault.totalWeight,
      ordersCount: todayTxs.length,
      totalLossGrams,
    });

    const res = await sendTelegramMessage({
      token: settings.telegram_bot_token,
      chatId: settings.telegram_chat_id,
      text: reportMessage,
    });

    setIsSendingReport(false);
    if (res.success) {
      setReportFeedback({ type: 'success', text: "Kunlik Z-Hisobot Telegramga muvaffaqiyatli jo'natildi!" });
    } else {
      setReportFeedback({ 
        type: 'info', 
        text: res.isSimulation 
          ? "Simulyatsiya: Telegram Bot token ulanmagan. Sozlamalardan ulab oling." 
          : `Xatolik: ${res.error}` 
      });
    }

    setTimeout(() => setReportFeedback(null), 5000);
  };

  const roleLabels = {
    admin: { label: 'Zavod Egasi (Admin)', color: 'bg-gold-500/20 text-gold-400 border-gold-500/40' },
    manager: { label: 'Ishlab Chiqarish Menejeri', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
    craftsman: { label: 'Zargar Usta', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    cashier: { label: 'Kassir / POS Operator', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
    seller: { label: 'Sotuvchi', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  };

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
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-gold-500 to-yellow-300 p-[1px] shadow-gold-sm shrink-0">
            <div className="w-full h-full bg-[#0b0e14] rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-wider gold-gradient-text uppercase">Gold Trade</span>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/30">
                ERP 2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              {factory?.name || "Zargarlik Ishlab Chiqarish & Kassa Tizimi"}
            </p>
          </div>
        </div>

        {/* Live Gold Ticker widget in Header (Desktop) */}
        <div className="hidden xl:flex items-center space-x-4 px-3 py-1.5 rounded-xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 text-xs font-mono shadow-[0_4px_16px_0_rgba(0,0,0,0.25)]">
          <div className="flex items-center space-x-2 text-slate-300">
            <span><span className="text-slate-400">999:</span> <b className="text-gold-300">${settings.gold_rate_999 || '—'}/g</b></span>
            <span className="text-slate-600">|</span>
            <span><span className="text-slate-400">585:</span> <b className="text-amber-400">${settings.gold_rate_585 || '—'}/g</b></span>
            <span className="text-slate-600">|</span>
            <span><span className="text-slate-400">1$ =</span> <b className="text-slate-300">{settings.usd_to_uzs ? Number(settings.usd_to_uzs).toLocaleString() : '—'}</b></span>
          </div>
        </div>
      </div>

      {/* Right: Actions & User profile */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Telegram Z-Report Button */}
        {currentUser?.role === 'admin' && (
          <button
            onClick={handleSendDailyReport}
            disabled={isSendingReport}
            title="Kassa kunlik hisobotini Telegramga yuborish"
            className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-medium px-2.5 sm:px-3 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 transition-all duration-200"
          >
            <Send className={`w-3.5 h-3.5 ${isSendingReport ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Kunlik Z-Hisobot</span>
          </button>
        )}

        {/* Feedback alert toast */}
        {reportFeedback && (
          <div className={`fixed bottom-6 right-6 z-50 p-3 rounded-xl border text-xs shadow-2xl flex items-center space-x-2 backdrop-blur-xl ${
            reportFeedback.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' 
              : 'bg-[#12141c]/90 border-gold-500/40 text-gold-200'
          }`} style={{ WebkitBackdropFilter: 'blur(20px)' }}>
            {reportFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-gold-400" />}
            <span>{reportFeedback.text}</span>
          </div>
        )}

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
                  {currentUser?.role === 'admin' ? "Zavod Profili & Sozlamalar" : "Mening Profilim"}
                </span>
              </button>

              {/* Sign out button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-left text-xs text-rose-300 hover:bg-rose-950/30 hover:text-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold">Tizimdan chiqish</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
