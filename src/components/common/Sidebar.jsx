import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useProductionStore } from '../../store/useProductionStore';
import { useUIStore } from '../../store/useUIStore';
import { getTranslation } from '../../utils/i18n';
import { 
  LayoutDashboard, 
  Hammer, 
  Boxes, 
  Store, 
  Users, 
  Receipt, 
  ShieldCheck, 
  Flame,
  Radio,
  X,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ClipboardList
} from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();
  const { currentUser, factory } = useAuthStore();
  const { isSidebarOpen, closeSidebar, language } = useUIStore();
  const orders = useProductionStore((state) => state.orders);

  const t = (section, key) => getTranslation(language, section, key);

  // Active production orders count
  const activeOrdersCount = orders.filter((o) => o.status === 'assigned' || o.status === 'in_progress').length;
  // Ugar alerts count
  const alertsCount = orders.filter((o) => o.alert_triggered).length;

  const role = currentUser?.role || 'admin';
  const isManagerOrAdmin = role === 'admin' || role === 'manager';

  // Toggle production sub-menu (default open if on /production or /pipeline)
  const isProductionRoute = location.pathname === '/production' || location.pathname === '/pipeline';
  const [isProductionOpen, setIsProductionOpen] = useState(true);

  useEffect(() => {
    if (isProductionRoute) {
      setIsProductionOpen(true);
    }
  }, [location.pathname, isProductionRoute]);

  const handleMobileNavClick = () => {
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  const menuItems = [
    {
      title: t('nav', 'inventory'),
      path: '/inventory',
      icon: Boxes,
      roles: ['admin', 'manager', 'cashier', 'seller'],
    },
    {
      title: t('nav', 'pos'),
      path: '/pos',
      icon: Store,
      roles: ['admin', 'cashier', 'seller', 'manager'],
    },
    {
      title: t('nav', 'employees'),
      path: '/employees',
      icon: Users,
      roles: ['admin', 'manager'],
    },
    {
      title: t('nav', 'transactions'),
      path: '/transactions',
      icon: Receipt,
      roles: ['admin', 'manager', 'cashier', 'seller'],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-[#12141c]/70 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] transition-transform duration-300 ease-in-out shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="p-4 space-y-5">
          {/* Mobile Header with Close button */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="font-extrabold text-sm gold-gradient-text uppercase">Gold Trade ERP</span>
            </div>
            <button
              onClick={closeSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation list */}
          <div className="space-y-1.5">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {language === 'ru' ? 'Главное меню' : language === 'en' ? 'Main Menu' : 'Asosiy Menyu'}
            </p>
            <nav className="space-y-1">
              {/* 1. Boshqaruv Paneli (Admin / Manager) */}
              {isManagerOrAdmin && (
                <NavLink
                  to="/"
                  end
                  onClick={handleMobileNavClick}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-gold-500/25 to-gold-500/5 text-gold-300 border-l-2 border-gold-500 font-semibold shadow-[0_4px_20px_0_rgba(212,175,55,0.15)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span>{t('nav', 'dashboard')}</span>
                  </div>
                  {alertsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40 flex items-center space-x-0.5">
                      <Flame className="w-2.5 h-2.5" />
                      <span>{alertsCount}</span>
                    </span>
                  )}
                </NavLink>
              )}

              {/* 2. Ishlab Chiqarish Accordion (Admin, Manager, Craftsman) */}
              {(isManagerOrAdmin || role === 'craftsman') && (
                <div className="space-y-1">
                  <button
                    onClick={() => setIsProductionOpen(!isProductionOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isProductionRoute
                        ? 'bg-gold-500/10 text-gold-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Hammer className="w-4 h-4 shrink-0 text-gold-400" />
                      <span>{t('nav', 'production')}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {activeOrdersCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gold-500/20 text-gold-300 font-mono font-bold">
                          {activeOrdersCount}
                        </span>
                      )}
                      {isProductionOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Sub-items */}
                  {isProductionOpen && (
                    <div className="pl-3.5 space-y-1 border-l-2 border-gold-500/20 ml-4 py-1 animate-in fade-in duration-150">
                      {/* Sub-item A: Buyurtmalar Ro'yxati & QC */}
                      <NavLink
                        to="/production"
                        onClick={handleMobileNavClick}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium transition-all duration-150 ${
                            isActive
                              ? 'bg-gold-500/15 text-gold-300 font-semibold border border-gold-500/30'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <ClipboardList className="w-3.5 h-3.5 shrink-0" />
                          <span>{language === 'ru' ? 'Заказы и контроль' : language === 'en' ? 'Orders & QC' : 'Buyurtmalar & Nazorat'}</span>
                        </div>
                      </NavLink>

                      {/* Sub-item B: 5 Bosqichli Zargarlik Tizimi (Manager & Admin) */}
                      {isManagerOrAdmin && (
                        <NavLink
                          to="/pipeline"
                          onClick={handleMobileNavClick}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium transition-all duration-150 ${
                              isActive
                                ? 'bg-gold-500/15 text-gold-300 font-semibold border border-gold-500/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-3.5 h-3.5 shrink-0 text-gold-400" />
                          <span>{t('nav', 'pipeline')}</span>
                        </div>
                      </NavLink>
                    )}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Boshqa menyu bandlari */}
              {menuItems
                .filter((item) => item.roles.includes(role))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={handleMobileNavClick}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-gold-500/25 to-gold-500/5 text-gold-300 border-l-2 border-gold-500 font-semibold shadow-[0_4px_20px_0_rgba(212,175,55,0.15)]'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                    </NavLink>
                  );
                })}
            </nav>
          </div>
        </div>

        {/* Footer Info Box */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-xl bg-[#0d1017]/50 backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-slate-300 flex items-center space-x-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>{language === 'ru' ? 'Статус системы' : language === 'en' ? 'System Status' : 'Tizim Holati'}</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">Online</span>
            </div>
            <p className="text-[10px] text-slate-400">
              {factory?.name ? `${factory.name}` : "BaaS & NoSQL Schema Online."}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span className="capitalize">{role === 'seller' ? (language === 'ru' ? 'Продавец' : language === 'en' ? 'Seller' : 'Sotuvchi') : role}</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">v2.5 Pro</span>
          </div>
        </div>
      </aside>
    </>
  );
};
