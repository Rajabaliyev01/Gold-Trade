import { create } from 'zustand';
import { INITIAL_SETTINGS } from '../services/mockData';

const STORAGE_KEY = 'gold_erp_settings';

export const useSettingsStore = create((set, get) => ({
  settings: JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    ...INITIAL_SETTINGS,
    telegram_bot_token: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
    telegram_chat_id: import.meta.env.VITE_TELEGRAM_CHAT_ID || '',
  },

  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ settings: updated });
  },

  // Update specific gold price
  updateGoldRate: (purity, price) => {
    const key = `gold_rate_${purity}`;
    get().updateSettings({ [key]: parseFloat(price) || 0 });
  },

  // Update USD to UZS rate
  updateUsdRate: (rate) => {
    get().updateSettings({ usd_to_uzs: parseFloat(rate) || 12850 });
  },
}));
