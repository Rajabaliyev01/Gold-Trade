import { create } from 'zustand';
import { db } from '../services/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

let unsubscribeInventory = null;

export const useInventoryStore = create((set, get) => ({
  items: [],
  currentFactoryId: null,
  loading: false,

  // Initialize real-time inventory sync for a specific factory (Multi-tenant isolation)
  initInventory: (factoryId) => {
    if (!factoryId) return;

    // If already subscribed to the same factory, keep it
    if (get().currentFactoryId === factoryId && unsubscribeInventory) return;

    // Unsubscribe previous factory listener if any
    if (unsubscribeInventory) {
      unsubscribeInventory();
      unsubscribeInventory = null;
    }

    set({ currentFactoryId: factoryId, loading: true });

    // Load from cached localStorage first for instant UI response
    const cacheKey = `gold_erp_inventory_${factoryId}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        set({ items: JSON.parse(cached) });
      }
    } catch (e) {}

    // Subscribe to Firestore: factories/{factoryId}/inventory
    try {
      const colRef = collection(db, 'factories', factoryId, 'inventory');
      unsubscribeInventory = onSnapshot(
        colRef,
        (snapshot) => {
          const items = [];
          snapshot.forEach((d) => {
            items.push({ id: d.id, ...d.data() });
          });

          // Sort by newest first
          items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

          set({ items, loading: false });
          try {
            localStorage.setItem(cacheKey, JSON.stringify(items));
          } catch (e) {}
        },
        (error) => {
          console.warn("Firestore inventory sync warning:", error);
          set({ loading: false });
        }
      );
    } catch (err) {
      console.warn("initInventory error:", err);
      set({ loading: false });
    }
  },

  cleanupInventory: () => {
    if (unsubscribeInventory) {
      unsubscribeInventory();
      unsubscribeInventory = null;
    }
    set({ items: [], currentFactoryId: null, loading: false });
  },

  // Save items to local cache and state
  save: (newItems) => {
    const factoryId = get().currentFactoryId;
    if (factoryId) {
      try {
        localStorage.setItem(`gold_erp_inventory_${factoryId}`, JSON.stringify(newItems));
      } catch (e) {}
    }
    set({ items: newItems });
  },

  // Add new inventory item to Firestore (factories/{factoryId}/inventory/{id})
  addItem: async (itemData) => {
    const factoryId = get().currentFactoryId;
    const newItem = {
      id: 'inv_' + Date.now(),
      created_at: new Date().toISOString(),
      status: 'in_stock',
      factoryId: factoryId || null,
      ...itemData,
      weight: parseFloat(itemData.weight) || 0,
      purity: itemData.purity ? parseInt(itemData.purity, 10) : null,
      price_per_gram: parseFloat(itemData.price_per_gram) || 0,
      selling_price: parseFloat(itemData.selling_price) || 0,
    };

    // Update local state immediately
    const updated = [newItem, ...get().items];
    get().save(updated);

    // Sync to Firestore if factoryId is active
    if (factoryId && db) {
      try {
        const docRef = doc(db, 'factories', factoryId, 'inventory', newItem.id);
        await setDoc(docRef, newItem);
      } catch (err) {
        console.error("Firestore addItem error:", err);
      }
    }

    return newItem;
  },

  // Update item in Firestore
  updateItem: async (id, updates) => {
    const factoryId = get().currentFactoryId;
    const updated = get().items.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    get().save(updated);

    if (factoryId && db) {
      try {
        const docRef = doc(db, 'factories', factoryId, 'inventory', id);
        await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.error("Firestore updateItem error:", err);
      }
    }
  },

  // Remove item from Firestore
  removeItem: async (id) => {
    const factoryId = get().currentFactoryId;
    const updated = get().items.filter((item) => item.id !== id);
    get().save(updated);

    if (factoryId && db) {
      try {
        const docRef = doc(db, 'factories', factoryId, 'inventory', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.error("Firestore removeItem error:", err);
      }
    }
  },

  // Deduct weight from raw gold inventory when assigning to craftsman
  deductRawGold: async (purity, weight) => {
    const deductWeight = parseFloat(weight);
    let remainingToDeduct = deductWeight;

    const itemsToUpdate = [];

    const updated = get().items.map((item) => {
      if (item.type === 'raw_gold' && item.purity === parseInt(purity, 10) && item.status === 'in_stock') {
        if (remainingToDeduct > 0) {
          if (item.weight >= remainingToDeduct) {
            const newWeight = Math.round((item.weight - remainingToDeduct) * 1000) / 1000;
            remainingToDeduct = 0;
            itemsToUpdate.push({ id: item.id, weight: newWeight });
            return { ...item, weight: newWeight };
          } else {
            remainingToDeduct -= item.weight;
            itemsToUpdate.push({ id: item.id, weight: 0 });
            return { ...item, weight: 0 };
          }
        }
      }
      return item;
    });

    get().save(updated);

    // Sync updated docs to Firestore
    for (const u of itemsToUpdate) {
      get().updateItem(u.id, { weight: u.weight });
    }

    return remainingToDeduct === 0;
  },

  // Add returned scrap back into raw scrap gold inventory
  addReturnedScrap: (purity, weight) => {
    const scrapWeight = parseFloat(weight);
    if (scrapWeight <= 0) return;

    // Check if there is an existing scrap pile for this purity
    const existing = get().items.find(
      (i) => i.type === 'raw_gold' && i.purity === parseInt(purity, 10) && i.category === 'Qirindi/Chang'
    );

    if (existing) {
      const newWeight = Math.round((existing.weight + scrapWeight) * 1000) / 1000;
      get().updateItem(existing.id, { weight: newWeight });
    } else {
      get().addItem({
        name: `${purity} Proba Qaytarilgan Qirindi/Chang`,
        type: 'raw_gold',
        purity: parseInt(purity, 10),
        weight: scrapWeight,
        price_per_gram: 45.00,
        category: 'Qirindi/Chang',
        notes: "Ustalardan qaytgan qirindi va kasting qoldiqlari",
        barcode: `SCRAP-${purity}-${Date.now().toString().slice(-4)}`,
      });
    }
  },

  // Add finished product from completed order
  addFinishedProduct: ({ name, purity, weight, sellingPrice, craftsmanId, category, barcode }) => {
    return get().addItem({
      name,
      type: 'finished_product',
      purity: parseInt(purity, 10),
      weight: parseFloat(weight),
      selling_price: parseFloat(sellingPrice) || 0,
      craftsman_id: craftsmanId,
      category: category || 'Boshqa',
      barcode: barcode || `GOLD-${purity}-${Date.now().toString().slice(-5)}`,
      notes: "Ishlab chiqarishdan yangi qabul qilingan mahsulot",
    });
  },

  // Mark finished product as sold (from POS)
  markAsSold: (id) => {
    get().updateItem(id, { status: 'sold' });
  },

  // Get total raw gold in vault by purity
  getVaultSummary: () => {
    const items = get().items;
    let totalRawWeight = 0;
    let totalFinishedWeight = 0;
    let totalValuationUSD = 0;

    items.forEach((item) => {
      if (item.status === 'in_stock') {
        if (item.type === 'raw_gold') {
          totalRawWeight += item.weight || 0;
          totalValuationUSD += (item.weight || 0) * (item.price_per_gram || 50);
        } else if (item.type === 'finished_product') {
          totalFinishedWeight += item.weight || 0;
          totalValuationUSD += item.selling_price || ((item.weight || 0) * 75);
        } else if (item.type === 'gemstone') {
          totalValuationUSD += (item.price_per_unit || 0) * (item.pieces_count || 1);
        }
      }
    });

    return {
      totalRawWeight: Math.round(totalRawWeight * 1000) / 1000,
      totalFinishedWeight: Math.round(totalFinishedWeight * 1000) / 1000,
      totalWeight: Math.round((totalRawWeight + totalFinishedWeight) * 1000) / 1000,
      totalValuationUSD: Math.round(totalValuationUSD),
    };
  },
}));
