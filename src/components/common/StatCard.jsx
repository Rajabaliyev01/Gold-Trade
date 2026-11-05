import React from 'react';

export const StatCard = ({
  title,
  value,
  subvalue,
  icon: Icon,
  trend,
  trendPositive = true,
  glow = false,
  badge,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-5 transition-all duration-300 hover:bg-[#1a1d29]/80 hover:border-white/20 hover:shadow-[0_8px_40px_0_rgba(212,175,55,0.15)] hover:-translate-y-1 ${
        glow ? 'border-gold-500/30 shadow-[0_8px_32px_0_rgba(212,175,55,0.12)]' : ''
      }`}
      style={{ WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-300 tracking-wide">{title}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 shadow-[0_2px_10px_0_rgba(212,175,55,0.1)]">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline space-x-2">
          <h3 className="text-2xl font-bold font-mono tracking-tight text-white">{value}</h3>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-gold-500/15 text-gold-300 border border-gold-500/30">
              {badge}
            </span>
          )}
        </div>

        {(subvalue || trend) && (
          <div className="flex items-center space-x-2 text-xs">
            {trend && (
              <span
                className={`font-semibold font-mono ${
                  trendPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {trend}
              </span>
            )}
            {subvalue && <span className="text-slate-400 font-mono text-[11px]">{subvalue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
