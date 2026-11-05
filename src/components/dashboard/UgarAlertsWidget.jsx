import React from 'react';
import { useProductionStore } from '../../store/useProductionStore';
import { formatWeight, formatCurrency, formatDate } from '../../utils/formatters';
import { AlertTriangle, Flame, Send, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UgarAlertsWidget = () => {
  const orders = useProductionStore((state) => state.orders);
  const alertOrders = orders.filter((o) => o.alert_triggered);

  if (alertOrders.length === 0) {
    return (
      <div
        className="rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-5 transition-all duration-300 hover:border-white/20"
        style={{ WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center space-x-2 text-emerald-400 mb-2">
          <CheckCircle2 className="w-5 h-5" />
          <h3 className="text-sm font-bold">Ugar Me'yori Nazorati</h3>
        </div>
        <p className="text-xs text-slate-400">
          Barcha buyurtmalarda yo'qotishlar (ugar) ruxsat etilgan limit (2%) ichida. Ogohlantirishlar mavjud emas.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl bg-gradient-to-br from-rose-950/30 via-[#12141c]/70 to-[#12141c]/70 backdrop-blur-xl border border-rose-500/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-5 transition-all duration-300 hover:border-rose-500/60"
      style={{ WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
            <Flame className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Ugar Me'yordan Oshgan Buyurtmalar</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-black font-bold">
                {alertOrders.length} Alert
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Telegram bot orqali rahbariyatga xabarnoma yuborilgan</p>
          </div>
        </div>

        <Link to="/production" className="text-xs text-rose-400 hover:text-rose-300 font-medium">
          Tafsilotlar
        </Link>
      </div>

      <div className="space-y-3">
        {alertOrders.map((order) => (
          <div
            key={order.order_id}
            className="p-3.5 rounded-xl bg-[#0c0f17] border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-rose-300">#{order.order_id}</span>
                <span className="text-slate-400">•</span>
                <span className="font-medium text-slate-200">{order.craftsman_name}</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px]">
                  {order.purity}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{order.title}</p>
            </div>

            <div className="flex items-center space-x-4 shrink-0 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">Haqiqiy Ugar</span>
                <span className="font-bold text-rose-400">
                  {formatWeight(order.loss_weight)} ({order.loss_percentage}%)
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">Ortiqcha Zarar</span>
                <span className="font-bold text-amber-400">
                  {formatCurrency(order.financial_damage || (order.excess_loss * 75))}
                </span>
              </div>

              <div className="flex items-center space-x-1 px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px]">
                <Send className="w-3 h-3" />
                <span>Yuborildi</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
