import React, { useState } from 'react';
import { useProductionStore } from '../../store/useProductionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatWeight, formatDate, formatDateTimeDetailed, PROBA_COLORS } from '../../utils/formatters';
import { NewOrderModal } from './NewOrderModal';
import { CraftsmanFinishModal } from './CraftsmanFinishModal';
import { ManagerQCReviewModal } from './ManagerQCReviewModal';
import { OrderTimelineModal } from './OrderTimelineModal';
import { JewelryTagModal } from './JewelryTagModal';
import { 
  Hammer, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame, 
  Scale,
  ShieldCheck,
  Tag,
  PackageCheck,
  Play,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

export const OrderList = () => {
  const { orders, startOrderWork } = useProductionStore();
  const { currentUser } = useAuthStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedOrderForFinish, setSelectedOrderForFinish] = useState(null);
  const [selectedOrderForQC, setSelectedOrderForQC] = useState(null);
  const [selectedOrderForTimeline, setSelectedOrderForTimeline] = useState(null);
  const [selectedOrderForTag, setSelectedOrderForTag] = useState(null);

  // Role checks
  const isCraftsman = currentUser?.role === 'craftsman';
  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  // Filter orders by permissions
  const relevantOrders = orders.filter((order) => {
    if (!isCraftsman) return true;
    const myUid = currentUser?.uid;
    const myId = currentUser?.id;
    const myUsername = currentUser?.username?.toLowerCase();
    const myName = currentUser?.name?.trim().toLowerCase();

    const orderCraftsmanId = (order.craftsman_id || '').toLowerCase();
    const orderCraftsmanName = (order.craftsman_name || '').trim().toLowerCase();

    const idMatches = Boolean(
      (myUid && orderCraftsmanId === myUid.toLowerCase()) ||
      (myId && orderCraftsmanId === myId.toLowerCase()) ||
      (myUsername && orderCraftsmanId === myUsername)
    );

    const nameMatches = Boolean(
      myName && orderCraftsmanName && (
        orderCraftsmanName === myName ||
        orderCraftsmanName.includes(myName) ||
        myName.includes(orderCraftsmanName)
      )
    );

    return idMatches || nameMatches;
  });

  const trimmedSearch = search.trim().toLowerCase();
  const filteredOrders = relevantOrders.filter((order) => {
    if (trimmedSearch) {
      const matchesSearch =
        (order.order_id || '').toLowerCase().includes(trimmedSearch) ||
        (order.title || '').toLowerCase().includes(trimmedSearch) ||
        (order.craftsman_name || '').toLowerCase().includes(trimmedSearch) ||
        (order.barcode || '').toLowerCase().includes(trimmedSearch);

      if (!matchesSearch) return false;
    }

    if (statusFilter === 'all') return true;
    if (statusFilter === 'alerts') return Boolean(order.alert_triggered);
    return order.status === statusFilter;
  });

  const statusConfig = {
    assigned: { label: 'Biriktirilgan', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Clock },
    in_progress: { label: 'Usta Ishlamoqda', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Hammer },
    pending_review: { label: 'Tekshiruv Kutilmoqda (QC)', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30', icon: ShieldCheck },
    completed: { label: 'Omborga Qabul Qilingan', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <Hammer className="w-5 h-5 text-gold-400" />
            <span>Ishlab Chiqarish &amp; Ugar Nazorati</span>
          </h1>
          <p className="text-xs text-slate-400">
            Zargarlarga xomashyo ajratish, topshirilgan mahsulotni milligramm aniqlikda tekshirish va omborga qabul qilish
          </p>
        </div>

        {isManagerOrAdmin && (
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-gold-500 hover:from-amber-500 hover:to-gold-400 text-black font-bold text-xs transition-all shadow-gold-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Buyurtma Biriktirish</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#12141c]/60 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
        style={{ WebkitBackdropFilter: 'blur(20px)' }}
      >
        {/* Status filters */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 text-xs">
          {[
            { id: 'all', label: 'Barchasi', count: relevantOrders.length },
            { id: 'assigned', label: 'Biriktirilgan', count: relevantOrders.filter((o) => o.status === 'assigned').length },
            { id: 'in_progress', label: 'Jarayonda', count: relevantOrders.filter((o) => o.status === 'in_progress').length },
            { id: 'pending_review', label: 'Tekshiruvda (QC)', count: relevantOrders.filter((o) => o.status === 'pending_review').length },
            { id: 'completed', label: 'Tugallangan', count: relevantOrders.filter((o) => o.status === 'completed').length },
            { id: 'alerts', label: 'Ugar Alertlari', count: relevantOrders.filter((o) => o.alert_triggered).length, isAlert: true },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-medium transition-all duration-200 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gold-500 text-black font-bold shadow-gold-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.isAlert && <Flame className="w-3.5 h-3.5 text-rose-500" />}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-300'
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
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buyurtma, usta, shtrix-kod..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0a0c12]/60 backdrop-blur-md border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/60 shadow-inner"
          />
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredOrders.length === 0 ? (
          <div
            className="p-12 text-center rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
            style={{ WebkitBackdropFilter: 'blur(20px)' }}
          >
            <Scale className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">Buyurtmalar topilmadi</p>
            <p className="text-xs text-slate-500">Qidiruv parametrlarini o'zgartiring yoki yangi buyurtma yarating.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = statusConfig[order.status] || statusConfig.assigned;
            const probaStyle = PROBA_COLORS[order.purity] || PROBA_COLORS[585];
            const isCompleted = order.status === 'completed';
            const isPendingReview = order.status === 'pending_review';
            const isInProgress = order.status === 'in_progress';
            const isAssigned = order.status === 'assigned';

            return (
              <div
                key={order.order_id}
                className={`rounded-2xl backdrop-blur-xl border p-4 transition-all duration-300 hover:bg-[#1a1d29]/80 hover:border-white/20 hover:shadow-[0_8px_40px_0_rgba(212,175,55,0.15)] hover:-translate-y-0.5 ${
                  order.alert_triggered
                    ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/20 via-[#12141c]/70 to-[#12141c]/70 shadow-[0_8px_32px_0_rgba(225,29,72,0.1)]'
                    : isPendingReview
                    ? 'border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-[#12141c]/70 to-[#12141c]/70 shadow-[0_8px_32px_0_rgba(168,85,247,0.1)]'
                    : 'border-white/10 bg-[#12141c]/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]'
                }`}
                style={{ WebkitBackdropFilter: 'blur(20px)' }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForTimeline(order)}
                        className="font-mono font-bold text-sm text-gold-400 hover:text-gold-300 underline underline-offset-2 flex items-center space-x-1 cursor-pointer"
                        title="Vaqt xaritasi va to'liq audit trailni ko'rish"
                      >
                        <span>#{order.order_id}</span>
                        <Info className="w-3.5 h-3.5 text-gold-500/80" />
                      </button>

                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${probaStyle.bg} ${probaStyle.text} ${probaStyle.border}`}>
                        {order.purity} Proba
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center space-x-1 ${statusInfo.bg}`}>
                        <span>{statusInfo.label}</span>
                      </span>

                      {order.alert_triggered && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center space-x-1">
                          <Flame className="w-3 h-3" />
                          <span>Ugar me'yordan oshdi</span>
                        </span>
                      )}

                      {order.barcode && (
                        <span className="px-2 py-0.5 rounded bg-black/40 font-mono text-[10px] text-slate-300 border border-luxury-border">
                          {order.barcode}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-sm text-slate-100">{order.title}</h3>

                    <div className="flex items-center space-x-4 text-xs text-slate-400 flex-wrap gap-y-1">
                      <span>Usta: <b className="text-slate-200">{order.craftsman_name}</b></span>
                      <span>•</span>
                      <span>Berildi: <b>{formatDate(order.assigned_at || order.created_at || order.timestamp)}</b></span>
                      {order.started_at && (
                        <>
                          <span>•</span>
                          <span>Boshlandi: <b>{formatDate(order.started_at)}</b></span>
                        </>
                      )}
                      {order.completed_by_craftsman_at && (
                        <>
                          <span>•</span>
                          <span>Bitirdi: <b>{formatDate(order.completed_by_craftsman_at)}</b></span>
                        </>
                      )}
                    </div>

                    {order.reject_reason && (
                      <p className="text-[11px] text-rose-300 italic bg-rose-950/20 p-2 rounded-lg border border-rose-500/30">
                        ⚠️ Qayta ishlash sababi: "{order.reject_reason}"
                      </p>
                    )}

                    {order.notes && (
                      <p className="text-[11px] text-slate-400 italic">"{order.notes}"</p>
                    )}
                  </div>

                  {/* Middle: Milligram Measurements */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0d1017] p-3 rounded-xl border border-luxury-border text-xs font-mono shrink-0">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Berilgan:</span>
                      <span className="font-bold text-slate-200">{formatWeight(order.given_weight)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Tayyor Mahsulot:</span>
                      <span className="font-bold text-emerald-400">
                        {order.received_weight ? formatWeight(order.received_weight) : order.craftsman_received_weight ? formatWeight(order.craftsman_received_weight) : '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Qirindi/Chang:</span>
                      <span className="font-bold text-slate-300">
                        {order.returned_scrap ? formatWeight(order.returned_scrap) : order.craftsman_returned_scrap ? formatWeight(order.craftsman_returned_scrap) : '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Ugar (Yo'qotish):</span>
                      {order.loss_weight ? (
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

                  {/* Right: Actions based on Workflow State */}
                  <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center flex-wrap gap-y-2">
                    
                    {/* ── 1. Assigned state ── */}
                    {isAssigned && (
                      <>
                        <button
                          type="button"
                          onClick={() => startOrderWork(order.order_id)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 text-blue-400" />
                          <span>Ishni Qabul Qilish va Boshlash</span>
                        </button>
                      </>
                    )}

                    {/* ── 2. In Progress state ── */}
                    {isInProgress && (
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForFinish(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-gold-400 hover:from-amber-400 hover:to-gold-300 text-black text-xs font-bold transition-all shadow-gold-sm flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Scale className="w-3.5 h-3.5 text-black" />
                        <span>Ishni Yakunlash (Topshirish)</span>
                      </button>
                    )}

                    {/* ── 3. Pending Review (QC) state ── */}
                    {isPendingReview && (
                      <>
                        {isManagerOrAdmin ? (
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForQC(order)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer animate-pulse"
                          >
                            <ShieldCheck className="w-4 h-4 text-white" />
                            <span>Tekshirish &amp; Omborga Qo'shish (QC)</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-1.5 text-xs text-purple-300 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            <span>Menejer tekshiruvini kutmoqda</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* ── 4. Completed state ── */}
                    {isCompleted && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForTag(order)}
                          className="px-3 py-1.5 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-500/40 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Tag className="w-3.5 h-3.5 text-gold-400" />
                          <span>Birka (Tag)</span>
                        </button>

                        <div className="flex items-center space-x-1.5 text-xs text-emerald-400 px-3 py-1.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Omborga kiritildi</span>
                        </div>
                      </>
                    )}

                    {/* Always visible: Timeline button */}
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForTimeline(order)}
                      className="p-1.5 rounded-xl bg-[#1e2436] hover:bg-[#28314a] text-slate-300 transition-colors"
                      title="Vaqt xaritasi va Audit jurnali"
                    >
                      <Clock className="w-4 h-4 text-slate-400" />
                    </button>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <NewOrderModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} />
      
      {/* Craftsman Finish Modal (Usta topshiruvi) */}
      {selectedOrderForFinish && (
        <CraftsmanFinishModal
          order={selectedOrderForFinish}
          isOpen={Boolean(selectedOrderForFinish)}
          onClose={() => setSelectedOrderForFinish(null)}
        />
      )}

      {/* Manager QC & Inventory Approval Modal */}
      {selectedOrderForQC && (
        <ManagerQCReviewModal
          order={selectedOrderForQC}
          isOpen={Boolean(selectedOrderForQC)}
          onClose={() => setSelectedOrderForQC(null)}
        />
      )}

      {/* Order Detailed Timeline & Audit Trail Modal */}
      {selectedOrderForTimeline && (
        <OrderTimelineModal
          order={selectedOrderForTimeline}
          isOpen={Boolean(selectedOrderForTimeline)}
          onClose={() => setSelectedOrderForTimeline(null)}
        />
      )}

      {/* Jewelry Certificate Tag Modal */}
      {selectedOrderForTag && (
        <JewelryTagModal
          order={selectedOrderForTag}
          isOpen={Boolean(selectedOrderForTag)}
          onClose={() => setSelectedOrderForTag(null)}
        />
      )}
    </div>
  );
};
