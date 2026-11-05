import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useProductionStore } from '../../store/useProductionStore';
import { formatWeight } from '../../utils/formatters';
import { ReturnWorkModal } from '../production/ReturnWorkModal';
import { AddEmployeeModal } from './AddEmployeeModal';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Hammer, 
  Store, 
  Briefcase, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Scale, 
  Sparkles,
  Phone,
  Lock,
  UserCheck,
  ShoppingBag
} from 'lucide-react';

export const EmployeeList = () => {
  const { employees, currentUser, deleteEmployee, updateEmployee } = useAuthStore();
  const { orders } = useProductionStore();

  const [activeTab, setActiveTab] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  // Role labels and badge colors
  const roleConfig = {
    craftsman: {
      label: 'Zargar Usta',
      icon: Hammer,
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    seller: {
      label: 'Sotuvchi',
      icon: ShoppingBag,
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    cashier: {
      label: 'Kassir / POS',
      icon: Store,
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    },
    manager: {
      label: 'Menejer',
      icon: Briefcase,
      badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    },
    admin: {
      label: 'Administrator',
      icon: Shield,
      badgeColor: 'bg-gold-500/15 text-gold-300 border-gold-500/30',
    },
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'craftsman') return emp.role === 'craftsman';
    if (activeTab === 'seller') return emp.role === 'seller';
    if (activeTab === 'cashier') return emp.role === 'cashier';
    if (activeTab === 'manager') return emp.role === 'manager' || emp.role === 'admin';
    return true;
  });

  // Craftsmen summary
  const craftsmen = employees.filter((e) => e.role === 'craftsman');
  const totalCraftsmenGold = craftsmen.reduce((acc, c) => acc + (c.current_gold_balance || 0), 0);

  const handleDelete = async (emp) => {
    if (!window.confirm(`Haqiqatan ham "${emp.name}" (@${emp.username}) hodimini o'chirmoqchimisiz?`)) {
      return;
    }
    setDeletingId(emp.uid);
    try {
      await deleteEmployee(emp.uid);
    } catch (err) {
      alert("Hodimni o'chirishda xatolik: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (emp) => {
    const newStatus = emp.status === false ? true : false;
    try {
      await updateEmployee(emp.uid, { status: newStatus });
    } catch (err) {
      alert("Holatni yangilashda xatolik: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <Users className="w-5 h-5 text-gold-400" />
            <span>Hodimlar Boshqaruvi va Nazorati</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Zavod hodimlarini ro'yxatga olish, login/parol biriktirish va zargarlik balansi nazorati
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-black font-bold text-xs shadow-gold-sm transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Yangi Hodim Qo'shish</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Jami Hodimlar</p>
            <p className="text-lg font-bold text-slate-100">{employees.length} nafar</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Hammer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Zargar Ustalar</p>
            <p className="text-lg font-bold text-emerald-300">{craftsmen.length} nafar</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Ustalardagi Tilla</p>
            <p className="text-lg font-bold text-gold-300 font-mono">{formatWeight(totalCraftsmenGold)}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Kassa &amp; Menejerlar</p>
            <p className="text-lg font-bold text-purple-300">
              {employees.filter((e) => e.role === 'cashier' || e.role === 'manager').length} nafar
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2 text-xs">
        {[
          { id: 'all', label: 'Barchasi', count: employees.length },
          { id: 'craftsman', label: 'Zargar Ustalar', count: craftsmen.length },
          { id: 'seller', label: 'Sotuvchilar', count: employees.filter((e) => e.role === 'seller').length },
          { id: 'cashier', label: 'Kassirlar', count: employees.filter((e) => e.role === 'cashier').length },
          { id: 'manager', label: 'Boshqaruv & Menejerlar', count: employees.filter((e) => e.role === 'manager' || e.role === 'admin').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === tab.id
                ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#12141c]/60 backdrop-blur-xl'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredEmployees.length === 0 ? (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-bold text-slate-200">Hozircha hech qanday hodim qo'shilmagan</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Zavod ustalari, kassirlari va menejerlariga tizimga kirish uchun login va parol yaratib bering.
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-black font-bold text-xs shadow-gold-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Birinchi Hodimni Qo'shish</span>
            </button>
          )}
        </div>
      ) : (
        /* Employees Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => {
            const roleInfo = roleConfig[emp.role] || roleConfig.craftsman;
            const RoleIcon = roleInfo.icon;
            const isCraftsman = emp.role === 'craftsman';

            // Active orders for this craftsman
            const activeOrders = isCraftsman
              ? orders.filter(
                  (o) => o.craftsman_id === emp.uid && (o.status === 'assigned' || o.status === 'in_progress')
                )
              : [];

            const isHighUgar = (emp.average_loss_rate || 0) > 2.0;
            const isActive = emp.status !== false;

            return (
              <div
                key={emp.uid}
                className={`rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border transition-all p-5 flex flex-col justify-between space-y-4 ${
                  isActive ? 'border-white/10 hover:border-gold-500/40' : 'border-slate-800 opacity-70'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gold-500/30 shrink-0 shadow-md"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-100 truncate">{emp.name}</h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs font-mono text-gold-400">@{emp.username}</span>
                        {emp.phone && (
                          <span className="text-[10px] text-slate-500 flex items-center space-x-0.5">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{emp.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role badge */}
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${roleInfo.badgeColor} shrink-0`}
                  >
                    <RoleIcon className="w-3 h-3" />
                    <span>{roleInfo.label}</span>
                  </span>
                </div>

                {/* Craftsman Stats (if craftsman) */}
                {isCraftsman && (
                  <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl border border-white/10 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Qo'lidagi Tilla</span>
                      <span className="font-bold text-gold-300 text-sm">
                        {formatWeight(emp.current_gold_balance || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">O'rtacha Ugar</span>
                      <span
                        className={`font-bold text-sm inline-flex items-center space-x-1 ${
                          isHighUgar ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isHighUgar && <AlertCircle className="w-3 h-3" />}
                        <span>{Number(emp.average_loss_rate || 1.5).toFixed(2)}%</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Bajarilgan Ishlar</span>
                      <span className="font-bold text-slate-200">{emp.total_completed_orders || 0} ta</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Jarayonda</span>
                      <span className="font-bold text-blue-400">{activeOrders.length} ta buyurtma</span>
                    </div>
                  </div>
                )}

                {/* Active Jobs for Craftsman */}
                {isCraftsman && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Ustaning Faol Buyurtmalari:</span>
                      <span className="text-[10px] text-slate-500">{activeOrders.length} ta</span>
                    </p>

                    {activeOrders.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-1">Hozirda faol buyurtma yo'q</p>
                    ) : (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
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
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                  {/* Status toggle */}
                  <button
                    onClick={() => handleToggleStatus(emp)}
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>{isActive ? 'Faol' : 'Nofaol'}</span>
                  </button>

                  {/* Delete button (admin & manager) */}
                  {canManage && (
                    <button
                      onClick={() => handleDelete(emp)}
                      disabled={deletingId === emp.uid}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Hodimni o'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Return Work Modal for Craftsmen */}
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
