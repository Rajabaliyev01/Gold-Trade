import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useProductionStore } from '../../store/useProductionStore';
import { formatWeight, PROBA_COLORS } from '../../utils/formatters';
import { ReturnWorkModal } from '../production/ReturnWorkModal';
import { 
  Users, 
  Hammer, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  Flame, 
  Clock,
  Scale
} from 'lucide-react';

export const CraftsmenList = () => {
  const { users } = useAuthStore();
  const { orders } = useProductionStore();
  const craftsmen = users.filter((u) => u.role === 'craftsman');

  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2.5">
          <Users className="w-5 h-5 text-gold-400" />
          <span>Ustalar va Oltin Balansi Nazorati</span>
        </h1>
        <p className="text-xs text-slate-400">
          Har bir ustaning qo'lidagi tilla qoldig'i, o'rtacha ugar koeffitsiyenti va bajarayotgan ishlari
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {craftsmen.map((c) => {
          const activeOrders = orders.filter(
            (o) => o.craftsman_id === c.uid && (o.status === 'assigned' || o.status === 'in_progress')
          );
          const isHighUgar = (c.average_loss_rate || 0) > 2.0;

          return (
            <div
              key={c.uid}
              className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4 hover:border-gold-500/40 transition-all flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center space-x-3.5">
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-gold-500/30 shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-slate-100 truncate">{c.name}</h3>
                  <p className="text-xs text-gold-400 font-medium">{c.phone}</p>
                  <p className="text-[10px] text-slate-500">{c.email}</p>
                </div>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl border border-white/10 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Qo'lidagi Tilla</span>
                  <span className="font-bold text-gold-300 text-sm">{formatWeight(c.current_gold_balance || 0)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">O'rtacha Ugar</span>
                  <span
                    className={`font-bold text-sm inline-flex items-center space-x-1 ${
                      isHighUgar ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {isHighUgar && <AlertCircle className="w-3 h-3" />}
                    <span>{Number(c.average_loss_rate || 1.5).toFixed(2)}%</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Bajarilgan Ishlar</span>
                  <span className="font-bold text-slate-200">{c.total_completed_orders || 0} ta</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Faol Jarayonda</span>
                  <span className="font-bold text-blue-400">{activeOrders.length} ta buyurtma</span>
                </div>
              </div>

              {/* Active Jobs List */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Ustaning Faol Buyurtmalari:</span>
                  <span className="text-[10px] text-slate-500">{activeOrders.length} ta</span>
                </p>

                {activeOrders.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic py-1">Hozirda faol buyurtma yo'q</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {activeOrders.map((order) => (
                      <div
                        key={order.order_id}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-200 truncate">{order.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            #{order.order_id} • {order.purity} • {formatWeight(order.given_weight)}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedOrderForReturn(order)}
                          className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold shrink-0 transition-colors"
                        >
                          Qabul Qilish
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrderForReturn && (
        <ReturnWorkModal
          order={selectedOrderForReturn}
          isOpen={Boolean(selectedOrderForReturn)}
          onClose={() => setSelectedOrderForReturn(null)}
        />
      )}
    </div>
  );
};
