import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { OrderList } from './components/production/OrderList';
import { InventoryList } from './components/inventory/InventoryList';
import { POSTerminal } from './components/pos/POSTerminal';
import { CraftsmenList } from './components/craftsmen/CraftsmenList';
import { TransactionHistory } from './components/transactions/TransactionHistory';
import { TelegramSettings } from './components/settings/TelegramSettings';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  const { currentUser } = useAuthStore();
  const role = currentUser?.role || 'admin';

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans selection:bg-gold-500 selection:text-black">
        {/* Global Navbar */}
        <Navbar />

        {/* Content with Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gradient-to-b from-[#0b0e14] via-[#0e121b] to-[#0b0e14]">
            <Routes>
              {/* Dashboard is default for admin and manager */}
              <Route
                path="/"
                element={
                  role === 'craftsman' ? (
                    <Navigate to="/production" replace />
                  ) : role === 'cashier' ? (
                    <Navigate to="/pos" replace />
                  ) : (
                    <Dashboard />
                  )
                }
              />
              <Route path="/production" element={<OrderList />} />
              <Route path="/inventory" element={<InventoryList />} />
              <Route path="/pos" element={<POSTerminal />} />
              <Route path="/craftsmen" element={<CraftsmenList />} />
              <Route path="/transactions" element={<TransactionHistory />} />
              <Route path="/settings" element={<TelegramSettings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
