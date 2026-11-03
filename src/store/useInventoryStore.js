import { create } from 'zustand';
import { INITIAL_INVENTORY } from '../services/mockData';

const STORAGE_KEY = 'gold_erp_inventory';

export const useInventoryStore = create((set, get) => ({
  items: JSON.parse(localStorage.getItem(STORAGE_KEY)) || INITIAL_INVENTORY,

  save: (newItems) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    set({ items: newItems });
  },

  // Add new inventory item (raw gold, gemstone, finished product)
  addItem: (itemData) => {
    const newItem = {
      id: 'inv_' + Date.now(),
      created_at: new Date().toISOString(),
      status: 'in_stock',
      ...itemData,
      weight: parseFloat(itemData.weight) || 0,
      purity: itemData.purity ? parseInt(itemData.purity, 10) : null,
    };
    const updated = [newItem, ...get().items];
    get().save(updated);
    return newItem;
  },

  // Update item
  updateItem: (id, updates) => {
    const updated = get().items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    get().save(updated);
  },

  // Remove item
  removeItem: (id) => {
    const updated = get().items.filter((item) => item.id !== id);
    get().save(updated);
  },

  // Deduct weight from raw gold inventory when assigning to craftsman
  deductRawGold: (purity, weight) => {
    const deductWeight = parseFloat(weight);
    let remainingToDeduct = deductWeight;

    const updated = get().items.map((item) => {
      if (item.type === 'raw_gold' && item.purity === parseInt(purity, 10) && item.status === 'in_stock') {
        if (remainingToDeduct > 0) {
          if (item.weight >= remainingToDeduct) {
            const newWeight = Math.round((item.weight - remainingToDeduct) * 1000) / 1000;
            remainingToDeduct = 0;
            return { ...item, weight: newWeight };
          } else {
            remainingToDeduct -= item.weight;
            return { ...item, weight: 0 };
          }
        }
      }
      return item;
    });

    get().save(updated);
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
