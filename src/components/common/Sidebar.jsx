import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useProductionStore } from '../../store/useProductionStore';
import { useUIStore } from '../../store/useUIStore';
import { 
  LayoutDashboard, 
  Hammer, 
  Boxes, 
  Store, 
  Users, 
  Receipt, 
  Settings, 
  ShieldCheck, 
  Flame,
  Radio,
  X,
  Sparkles
} from 'lucide-react';

export const Sidebar = () => {
  const { currentUser, factory } = useAuthStore();
  const { isSidebarOpen, closeSidebar } = useUIStore();
  const orders = useProductionStore((state) => state.orders);

  // Active production orders count
  const activeOrdersCount = orders.filter((o) => o.status === 'assigned' || o.status === 'in_progress').length;
  // Ugar alerts count
  const alertsCount = orders.filter((o) => o.alert_triggered).length;

  const role = currentUser?.role || 'admin';

  const menuItems = [
    {
      title: 'Boshqaruv Paneli',
      path: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'manager'],
    },
    {
      title: 'Ishlab Chiqarish & Ugar',
      path: '/production',
      icon: Hammer,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
      alertBadge: alertsCount > 0 ? alertsCount : null,
      roles: ['admin', 'manager', 'craftsman'],
    },
    {
      title: 'Ombor (Inventar)',
      path: '/inventory',
      icon: Boxes,
      roles: ['admin', 'manager', 'cashier', 'seller'],
    },
    {
      title: 'Kassa (POS Terminal)',
      path: '/pos',
      icon: Store,
      roles: ['admin', 'cashier', 'seller', 'manager'],
    },
    {
      title: 'Hodimlar',
      path: '/employees',
      icon: Users,
      roles: ['admin', 'manager'],
    },
    {
      title: 'Tranzaksiyalar (Sotuv)',
      path: '/transactions',
      icon: Receipt,
      roles: ['admin', 'manager', 'cashier', 'seller'],
    },
    {
      title: 'Telegram & Sozlamalar',
      path: '/settings',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-[#0f131d] border-r border-luxury-border flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-5">
          {/* Mobile Header with Close button */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-luxury-border">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="font-extrabold text-sm gold-gradient-text uppercase">Gold Trade ERP</span>
            </div>
            <button
              onClick={closeSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141824]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation list */}
          <div className="space-y-1.5">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Asosiy Menyu</p>
            <nav className="space-y-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        closeSidebar();
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-gold-500/20 to-gold-500/5 text-gold-300 border-l-2 border-gold-500 font-semibold shadow-gold-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#141824]'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.title}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-gold-500 text-black">
                          {item.badge}
                        </span>
                      )}
                      {item.alertBadge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center space-x-0.5">
                          <Flame className="w-2.5 h-2.5" />
                          <span>{item.alertBadge}</span>
                        </span>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Info Box */}
        <div className="p-4 border-t border-luxury-border space-y-3">
          <div className="p-3 rounded-xl bg-[#141824] border border-luxury-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-slate-300 flex items-center space-x-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Tizim Holati</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">Online</span>
            </div>
            <p className="text-[10px] text-slate-400">
              {factory?.name ? `${factory.name} — Ma'lumotlar xavfsiz izolyatsiyalangan.` : "BaaS & NoSQL Schema sinxronlashgan."}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span className="capitalize">{role === 'seller' ? 'Sotuvchi' : role}</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">v2.4 Pro</span>
          </div>
        </div>
      </aside>
    </>
  );
};
