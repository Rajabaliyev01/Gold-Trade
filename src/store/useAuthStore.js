import { create } from 'zustand';
import { INITIAL_USERS } from '../services/mockData';

const STORAGE_KEY = 'gold_erp_current_user';

export const useAuthStore = create((set, get) => ({
  users: INITIAL_USERS,
  currentUser: JSON.parse(localStorage.getItem(STORAGE_KEY)) || INITIAL_USERS[0], // default: admin

  // Set current user / role
  setCurrentUser: (user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    set({ currentUser: user });
  },

  // Switch role quickly
  switchRole: (role) => {
    const found = get().users.find((u) => u.role === role);
    if (found) {
      get().setCurrentUser(found);
    }
  },

  // Switch to specific user by uid
  switchUserById: (uid) => {
    const found = get().users.find((u) => u.uid === uid);
    if (found) {
      get().setCurrentUser(found);
    }
  },

  // Update craftsman balance
  updateCraftsmanBalance: (craftsmanId, weightDelta, orderCompleted = false, lossRate = null) => {
    set((state) => ({
      users: state.users.map((u) => {
        if (u.uid === craftsmanId) {
          const newBalance = Math.max(0, Math.round(((u.current_gold_balance || 0) + weightDelta) * 1000) / 1000);
          const newOrdersCount = orderCompleted ? (u.total_completed_orders || 0) + 1 : (u.total_completed_orders || 0);
          
          let newAvgLoss = u.average_loss_rate || 1.5;
          if (orderCompleted && lossRate !== null) {
            newAvgLoss = Math.round(((newAvgLoss * 0.8) + (lossRate * 0.2)) * 100) / 100;
          }

          return {
            ...u,
            current_gold_balance: newBalance,
            total_completed_orders: newOrdersCount,
            average_loss_rate: newAvgLoss,
          };
        }
        return u;
      }),
    }));
  },

  // Add new user
  addUser: (userData) => {
    const newUser = {
      uid: 'user_' + Date.now(),
      status: true,
      current_gold_balance: 0,
      average_loss_rate: 1.5,
      total_completed_orders: 0,
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?w=150&auto=format&fit=crop&q=80`,
      ...userData,
    };
    set((state) => ({ users: [...state.users, newUser] }));
    return newUser;
  },
}));
