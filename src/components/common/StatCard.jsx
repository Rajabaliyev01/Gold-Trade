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
      className={`relative overflow-hidden rounded-2xl bg-[#141824] border border-luxury-border p-5 transition-all duration-200 hover:border-gold-500/40 hover:-translate-y-0.5 ${
        glow ? 'shadow-gold-glow border-gold-500/30' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline space-x-2">
          <h3 className="text-2xl font-bold font-mono tracking-tight text-white">{value}</h3>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-gold-500/10 text-gold-400 border border-gold-500/30">
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
            {subvalue && <span className="text-slate-400">{subvalue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
