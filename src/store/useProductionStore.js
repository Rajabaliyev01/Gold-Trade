import { create } from 'zustand';
import { db } from '../services/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { calculateUgar } from '../utils/ugarCalculator';
import { sendTelegramMessage, formatUgarAlertMessage } from '../services/telegramService';
import { useInventoryStore } from './useInventoryStore';
import { useAuthStore } from './useAuthStore';
import { useSettingsStore } from './useSettingsStore';

let unsubscribeOrders = null;

export const useProductionStore = create((set, get) => ({
  orders: [],
  currentFactoryId: null,
  loading: false,

  // Initialize real-time production orders sync for a specific factory (Multi-tenant)
  initProductionOrders: (factoryId) => {
    if (!factoryId) return;

    if (get().currentFactoryId === factoryId && unsubscribeOrders) return;

    if (unsubscribeOrders) {
      unsubscribeOrders();
      unsubscribeOrders = null;
    }

    set({ currentFactoryId: factoryId, loading: true });

    // Load from local storage cache for instant UI
    const cacheKey = `gold_erp_production_orders_${factoryId}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        set({ orders: JSON.parse(cached) });
      }
    } catch (e) {}

    // Real-time Firestore sync: factories/{factoryId}/production_orders
    try {
      const colRef = collection(db, 'factories', factoryId, 'production_orders');
      unsubscribeOrders = onSnapshot(
        colRef,
        (snapshot) => {
          const orders = [];
          snapshot.forEach((d) => {
            orders.push({ order_id: d.id, ...d.data() });
          });

          // Sort by newest first
          orders.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

          set({ orders, loading: false });
          try {
            localStorage.setItem(cacheKey, JSON.stringify(orders));
          } catch (e) {}
        },
        (error) => {
          console.warn("Firestore production_orders sync warning:", error);
          set({ loading: false });
        }
      );
    } catch (err) {
      console.warn("initProductionOrders error:", err);
      set({ loading: false });
    }
  },

  cleanupProductionOrders: () => {
    if (unsubscribeOrders) {
      unsubscribeOrders();
      unsubscribeOrders = null;
    }
    set({ orders: [], currentFactoryId: null, loading: false });
  },

  save: (newOrders) => {
    const factoryId = get().currentFactoryId;
    if (factoryId) {
      try {
        localStorage.setItem(`gold_erp_production_orders_${factoryId}`, JSON.stringify(newOrders));
      } catch (e) {}
    }
    set({ orders: newOrders });
  },

  // 1. Yangi ishlab chiqarish buyurtmasini yaratish va xomashyo ajratish (Firestore-ga saqlanadi)
  createOrder: async ({ 
    title, 
    craftsmanId, 
    craftsmanName, 
    purity, 
    givenWeight, 
    allowedLossRate = 2.0, 
    notes = '' 
  }) => {
    const factoryId = get().currentFactoryId || useAuthStore.getState().currentUser?.factoryId;
    const weightNum = parseFloat(givenWeight);
    const purityNum = parseInt(purity, 10);

    // Ombordan xomashyoni kamaytirish
    useInventoryStore.getState().deductRawGold(purityNum, weightNum);

    // Ustaning qo'lidagi tilla balansini oshirish
    useAuthStore.getState().updateCraftsmanBalance(craftsmanId, weightNum);

    const orderId = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);

    const newOrder = {
      order_id: orderId,
      factoryId: factoryId || null,
      title: title || `${purityNum} Proba Zargarlik Buyumi`,
      craftsman_id: craftsmanId,
      craftsman_name: craftsmanName,
      purity: purityNum,
      given_weight: weightNum,
      received_weight: 0,
      returned_scrap: 0,
      loss_weight: 0,
      loss_percentage: 0,
      allowed_loss_rate: parseFloat(allowedLossRate) || 2.0,
      status: 'assigned', // 'assigned' | 'in_progress' | 'completed'
      alert_triggered: false,
      notes,
      timestamp: new Date().toISOString(),
      completed_at: null,
    };

    // Update state immediately
    const updated = [newOrder, ...get().orders];
    get().save(updated);

    // Save directly to Firestore under factories/{factoryId}/production_orders/{orderId}
    if (factoryId && db) {
      try {
        const docRef = doc(db, 'factories', factoryId, 'production_orders', orderId);
        await setDoc(docRef, newOrder);
      } catch (err) {
        console.error("Firestore createOrder error:", err);
      }
    }

    return newOrder;
  },

  // 2. Buyurtma holatini yangilash (masalan: ish jarayoniga o'tkazish)
  updateOrderStatus: async (orderId, status) => {
    const factoryId = get().currentFactoryId || useAuthStore.getState().currentUser?.factoryId;
    const updated = get().orders.map((o) => (o.order_id === orderId ? { ...o, status } : o));
    get().save(updated);

    if (factoryId && db) {
      try {
        const docRef = doc(db, 'factories', factoryId, 'production_orders', orderId);
        await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.error("Firestore updateOrderStatus error:", err);
      }
    }
  },

  // 3. Ishni qabul qilish, Ugar hisoblash, omborga kiritish va Telegramga yuborish
  completeOrder: async ({
    orderId,
    receivedWeight,
    returnedScrap,
    productName,
    sellingPrice,
    category = 'Zanjir',
    notes = '',
  }) => {
    const factoryId = get().currentFactoryId || useAuthStore.getState().currentUser?.factoryId;
    const order = get().orders.find((o) => o.order_id === orderId);
    if (!order) return { success: false, error: 'Buyurtma topilmadi' };

    const settings = useSettingsStore.getState().settings;
    const goldPricePerGram = settings[`gold_rate_${order.purity}`] || 75;

    // Milligramm aniqlikdagi ugar hisobi
    const calculation = calculateUgar({
      givenWeight: order.given_weight,
      receivedWeight,
      returnedScrap,
      allowedLossRate: order.allowed_loss_rate || settings.max_allowed_loss_percentage || 2.0,
      goldPricePerGram,
    });

    const isAlert = calculation.isOverThreshold;

    // Omborni yangilash:
    // A) Tayyor mahsulotni Finished Products ro'yxatiga qo'shish
    const finishedProduct = await useInventoryStore.getState().addFinishedProduct({
      name: productName || order.title,
      purity: order.purity,
      weight: calculation.receivedWeight,
      sellingPrice: sellingPrice || (calculation.receivedWeight * (goldPricePerGram + 25)),
      craftsmanId: order.craftsman_id,
      category,
      barcode: `FP-${order.purity}-${Date.now().toString().slice(-5)}`,
    });

    // B) Qaytarilgan qirindi va changni xomashyo omboriga qaytarish
    if (calculation.returnedScrap > 0) {
      useInventoryStore.getState().addReturnedScrap(order.purity, calculation.returnedScrap);
    }

    // C) Ustaning balansini yopish (berilgan vazn usta balansidan ayiriladi)
    useAuthStore.getState().updateCraftsmanBalance(
      order.craftsman_id,
      -order.given_weight,
      true, // order completed
      calculation.lossPercentage
    );

    // D) Buyurtma ma'lumotlarini yangilash
    const updatedOrder = {
      ...order,
      received_weight: calculation.receivedWeight,
      returned_scrap: calculation.returnedScrap,
      loss_weight: calculation.lossWeight,
      loss_percentage: calculation.lossPercentage,
      excess_loss: calculation.excessLossWeight,
      financial_damage: calculation.financialLoss,
      alert_triggered: isAlert,
      status: 'completed',
      completed_at: new Date().toISOString(),
      notes: notes || order.notes,
      finished_product_id: finishedProduct?.id || null,
    };

    const updatedOrders = get().orders.map((o) => (o.order_id === orderId ? updatedOrder : o));
    get().save(updatedOrders);

    // Save to Firestore
    if (factoryId && db) {
      try {
        const docRef = doc(db, 'factories', factoryId, 'production_orders', orderId);
        await setDoc(docRef, updatedOrder, { merge: true });
      } catch (err) {
        console.error("Firestore completeOrder error:", err);
      }
    }

    // E) Agar Ugar me'yordan oshsa, Telegram Bot orqali ogohlantirish (Alert)
    let telegramResult = null;
    if (isAlert && settings.notify_on_excess_ugar) {
      const craftsman = useAuthStore.getState().users.find((u) => u.uid === order.craftsman_id);
      const message = formatUgarAlertMessage({
        order: updatedOrder,
        craftsman,
        excessLoss: calculation.excessLossWeight,
        financialDamage: calculation.financialLoss,
      });

      telegramResult = await sendTelegramMessage({
        token: settings.telegram_bot_token,
        chatId: settings.telegram_chat_id,
        text: message,
      });
    }

    return {
      success: true,
      calculation,
      order: updatedOrder,
      telegramResult,
      isAlert,
    };
  },
}));
