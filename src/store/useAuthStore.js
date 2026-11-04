/**
 * useAuthStore.js
 * Zustand store for authentication & employee management.
 * - Factory owners register/log in via Google (role: 'admin')
 * - Employees log in via username/password (role: 'craftsman' | 'cashier' | 'seller' | 'manager' | 'admin')
 */

import { create } from 'zustand';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  signInWithGoogle as _signInWithGoogle,
  signInAsEmployee as _signInAsEmployee,
  createEmployeeAccount,
  signOutUser,
} from '../services/authService';
import { useInventoryStore } from './useInventoryStore';

export const useAuthStore = create((set, get) => ({
  // ─── State ───────────────────────────────────────────────────────────────────
  currentUser: null,       // { uid, name, email, role, factoryId, username?, phone?, avatar? }
  factory: null,           // { id, name, ownerName, email, phone, address, inn, ... }
  employees: [],           // list of factory employees (loaded for admin)
  users: [],               // alias for employees (for backward compatibility)
  loading: true,           // true ONLY during initial onAuthStateChanged boot
  isAuthenticated: false,
  error: null,

  // ─── initAuth ────────────────────────────────────────────────────────────────
  /**
   * Start the Firebase Auth listener. Call once on app mount.
   */
  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        useInventoryStore.getState().cleanupInventory();
        set({
          currentUser: null,
          factory: null,
          employees: [],
          users: [],
          loading: false,
          isAuthenticated: false,
        });
        return;
      }

      try {
        // 1. Check if this user is a factory owner
        const factoryRef = doc(db, 'factories', firebaseUser.uid);
        const factorySnap = await getDoc(factoryRef);

        if (factorySnap.exists()) {
          // ── Factory owner (admin) ──
          const factoryData = factorySnap.data();
          const adminUser = {
            uid: firebaseUser.uid,
            name: factoryData.ownerName || firebaseUser.displayName || factoryData.name || 'Zavod Egasi',
            email: firebaseUser.email,
            role: 'admin',
            factoryId: firebaseUser.uid,
            avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'Zavod')}&background=d4af37&color=000`,
            phone: factoryData.phone || '',
          };

          set({
            currentUser: adminUser,
            factory: {
              id: firebaseUser.uid,
              ...factoryData,
            },
            loading: false,
            isAuthenticated: true,
            error: null,
          });

          // Sync isolated inventory for this factory
          useInventoryStore.getState().initInventory(firebaseUser.uid);

          // Load employees list for factory owner
          get().loadEmployees();
          return;
        }

        // 2. Not a factory owner doc — check if it's an employee
        const uidIndexRef = doc(db, 'employees_uid_index', firebaseUser.uid);
        const uidIndexSnap = await getDoc(uidIndexRef);

        if (uidIndexSnap.exists()) {
          const { factoryId } = uidIndexSnap.data();
          const empRef = doc(db, 'factories', factoryId, 'employees', firebaseUser.uid);
          const empSnap = await getDoc(empRef);

          if (empSnap.exists()) {
            const empData = empSnap.data();
            const empUser = {
              uid: firebaseUser.uid,
              name: empData.name,
              email: firebaseUser.email,
              role: empData.role || 'craftsman',
              factoryId,
              username: empData.username,
              phone: empData.phone || '',
              status: empData.status !== false,
              current_gold_balance: empData.current_gold_balance || 0,
              average_loss_rate: empData.average_loss_rate || 1.5,
              total_completed_orders: empData.total_completed_orders || 0,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(empData.name)}&background=141824&color=d4af37`,
            };

            // Read factory data for branding
            let factoryInfo = null;
            try {
              const fSnap = await getDoc(doc(db, 'factories', factoryId));
              if (fSnap.exists()) {
                factoryInfo = { id: factoryId, ...fSnap.data() };
              }
            } catch (e) {}

            set({
              currentUser: empUser,
              factory: factoryInfo,
              employees: [],
              users: [empUser],
              loading: false,
              isAuthenticated: true,
              error: null,
            });

            // Sync isolated inventory for this factory
            useInventoryStore.getState().initInventory(factoryId);
            return;
          }
        }

        // Fallback: If not recognized, sign out
        await signOutUser();
        useInventoryStore.getState().cleanupInventory();
        set({
          currentUser: null,
          factory: null,
          employees: [],
          users: [],
          loading: false,
          isAuthenticated: false,
        });
      } catch (err) {
        console.error('initAuth error:', err);
        set({
          loading: false,
          isAuthenticated: false,
          error: err.message,
        });
      }
    });

    return unsubscribe;
  },

  // ─── signInWithGoogle ────────────────────────────────────────────────────────
  signInWithGoogle: async () => {
    set({ error: null });
    try {
      const result = await _signInWithGoogle();
      const user = result.user;

      const factoryRef = doc(db, 'factories', user.uid);
      const factorySnap = await getDoc(factoryRef);

      let factoryData;
      if (!factorySnap.exists()) {
        factoryData = {
          name: user.displayName ? `${user.displayName} Zargarlik Zavodi` : 'Zargarlik Zavodi',
          ownerName: user.displayName || 'Zavod Egasi',
          email: user.email,
          ownerUid: user.uid,
          createdAt: new Date().toISOString(),
          phone: '',
          address: '',
          allowedUgarRate: 2.0,
        };
        await setDoc(factoryRef, factoryData);
      } else {
        factoryData = factorySnap.data();
      }

      const adminUser = {
        uid: user.uid,
        name: factoryData.ownerName || user.displayName || 'Zavod Egasi',
        email: user.email,
        role: 'admin',
        factoryId: user.uid,
        avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'Zavod')}&background=d4af37&color=000`,
        phone: factoryData.phone || '',
      };

      set({
        currentUser: adminUser,
        factory: { id: user.uid, ...factoryData },
        isAuthenticated: true,
        error: null,
      });

      useInventoryStore.getState().initInventory(user.uid);
      await get().loadEmployees();
      return result;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // ─── signInAsEmployee ────────────────────────────────────────────────────────
  signInAsEmployee: async (username, password) => {
    set({ error: null });
    try {
      const result = await _signInAsEmployee(username, password);
      return result;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // ─── updateFactoryProfile ────────────────────────────────────────────────────
  updateFactoryProfile: async (profileData) => {
    const { currentUser, factory } = get();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error("Faqat zavod egasi o'z profilini o'zgartira oladi.");
    }

    const factoryId = currentUser.factoryId;
    const factoryRef = doc(db, 'factories', factoryId);

    const updatedDoc = {
      ...factory,
      ...profileData,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(factoryRef, updatedDoc, { merge: true });

    set({
      factory: updatedDoc,
      currentUser: {
        ...currentUser,
        name: profileData.ownerName || currentUser.name,
        phone: profileData.phone || currentUser.phone,
      },
    });

    return updatedDoc;
  },

  // ─── signOut ─────────────────────────────────────────────────────────────────
  signOut: async () => {
    try {
      await signOutUser();
    } finally {
      useInventoryStore.getState().cleanupInventory();
      set({
        currentUser: null,
        factory: null,
        employees: [],
        users: [],
        loading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  // ─── loadEmployees ───────────────────────────────────────────────────────────
  loadEmployees: async () => {
    const { currentUser } = get();
    if (!currentUser || currentUser.role !== 'admin') return;

    try {
      const empCol = collection(db, 'factories', currentUser.factoryId, 'employees');
      const snap = await getDocs(empCol);
      const employees = snap.docs.map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          ...data,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Hodim')}&background=141824&color=d4af37`,
        };
      });
      set({ employees, users: employees });
    } catch (err) {
      console.error('loadEmployees error:', err);
    }
  },

  // ─── createEmployee ──────────────────────────────────────────────────────────
  createEmployee: async (data) => {
    const { currentUser } = get();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error("Faqat zavod egasi (admin) yangi hodim qo'sha oladi.");
    }

    const employee = await createEmployeeAccount(currentUser.factoryId, data);
    const enrichedEmployee = {
      ...employee,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=141824&color=d4af37`,
    };

    set((state) => {
      const updated = [...state.employees, enrichedEmployee];
      return { employees: updated, users: updated };
    });
    return enrichedEmployee;
  },

  // ─── updateEmployee ──────────────────────────────────────────────────────────
  updateEmployee: async (uid, data) => {
    const { currentUser } = get();
    if (!currentUser || currentUser.role !== 'admin') return;

    const empRef = doc(db, 'factories', currentUser.factoryId, 'employees', uid);
    await updateDoc(empRef, { ...data, updatedAt: new Date().toISOString() });

    set((state) => {
      const updated = state.employees.map((e) => (e.uid === uid ? { ...e, ...data } : e));
      return { employees: updated, users: updated };
    });
  },

  // ─── deleteEmployee ──────────────────────────────────────────────────────────
  deleteEmployee: async (uid) => {
    const { currentUser, employees } = get();
    if (!currentUser || currentUser.role !== 'admin') return;

    const emp = employees.find((e) => e.uid === uid);
    const empRef = doc(db, 'factories', currentUser.factoryId, 'employees', uid);
    await deleteDoc(empRef);

    if (emp?.username) {
      try {
        await deleteDoc(doc(db, 'employees_index', emp.username));
      } catch (e) {}
      try {
        await deleteDoc(doc(db, 'employees_uid_index', uid));
      } catch (e) {}
    }

    set((state) => {
      const updated = state.employees.filter((e) => e.uid !== uid);
      return { employees: updated, users: updated };
    });
  },

  // ─── updateCraftsmanBalance ──────────────────────────────────────────────────
  updateCraftsmanBalance: async (craftsmanId, weightDelta, orderCompleted = false, lossRate = null) => {
    const { currentUser, employees } = get();

    const updatedEmployees = employees.map((u) => {
      if (u.uid === craftsmanId) {
        const newBalance = Math.max(
          0,
          Math.round(((u.current_gold_balance || 0) + weightDelta) * 1000) / 1000
        );
        const newOrdersCount = orderCompleted
          ? (u.total_completed_orders || 0) + 1
          : u.total_completed_orders || 0;

        let newAvgLoss = u.average_loss_rate || 1.5;
        if (orderCompleted && lossRate !== null) {
          newAvgLoss = Math.round((newAvgLoss * 0.8 + lossRate * 0.2) * 100) / 100;
        }

        return {
          ...u,
          current_gold_balance: newBalance,
          total_completed_orders: newOrdersCount,
          average_loss_rate: newAvgLoss,
        };
      }
      return u;
    });

    set({ employees: updatedEmployees, users: updatedEmployees });

    try {
      const factoryId = currentUser?.factoryId;
      if (factoryId) {
        const updated = updatedEmployees.find((e) => e.uid === craftsmanId);
        if (updated) {
          const empRef = doc(db, 'factories', factoryId, 'employees', craftsmanId);
          await updateDoc(empRef, {
            current_gold_balance: updated.current_gold_balance,
            total_completed_orders: updated.total_completed_orders,
            average_loss_rate: updated.average_loss_rate,
          });
        }
      }
    } catch (err) {
      console.warn('updateCraftsmanBalance Firestore sync warning:', err);
    }
  },
}));
