import React, { useState } from 'react';
import { useProductionStore } from '../../store/useProductionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatWeight, formatDate, PROBA_COLORS } from '../../utils/formatters';
import { NewOrderModal } from './NewOrderModal';
import { ReturnWorkModal } from './ReturnWorkModal';
import { 
  Hammer, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame, 
  ArrowRight,
  Scale
} from 'lucide-react';

export const OrderList = () => {
  const { orders, updateOrderStatus } = useProductionStore();
  const { currentUser } = useAuthStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);

  // If current user is a craftsman, only show their own orders by default (RBAC)
  const isCraftsman = currentUser?.role === 'craftsman';

  const relevantOrders = orders.filter((order) => {
    if (!isCraftsman) return true;
    const uidMatches = order.craftsman_id === currentUser?.uid;
    const usernameMatches = Boolean(currentUser?.username && order.craftsman_id === currentUser?.username);
    const nameMatches = Boolean(
      currentUser?.name &&
      order.craftsman_name &&
      order.craftsman_name.trim().toLowerCase() === currentUser.name.trim().toLowerCase()
    );
    return uidMatches || usernameMatches || nameMatches;
  });

  const filteredOrders = relevantOrders.filter((order) => {
    const matchesSearch =
      (order.order_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (order.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (order.craftsman_name || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'alerts') return order.alert_triggered;
    return order.status === statusFilter;
  });

  const statusConfig = {
    assigned: { label: 'Biriktirildi', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Clock },
    in_progress: { label: 'Jarayonda', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Hammer },
    completed: { label: 'Tugatildi', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <Hammer className="w-5 h-5 text-gold-400" />
            <span>Ishlab Chiqarish & Ugar Nazorati</span>
          </h1>
          <p className="text-xs text-slate-400">
            Zargarlarga xomashyo ajratish, topshirilgan mahsulotni milligramm aniqlikda qabul qilish
          </p>
        </div>

        {currentUser?.role !== 'craftsman' && (
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-gold-500 hover:from-amber-500 hover:to-gold-400 text-black font-bold text-xs transition-all shadow-gold-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Buyurtma Biriktirish</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#141824] p-3 rounded-2xl border border-luxury-border">
        {/* Status filters */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 text-xs">
          {[
            { id: 'all', label: 'Barchasi', count: relevantOrders.length },
            { id: 'assigned', label: 'Biriktirilgan', count: relevantOrders.filter((o) => o.status === 'assigned').length },
            { id: 'in_progress', label: 'Jarayonda', count: relevantOrders.filter((o) => o.status === 'in_progress').length },
            { id: 'completed', label: 'Tugatilgan', count: relevantOrders.filter((o) => o.status === 'completed').length },
            { id: 'alerts', label: 'Ugar Alertlari', count: relevantOrders.filter((o) => o.alert_triggered).length, isAlert: true },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 ${
                  isActive
                    ? 'bg-gold-500 text-black font-bold shadow-gold-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#1a2030]'
                }`}
              >
                {tab.isAlert && <Flame className="w-3.5 h-3.5 text-rose-500" />}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/20 text-black' : 'bg-[#1e2436] text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buyurtma, usta, mahsulot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0d1017] border border-luxury-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#141824] border border-luxury-border">
            <Scale className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Buyurtmalar topilmadi</p>
            <p className="text-xs text-slate-500">Qidiruv parametrlarini o'zgartiring yoki yangi buyurtma yarating.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = statusConfig[order.status] || statusConfig.assigned;
            const probaStyle = PROBA_COLORS[order.purity] || PROBA_COLORS[585];
            const isCompleted = order.status === 'completed';

            return (
              <div
                key={order.order_id}
                className={`rounded-2xl bg-[#141824] border transition-all p-4 hover:border-gold-500/30 ${
                  order.alert_triggered ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/10 to-[#141824]' : 'border-luxury-border'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                      <span className="font-mono font-bold text-sm text-gold-400">#{order.order_id}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${probaStyle.bg} ${probaStyle.text} ${probaStyle.border}`}>
                        {order.purity} Proba
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center space-x-1 ${statusInfo.bg}`}>
                        <span>{statusInfo.label}</span>
                      </span>

                      {order.alert_triggered && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center space-x-1">
                          <Flame className="w-3 h-3" />
                          <span>Ugar me'yordan oshdi</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-sm text-slate-100">{order.title}</h3>

                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      <span>Usta: <b className="text-slate-200">{order.craftsman_name}</b></span>
                      <span>•</span>
                      <span>Sana: {formatDate(order.timestamp)}</span>
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-slate-400 italic">"{order.notes}"</p>
                    )}
                  </div>

                  {/* Middle: Milligram Measurements */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0d1017] p-3 rounded-xl border border-luxury-border text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Berilgan:</span>
                      <span className="font-bold text-slate-200">{formatWeight(order.given_weight)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Tayyor Mahsulot:</span>
                      <span className="font-bold text-emerald-400">
                        {isCompleted ? formatWeight(order.received_weight) : '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Qirindi/Chang:</span>
                      <span className="font-bold text-slate-300">
                        {isCompleted ? formatWeight(order.returned_scrap) : '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Ugar (Yo'qotish):</span>
                      {isCompleted ? (
                        <span
                          className={`font-bold ${
                            order.alert_triggered ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {formatWeight(order.loss_weight)} ({order.loss_percentage}%)
                        </span>
                      ) : (
                        <span className="text-slate-500">Max: {order.allowed_loss_rate || 2}%</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                    {order.status === 'assigned' && (
                      <button
                        onClick={() => updateOrderStatus(order.order_id, 'in_progress')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition-colors"
                      >
                        Jarayonni Boshlash
                      </button>
                    )}

                    {(order.status === 'assigned' || order.status === 'in_progress') && (
                      <button
                        onClick={() => setSelectedOrderForReturn(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Ishni Qabul Qilish</span>
                      </button>
                    )}

                    {isCompleted && (
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-[#1a2030]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Omborga kiritildi</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <NewOrderModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
      
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
