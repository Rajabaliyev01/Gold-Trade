import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';

const weeklyGoldData = [
  { day: 'Dush', berilgan: 120, olingan: 114, ugar: 1.8 },
  { day: 'Sesh', berilgan: 95, olingan: 91.5, ugar: 1.4 },
  { day: 'Chor', berilgan: 140, olingan: 134, ugar: 2.1 },
  { day: 'Pay', berilgan: 160, olingan: 153.5, ugar: 2.3 },
  { day: 'Jum', berilgan: 180, olingan: 173, ugar: 2.5 },
  { day: 'Shan', berilgan: 210, olingan: 202, ugar: 3.1 },
  { day: 'Yak', berilgan: 70, olingan: 67.5, ugar: 1.1 },
];

export const ProductionOverviewChart = () => {
  const users = useAuthStore((state) => state.users);
  const settings = useSettingsStore((state) => state.settings);
  const craftsmen = users.filter((u) => u.role === 'craftsman');

  const craftsmenUgarData = craftsmen.map((c) => ({
    name: c.name.split(' ')[0], // only first name for chart
    lossRate: c.average_loss_rate || 1.5,
    goldBalance: c.current_gold_balance || 0,
    orders: c.total_completed_orders || 0,
  }));

  const maxAllowedRate = settings.max_allowed_loss_percentage || 2.0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Gold Movement Chart */}
      <div className="rounded-2xl bg-[#141824] border border-luxury-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Haftalik Tilla Aylanmasi</h3>
            <p className="text-xs text-slate-400">Ustaxonaga berilgan va qabul qilingan tilla (grammda)</p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gold-500"></span>
              <span className="text-slate-300">Berilgan</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">Olingan</span>
            </span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyGoldData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBerilgan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorOlingan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#23293c" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} unit="g" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f131d', borderColor: '#23293c', borderRadius: '12px' }}
                itemStyle={{ color: '#fff', fontSize: '12px' }}
                formatter={(val) => [`${val} gr`, '']}
              />
              <Area type="monotone" dataKey="berilgan" name="Berilgan xomashyo" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#colorBerilgan)" />
              <Area type="monotone" dataKey="olingan" name="Tayyor mahsulot" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorOlingan)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Craftsmen Ugar (Loss Rate) Comparison */}
      <div className="rounded-2xl bg-[#141824] border border-luxury-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Ustalar Bo'yicha Ugar Me'yori (%)</h3>
            <p className="text-xs text-slate-400">Ruxsat etilgan limit: {maxAllowedRate}% (Qizil chiziq)</p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
            Limit: {maxAllowedRate}%
          </span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={craftsmenUgarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#23293c" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} unit="%" domain={[0, 4]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f131d', borderColor: '#23293c', borderRadius: '12px' }}
                itemStyle={{ color: '#fff', fontSize: '12px' }}
                formatter={(val) => [`${val}%`, "O'rtacha Ugar"]}
              />
              <ReferenceLine y={maxAllowedRate} stroke="#f43f5e" strokeDasharray="4 4" strokeWidth={2} label={{ value: `Limit (${maxAllowedRate}%)`, fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
              <Bar
                dataKey="lossRate"
                name="Ugar ko'rsatkichi"
                fill="#d4af37"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
