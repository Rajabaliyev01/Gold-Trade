import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Navigation & Modals
  isSidebarOpen: false,
  isProfileModalOpen: false,

  // Language state (uz, ru, en)
  language: localStorage.getItem('gold_erp_language') || 'uz',

  setLanguage: (lang) => {
    localStorage.setItem('gold_erp_language', lang);
    set({ language: lang });
  },

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),

  openProfileModal: () => set({ isProfileModalOpen: true }),
  closeProfileModal: () => set({ isProfileModalOpen: false }),
}));
