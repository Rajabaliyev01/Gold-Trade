import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { usePosStore } from '../../store/usePosStore';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useProductionStore } from '../../store/useProductionStore';
import { sendTelegramMessage, formatDailyReportMessage } from '../../services/telegramService';
import { 
  Sparkles, 
  Send, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck, 
  ChevronDown,
  Coins
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, users, setCurrentUser } = useAuthStore();
  const { settings } = useSettingsStore();
  const transactions = usePosStore((state) => state.transactions);
  const getVaultSummary = useInventoryStore((state) => state.getVaultSummary);
  const orders = useProductionStore((state) => state.orders);

  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportFeedback, setReportFeedback] = useState(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

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
    admin: { label: 'Bosh Administrator', color: 'bg-gold-500/20 text-gold-400 border-gold-500/40' },
    manager: { label: 'Ishlab Chiqarish Menejeri', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
    craftsman: { label: 'Zargar Usta', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    cashier: { label: 'Kassir / POS Operator', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
  };

  return (
    <header className="h-16 border-b border-luxury-border bg-[#0f131d]/90 backdrop-blur sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between">
      {/* Left: Brand & Gold Price Ticker */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-gold-500 to-yellow-300 p-[1px] shadow-gold-sm">
            <div className="w-full h-full bg-[#0b0e14] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gold-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-wider gold-gradient-text uppercase">Gold Trade</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/30">
                ERP 2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Zargarlik Ishlab Chiqarish & Kassa Tizimi</p>
          </div>
        </div>

        {/* Live Gold Rate mini pill */}
        <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-[#141824] border border-luxury-border text-xs">
          <Coins className="w-4 h-4 text-gold-400" />
          <div className="flex items-center space-x-3 font-mono">
            <span><span className="text-slate-400">999:</span> <b className="text-gold-300">${settings.gold_rate_999}/g</b></span>
            <span className="text-slate-600">|</span>
            <span><span className="text-slate-400">585:</span> <b className="text-amber-400">${settings.gold_rate_585}/g</b></span>
            <span className="text-slate-600">|</span>
            <span><span className="text-slate-400">1$ =</span> <b className="text-slate-300">{Number(settings.usd_to_uzs).toLocaleString()}</b></span>
          </div>
        </div>
      </div>

      {/* Right: Actions & User profile */}
      <div className="flex items-center space-x-3">
        {/* Telegram Z-Report Button */}
        {currentUser?.role === 'admin' && (
          <button
            onClick={handleSendDailyReport}
            disabled={isSendingReport}
            title="Kassa kunlik hisobotini Telegramga yuborish"
            className="flex items-center space-x-2 text-xs font-medium px-3 py-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 transition-all duration-200"
          >
            <Send className={`w-3.5 h-3.5 ${isSendingReport ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Kunlik Z-Hisobot</span>
          </button>
        )}

        {/* Feedback alert toast */}
        {reportFeedback && (
          <div className={`fixed bottom-6 right-6 z-50 p-3 rounded-lg border text-xs shadow-xl flex items-center space-x-2 backdrop-blur-md ${
            reportFeedback.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200' 
              : 'bg-slate-900/90 border-gold-500/40 text-gold-200'
          }`}>
            {reportFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-gold-400" />}
            <span>{reportFeedback.text}</span>
          </div>
        )}

        {/* Role Switcher Dropdown (Demo & Multi-Role Testing) */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-xl bg-[#141824] hover:bg-[#1a2030] border border-luxury-border transition-colors text-left"
          >
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-lg object-cover border border-gold-500/30"
            />
            <div className="hidden lg:block text-xs">
              <p className="font-semibold text-slate-200 truncate max-w-[130px]">{currentUser?.name}</p>
              <p className="text-[10px] text-gold-400 capitalize">{roleLabels[currentUser?.role]?.label || currentUser?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-72 rounded-xl bg-[#141824] border border-luxury-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setIsRoleDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-luxury-border mb-1">
                <p className="text-xs font-semibold text-slate-200">Foydalanuvchini almashtirish</p>
                <p className="text-[10px] text-slate-400">Turli rollarni (Admin, Usta, Kassir) test qilish</p>
              </div>

              <div className="space-y-1">
                {users.map((user) => {
                  const isSelected = user.uid === currentUser?.uid;
                  return (
                    <button
                      key={user.uid}
                      onClick={() => {
                        setCurrentUser(user);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg text-left text-xs transition-colors ${
                        isSelected ? 'bg-gold-500/10 border border-gold-500/30 text-gold-300' : 'hover:bg-[#1f2638] text-slate-300'
                      }`}
                    >
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-md object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <span className="text-[10px] text-slate-400 capitalize">{roleLabels[user.role]?.label || user.role}</span>
                      </div>
                      {isSelected && <UserCheck className="w-4 h-4 text-gold-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
