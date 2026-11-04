import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Clear legacy demo mock data from localStorage if present
['gold_erp_current_user', 'gold_erp_inventory', 'gold_erp_production_orders', 'gold_erp_transactions'].forEach((key) => {
  const val = localStorage.getItem(key);
  if (val && (
    val.includes('user_admin_01') ||
    val.includes('inv_raw_01') ||
    val.includes('ORD-2026-001') ||
    val.includes('TX-2026-901') ||
    val.includes('Dilshod Karimov')
  )) {
    localStorage.removeItem(key);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
