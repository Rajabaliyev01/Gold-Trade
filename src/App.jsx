import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { OrderList } from './components/production/OrderList';
import { InventoryList } from './components/inventory/InventoryList';
import { POSTerminal } from './components/pos/POSTerminal';
import { EmployeeList } from './components/employees/EmployeeList';
import { TransactionHistory } from './components/transactions/TransactionHistory';
import { SettingsPage } from './components/settings/SettingsPage';
import { FactoryProfileModal } from './components/profile/FactoryProfileModal';
import RatesPage from './pages/RatesPage';
import LoginPage from './pages/LoginPage';
import JewelryPipelinePage from './pages/JewelryPipelinePage';
import { useAuthStore } from './store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { currentUser, loading, isAuthenticated, initAuth } = useAuthStore();
  const role = currentUser?.role || 'admin';

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initAuth]);

  // Loading state while checking Firebase Auth session
  if (loading) {
    return (
      <div 
        role="alert" 
        aria-live="polite" 
        className="min-h-screen bg-[#080a0f] flex flex-col items-center justify-center space-y-4 font-sans text-slate-100"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-gold-500 to-yellow-300 p-[2px] shadow-gold-glow animate-pulse">
          <div className="w-full h-full bg-[#0b0e14] rounded-2xl flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-gold-400 animate-spin" aria-hidden="true" />
          </div>
        </div>
        <p className="text-xs font-mono text-gold-400 tracking-wider uppercase">Gold Trade ERP yuklanmoqda...</p>
      </div>
    );
  }

  // Not authenticated -> show Login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans selection:bg-gold-500 selection:text-black">
        {/* Global Navbar */}
        <Navbar />

        {/* Content with Sidebar */}
        <div className="flex-1 flex overflow-hidden relative">
          <Sidebar />

          <main 
            id="main-content" 
            tabIndex="-1" 
            role="main"
            aria-label="Asosiy ish maydoni"
            className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 bg-transparent focus:outline-none"
          >
            <Routes>
              {/* Dashboard is default for admin and manager */}
              <Route
                path="/"
                element={
                  role === 'craftsman' ? (
                    <Navigate to="/production" replace />
                  ) : (role === 'cashier' || role === 'seller') ? (
                    <Navigate to="/pos" replace />
                  ) : (
                    <Dashboard />
                  )
                }
              />
              <Route path="/rates" element={<RatesPage />} />
              <Route path="/production" element={<OrderList />} />
              <Route path="/pipeline" element={<JewelryPipelinePage />} />
              <Route path="/production-pipeline" element={<Navigate to="/pipeline" replace />} />
              <Route path="/inventory" element={<InventoryList />} />
              <Route path="/pos" element={<POSTerminal />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/craftsmen" element={<Navigate to="/employees" replace />} />
              <Route path="/transactions" element={<TransactionHistory />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Factory Profile Modal */}
        <FactoryProfileModal />
      </div>
    </BrowserRouter>
  );
}
