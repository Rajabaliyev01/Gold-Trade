import React from 'react';
import { formatWeight, formatDateTimeDetailed, formatDate, PROBA_COLORS } from '../../utils/formatters';
import {
  X,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Hammer,
  PackageCheck,
  Flame,
  ArrowRight,
  Boxes,
  FileText
} from 'lucide-react';

export const OrderTimelineModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const probaStyle = PROBA_COLORS[order.purity] || PROBA_COLORS[585];

  // Stage steps definitions
  const steps = [
    {
      key: 'assigned',
      title: '1. Ustaga Biriktirildi',
      subtitle: 'Xomashyo ajratildi',
      time: order.assigned_at || order.created_at || order.timestamp,
      isDone: Boolean(order.assigned_at || order.created_at || order.timestamp),
      icon: Calendar,
      color: 'blue',
    },
    {
      key: 'started',
      title: '2. Usta Boshladi',
      subtitle: 'Jarayonga olindi',
      time: order.started_at,
      isDone: Boolean(order.started_at),
      icon: Hammer,
      color: 'amber',
    },
    {
      key: 'submitted',
      title: '3. Usta Yakunladi',
      subtitle: 'Tekshiruvga topshirildi',
      time: order.completed_by_craftsman_at || order.submitted_at,
      isDone: Boolean(order.completed_by_craftsman_at || order.submitted_at),
      icon: Clock,
      color: 'purple',
    },
    {
      key: 'reviewed',
      title: '4. Menejer Tekshirdi',
      subtitle: 'QC Sifat Nazorati',
      time: order.reviewed_at,
      isDone: Boolean(order.reviewed_at),
      icon: ShieldCheck,
      color: 'teal',
    },
    {
      key: 'in_stock',
      title: '5. Omborga Qo\'shildi',
      subtitle: 'Sotuvga tayyor',
      time: order.added_to_inventory_at,
      isDone: Boolean(order.added_to_inventory_at || (order.status === 'completed' && order.completed_at)),
      icon: PackageCheck,
      color: 'emerald',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-2xl bg-[#12141c]/90 backdrop-blur-2xl border border-white/15 shadow-[0_24px_64px_0_rgba(0,0,0,0.6)] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400 border border-gold-500/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white">Buyurtma Tarixi &amp; Vaqt Xaritasi (Audit Trail)</h2>
                <span className="font-mono font-bold text-xs text-gold-400">#{order.order_id}</span>
                <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold border ${probaStyle.bg} ${probaStyle.text} ${probaStyle.border}`}>
                  {order.purity} Proba
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {order.title} • Usta: <b className="text-slate-200">{order.craftsman_name}</b>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f2638] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Visual Step Progression Bar */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
              Jarayon Bosqichlari va Vaqtlar
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
              {steps.map((step, idx) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={step.key}
                    className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition-all ${
                      step.isDone
                        ? 'bg-gradient-to-b from-[#182030] to-[#0f1420] border-gold-500/40'
                        : 'bg-[#10141e]/50 border-white/10 opacity-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${
                        step.isDone
                          ? 'bg-gold-500/20 text-gold-300 border border-gold-500/50 shadow-sm'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {step.isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <IconComponent className="w-4 h-4" />}
                    </div>

                    <span className="font-bold text-slate-200 text-[11px] line-clamp-1">{step.title}</span>
                    <span className="text-[10px] text-slate-400">{step.subtitle}</span>

                    <span className="mt-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/40 text-gold-400 border border-white/10">
                      {step.isDone ? formatDateTimeDetailed(step.time) : "Bajarilmagan"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Timestamps Detailed Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-blue-400" />
                <span>Ustaga Yuborilgan Vaqt:</span>
              </span>
              <p className="font-mono font-bold text-xs text-blue-300">
                {formatDateTimeDetailed(order.assigned_at || order.created_at || order.timestamp)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                <Hammer className="w-3 h-3 text-amber-400" />
                <span>Usta Ishni Boshlagan Vaqt:</span>
              </span>
              <p className="font-mono font-bold text-xs text-amber-300">
                {formatDateTimeDetailed(order.started_at)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-purple-400" />
                <span>Usta Bitirgan Vaqt:</span>
              </span>
              <p className="font-mono font-bold text-xs text-purple-300">
                {formatDateTimeDetailed(order.completed_by_craftsman_at || order.submitted_at)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-teal-400" />
                <span>Menejer Tekshirgan Vaqt:</span>
              </span>
              <p className="font-mono font-bold text-xs text-teal-300">
                {formatDateTimeDetailed(order.reviewed_at)}
              </p>
              {order.reviewed_by?.name && (
                <span className="text-[10px] text-slate-400 block">Mas'ul: {order.reviewed_by.name}</span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1 md:col-span-2">
              <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                <PackageCheck className="w-3 h-3 text-emerald-400" />
                <span>Omborga Qo'shilgan Vaqt &amp; Shtrix-kod:</span>
              </span>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-mono font-bold text-xs text-emerald-300">
                  {formatDateTimeDetailed(order.added_to_inventory_at || (order.status === 'completed' && order.completed_at))}
                </p>
                {order.barcode && (
                  <span className="px-2 py-0.5 rounded bg-black/40 font-mono text-[11px] text-gold-400 border border-gold-500/30">
                    Shtrix: {order.barcode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Full Chronological Timeline Log */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-slate-200 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gold-400" />
              <span>Batafsil Tarixiy Voqealar Jurnali (Firestore Logs)</span>
            </h3>

            {(!order.timeline || order.timeline.length === 0) ? (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-slate-500 text-xs">
                Ushbu buyurtma bo'yicha qo'shimcha hodisalar qayd etilmagan.
              </div>
            ) : (
              <div className="space-y-2">
                {order.timeline.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start space-x-3 transition-colors hover:border-gold-500/30"
                  >
                    <div className="w-6 h-6 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-gold-400">{index + 1}</span>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-slate-200 text-xs">{item.action}</span>
                        <span className="font-mono text-[11px] text-gold-400/90 shrink-0">
                          {formatDateTimeDetailed(item.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                        {item.user_name && (
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3 text-slate-500" />
                            <span>Bajaruvchi: <b className="text-slate-300">{item.user_name}</b></span>
                          </span>
                        )}
                      </div>

                      {item.details && (
                        <p className="text-[11px] text-slate-400 bg-black/30 p-2 rounded-lg font-mono border border-white/10/60 mt-1">
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end shrink-0 bg-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
