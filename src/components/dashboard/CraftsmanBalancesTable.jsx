import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useProductionStore } from '../../store/useProductionStore';
import { formatWeight } from '../../utils/formatters';
import { Hammer, Award, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CraftsmanBalancesTable = () => {
  const users = useAuthStore((state) => state.users);
  const orders = useProductionStore((state) => state.orders);
  const craftsmen = users.filter((u) => u.role === 'craftsman');

  return (
    <div className="rounded-2xl bg-[#141824] border border-luxury-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Hammer className="w-4 h-4 text-gold-400" />
            <span>Ustalar Kesimida Oltin Qoldiqlari</span>
          </h3>
          <p className="text-xs text-slate-400">Ustalar qo'lidagi faol tilla va ugar me'yori nazorati</p>
        </div>
        <Link
          to="/craftsmen"
          className="text-xs text-gold-400 hover:text-gold-300 flex items-center space-x-1 font-medium transition-colors"
        >
          <span>Barchasini ko'rish</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-luxury-border text-slate-400 font-semibold">
              <th className="pb-3 pl-2">Usta</th>
              <th className="pb-3 text-right">Qo'lidagi Tilla</th>
              <th className="pb-3 text-center">Faol Ishlar</th>
              <th className="pb-3 text-center">Tugatilgan</th>
              <th className="pb-3 text-right pr-2">O'rtacha Ugar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-luxury-border">
            {craftsmen.map((c) => {
              const activeCount = orders.filter(
                (o) => o.craftsman_id === c.uid && (o.status === 'assigned' || o.status === 'in_progress')
              ).length;
              const isHighUgar = (c.average_loss_rate || 0) > 2.0;

              return (
                <tr key={c.uid} className="hover:bg-[#1a2030]/60 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="flex items-center space-x-2.5">
                      <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-lg object-cover border border-gold-500/20" />
                      <div>
                        <p className="font-semibold text-slate-200">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-gold-300">
                    {formatWeight(c.current_gold_balance || 0)}
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {activeCount} ta
                    </span>
                  </td>
                  <td className="py-3 text-center font-mono text-slate-300">
                    {c.total_completed_orders || 0} ta
                  </td>
                  <td className="py-3 text-right pr-2">
                    <span
                      className={`inline-flex items-center space-x-1 font-mono font-semibold px-2 py-0.5 rounded text-[11px] ${
                        isHighUgar
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isHighUgar && <AlertCircle className="w-3 h-3" />}
                      <span>{Number(c.average_loss_rate || 1.5).toFixed(2)}%</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
