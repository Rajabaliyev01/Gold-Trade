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

  // 1. RAW MATERIAL INWARD (Xomashyo Kirim Nakladnoyasi)
  addRawMaterialInward: async ({
    supplier,
    materialType = 'scrap_gold', // 'scrap_gold' | 'ingot_999' | 'granules'
    grossWeight,
    purity,
    pureGoldEquivalent,
    usdValuation,
    invoiceNumber,
    notes = '',
  }) => {
    const factoryId = get().currentFactoryId;
    const now = new Date().toISOString();
    const slipId = 'INW-' + Date.now().toString().slice(-6);

    const netWeightNum = parseFloat(grossWeight) || 0;
    const purityNum = parseInt(purity, 10) || 585;
    const pureEqNum = parseFloat(pureGoldEquivalent) || ((netWeightNum * purityNum) / 999.9);
    const usdValNum = parseFloat(usdValuation) || 0;

    // A) Create material inward log record in Firestore
    const inwardSlip = {
      slip_id: slipId,
      factoryId: factoryId || null,
      supplier: supplier || 'Noma\'lum ta\'minotchi',
      material_type: materialType,
      gross_weight: netWeightNum,
      purity: purityNum,
      pure_gold_equivalent: Math.round(pureEqNum * 1000) / 1000,
      usd_valuation: usdValNum,
      invoice_number: invoiceNumber || slipId,
      notes,
      created_at: now,
      status: 'received',
    };

    if (factoryId && db) {
      try {
        const slipRef = doc(db, 'factories', factoryId, 'material_inwards', slipId);
        await setDoc(slipRef, inwardSlip);
      } catch (err) {
        console.error("Firestore inwardSlip error:", err);
      }
    }

    // B) Add directly to Raw Gold inventory
    const inventoryItem = await get().addItem({
      name: `${purityNum} Proba Xomashyo (${materialType === 'ingot_999' ? 'Sof Ingot 999.9' : 'Lom / Qotishma'})`,
      type: 'raw_gold',
      purity: purityNum,
      weight: netWeightNum,
      price_per_gram: usdValNum && netWeightNum > 0 ? Math.round((usdValNum / netWeightNum) * 100) / 100 : 55,
      category: materialType === 'ingot_999' ? 'Sof Tilla (999.9)' : 'Lom / Xomashyo',
      notes: `Kirim nakladnoyasi #${slipId} (${supplier}). Sof ekvivalent: ${pureEqNum.toFixed(3)} gr 999.9`,
      barcode: `INW-${purityNum}-${Date.now().toString().slice(-4)}`,
    });

    return { success: true, inwardSlip, inventoryItem };
  },

  // 1.2 GEMS & FITTINGS INWARD (Tosh va Furnitura Kirim Akti)
  addGemstoneOrFittingInward: async ({
    name,
    itemType = 'gemstone', // 'gemstone' | 'fitting'
    carats = 0,
    piecesCount = 1,
    cutShape = 'Dumaloq',
    clarity = 'VVS1',
    totalUsd = 0,
    supplier = '',
    notes = '',
  }) => {
    const factoryId = get().currentFactoryId;
    const now = new Date().toISOString();
    const slipId = 'GEM-' + Date.now().toString().slice(-6);

    const piecesNum = parseInt(piecesCount, 10) || 1;
    const caratsNum = parseFloat(carats) || 0;
    const usdNum = parseFloat(totalUsd) || 0;

    const inventoryItem = await get().addItem({
      name: name || (itemType === 'gemstone' ? 'Brilliant / Qimmatbaho Tosh' : 'Zargarlik Qulf / Zanjir Furnitura'),
      type: itemType,
      category: itemType === 'gemstone' ? 'Qimmatbaho Toshlar' : 'Furnitura & Qulflar',
      weight: caratsNum > 0 ? Math.round((caratsNum * 0.2) * 1000) / 1000 : 0, // 1 carat = 0.2 gram
      carats: caratsNum,
      pieces_count: piecesNum,
      cut_shape: cutShape,
      clarity,
      selling_price: usdNum,
      price_per_unit: piecesNum > 0 ? Math.round((usdNum / piecesNum) * 100) / 100 : usdNum,
      supplier,
      notes: `Kirim akti #${slipId}. ${notes}`,
      barcode: `GEM-${Date.now().toString().slice(-5)}`,
    });

    return { success: true, inventoryItem };
  },

  // 2. METAL PROCESSING: MELTING & ALLOYING (Eritish, Qotishma va Proba O'zgartirish)
  recordMeltingSheet: async ({
    pureGoldWeight,
    ligatureCopper = 0,
    ligatureSilver = 0,
    targetPurity = 585,
    outputIngotWeight,
    furnaceLossWeight = 0,
    operatorName = '',
    notes = '',
  }) => {
    const factoryId = get().currentFactoryId;
    const now = new Date().toISOString();
    const sheetId = 'MELT-' + Date.now().toString().slice(-5);

    const pureWeightNum = parseFloat(pureGoldWeight) || 0;
    const cuNum = parseFloat(ligatureCopper) || 0;
    const agNum = parseFloat(ligatureSilver) || 0;
    const targetPurityNum = parseInt(targetPurity, 10) || 585;
    const outIngotNum = parseFloat(outputIngotWeight) || (pureWeightNum + cuNum + agNum);
    const furnaceLossNum = parseFloat(furnaceLossWeight) || Math.max(0, (pureWeightNum + cuNum + agNum) - outIngotNum);

    // A) Deduct pure 999.9 gold used in melting
    await get().deductRawGold(999, pureWeightNum);

    // B) Add newly formed alloyed ingot to Raw Gold inventory
    const newIngotItem = await get().addItem({
      name: `${targetPurityNum} Proba Quyma Ingot (Eritish natijasida)`,
      type: 'raw_gold',
      purity: targetPurityNum,
      weight: outIngotNum,
      price_per_gram: 75,
      category: 'Quyma / Ingot',
      notes: `Eritish akti #${sheetId}. Ligatura: ${cuNum}g Mis + ${agNum}g Kumush. Pech yo'qotishi: ${furnaceLossNum.toFixed(3)} gr`,
      barcode: `INGOT-${targetPurityNum}-${Date.now().toString().slice(-4)}`,
    });

    // C) Save official Melting & Alloying Sheet in Firestore
    const meltingRecord = {
      sheet_id: sheetId,
      factoryId: factoryId || null,
      pure_gold_weight: pureWeightNum,
      ligature_copper: cuNum,
      ligature_silver: agNum,
      target_purity: targetPurityNum,
      output_ingot_weight: outIngotNum,
      furnace_loss_weight: furnaceLossNum,
      operator_name: operatorName || 'Usta / Erituvchi',
      notes,
      created_at: now,
      output_item_id: newIngotItem.id,
    };

    if (factoryId && db) {
      try {
        const sheetRef = doc(db, 'factories', factoryId, 'melting_sheets', sheetId);
        await setDoc(sheetRef, meltingRecord);
      } catch (err) {
        console.error("Firestore meltingRecord error:", err);
      }
    }

    return { success: true, meltingRecord, newIngotItem };
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
