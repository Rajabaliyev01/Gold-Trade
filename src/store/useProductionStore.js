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
          orders.sort((a, b) => new Date(b.created_at || b.timestamp || 0) - new Date(a.created_at || a.timestamp || 0));

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

  // 1. Yangi ishlab chiqarish buyurtmasini yaratish va ustaga xomashyo ajratish (Firestore)
  createOrder: async ({ 
    title, 
    craftsmanId, 
    craftsmanName, 
    purity, 
    givenWeight, 
    allowedLossRate = 2.0, 
    notes = '',
    stonesCount = 0,
    dimensions = '',
    deadline = '',
  }) => {
    const factoryId = get().currentFactoryId || useAuthStore.getState().currentUser?.factoryId;
    const currentUser = useAuthStore.getState().currentUser;
    const weightNum = parseFloat(givenWeight);
    const purityNum = parseInt(purity, 10);
    const now = new Date().toISOString();

    // Ombordan xomashyoni kamaytirish
    useInventoryStore.getState().deductRawGold(purityNum, weightNum);

    // Ustaning qo'lidagi tilla balansini oshirish
    useAuthStore.getState().updateCraftsmanBalance(craftsmanId, weightNum);

    const orderId = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);

    const initialTimeline = [
      {
        stage: 'assigned',
        action: "Xomashyo ajratildi va buyurtma ustaga biriktirildi",
        timestamp: now,
        user_name: currentUser?.name || 'Menejer',
        user_role: currentUser?.role || 'manager',
        details: `${weightNum.toFixed(3)} gr ${purityNum} proba tilla topshirildi`,
      }
    ];

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
      status: 'assigned', // 'assigned' | 'in_progress' | 'pending_review' | 'completed'
      alert_triggered: false,
      notes,
      stones_count: parseInt(stonesCount, 10) || 0,
      dimensions: dimensions || '',
      deadline: deadline || '',
      
      // Detailed Timestamps for audit trail
      created_at: now,
      assigned_at: now,
      started_at: null,
      completed_by_craftsman_at: null,
      reviewed_at: null,
      added_to_inventory_at: null,
      timestamp: now, // backward compat

      timeline: initialTimeline,
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

  // 2. Ustaga ish borganda: 1-bosqich — Ishni qabul qilish va boshlash (in_progress)
  startOrderWork: async (orderId) => {
    const factoryId = get().currentFactoryId || useAuthStore.getState().currentUser?.factoryId;
    const currentUser = useAuthStore.getState().currentUser;
    const now = new Date().toISOString();

    const order = get().orders.find((o) => o.order_id === orderId);
    if (!order) return { success: false, error: 'Buyurtma topilmadi' };

    const newTimelineItem = {
      stage: 'in_progress',
      action: "Usta ishni qabul qildi va yasash jarayonini boshladi",
      timestamp: now,
      user_name: currentUser?.name || order.craftsman_name || 'Usta',
      user_role: currentUser?.role || 'craftsman',
      details: "Xomashyo ustaxona stolida ishlov berishga olindi",
    };

    const updatedOrder = {
      ...order,
      status: 'in_progress',
      started_at: now,
      timeline: [...(order.timeline || []), newTimelineItem],
    };

    const updated = get().orders.map((o) => (o.order_id === orderId ? updatedOrder : o));
    get().save(updated);

    if (factoryId && db) {
      try {
        const docRef = doc(db, 'factories', factoryId, 'production_orders', orderId);
        await updateDoc(docRef, {
          status: 'in_progress',
          started_at: now,
          timeline: updatedOrder.timeline,
        });
      } catch (err) {
        console.error("Firestore startOrderWork error:", err);
      }
    }

    return { success: true, order: updatedOrder };
  },

  // 3. Ustaga ish borganda: 2-bosqich — Ishni yakunlash va tekshiruvga topshirish (pending_review)
  submitCraftsmanWork: async ({
    orderId,
    receivedWeight,
    returnedScrap = 0,
    usedStonesCount = 0,
    craftsmanNotes = '',
  }) => {
    const factoryId = get().currentFactoryId || useAuthStore.getState().currentUser?.factoryId;
    const currentUser = useAuthStore.getState().currentUser;
    const now = new Date().toISOString();

    const order = get().orders.find((o) => o.order_id === orderId);
    if (!order) return { success: false, error: 'Buyurtma topilmadi' };

    const recWeight = parseFloat(receivedWeight) || 0;
    const retScrap = parseFloat(returnedScrap) || 0;

    // Preliminary Ugar calculation
    const settings = useSettingsStore.getState().settings;
    const goldPricePerGram = settings[`gold_rate_${order.purity}`] || 75;
    const calc = calculateUgar({
      givenWeight: order.given_weight,
      receivedWeight: recWeight,
      returnedScrap: retScrap,
      allowedLossRate: order.allowed_loss_rate || 2.0,
      goldPricePerGram,
    });

    const newTimelineItem = {
      stage: 'pending_review',
      action: "Usta mahsulotni yasab bitirdi va tekshiruvga topshirdi",
      timestamp: now,
      user_name: currentUser?.name || order.craftsman_name || 'Usta',
      user_role: currentUser?.role || 'craftsman',
      details: `Tayyor buyum: ${recWeight.toFixed(3)} gr, Qirindi: ${retScrap.toFixed(3)} gr, Hisoblangan ugar: ${calc.lossWeight.toFixed(3)} gr (${calc.lossPercentage}%)`,
    };

    const updatedOrder = {
      ...order,
      status: 'pending_review',
      completed_by_craftsman_at: now,
      submitted_at: now,
      craftsman_received_weight: recWeight,
      craftsman_returned_scrap: retScrap,
      craftsman_used_stones: parseInt(usedStonesCount, 10) || 0,
      craftsman_notes: craftsmanNotes,
      received_weight: recWeight,
      returned_scrap: retScrap,
      loss_weight: calc.lossWeight,
      loss_percentage: calc.lossPercentage,
      excess_loss: calc.excessLossWeight,
      financial_damage: calc.financialLoss,
      alert_triggered: calc.isOverThreshold,
      timeline: [...(order.timeline || []), newTimelineItem],
    };

    const updated = get().orders.map((o) => (o.order_id === orderId ? updatedOrder : o));
    get().save(updated);

    if (factoryId && db) {
      try {
        const docRef = doc(db, 'factories', factoryId, 'production_orders', orderId);
        await updateDoc(docRef, {
          status: 'pending_review',
          completed_by_craftsman_at: now,
          submitted_at: now,
          craftsman_received_weight: recWeight,
          craftsman_returned_scrap: retScrap,
          craftsman_used_stones: parseInt(usedStonesCount, 10) || 0,
          craftsman_notes: craftsmanNotes,
          received_weight: recWeight,
          returned_scrap: retScrap,
          loss_weight: calc.lossWeight,
          loss_percentage: calc.lossPercentage,
          excess_loss: calc.excessLossWeight,
          financial_damage: calc.financialLoss,
          alert_triggered: calc.isOverThreshold,
          timeline: updatedOrder.timeline,
        });
      } catch (err) {
        console.error("Firestore submitCraftsmanWork error:", err);
      }
    }

    return { success: true, order: updatedOrder, calc };
  },

  // 4. Ustaga ish borganda: 3-bosqich — Menejer tekshirib (QC) omborga qo'shishi (completed)
  reviewAndApproveOrder: async ({
    orderId,
    approvedWeight,
    approvedScrap = 0,
    productName,
    category = 'Zanjir',
    sellingPrice,
    qcChecklist = {},
    managerNotes = '',
    deductExcessFromCraftsman = false,
  }) => {
    const factoryId = get().currentFactoryId || useAuthStore.getState().currentUser?.factoryId;
    const currentUser = useAuthStore.getState().currentUser;
    const now = new Date().toISOString();

    const order = get().orders.find((o) => o.order_id === orderId);
    if (!order) return { success: false, error: 'Buyurtma topilmadi' };

    const recWeight = parseFloat(approvedWeight) || order.craftsman_received_weight || order.received_weight || 0;
    const retScrap = parseFloat(approvedScrap) || order.craftsman_returned_scrap || order.returned_scrap || 0;

    const settings = useSettingsStore.getState().settings;
    const goldPricePerGram = settings[`gold_rate_${order.purity}`] || 75;

    // Yakuniy milligramm ugar hisobi
    const calculation = calculateUgar({
      givenWeight: order.given_weight,
      receivedWeight: recWeight,
      returnedScrap: retScrap,
      allowedLossRate: order.allowed_loss_rate || settings.max_allowed_loss_percentage || 2.0,
      goldPricePerGram,
    });

    const isAlert = calculation.isOverThreshold;
    const barcode = `FP-${order.purity}-${Date.now().toString().slice(-5)}`;
    const finalSellingPrice = parseFloat(sellingPrice) || (recWeight * (goldPricePerGram + 30));

    // A) Omborni yangilash: Tayyor mahsulot omboriga qo'shish
    const finishedProduct = await useInventoryStore.getState().addFinishedProduct({
      name: productName || order.title,
      purity: order.purity,
      weight: calculation.receivedWeight,
      sellingPrice: finalSellingPrice,
      craftsmanId: order.craftsman_id,
      category,
      barcode,
    });

    // B) Qaytarilgan qirindi va changni xomashyo omboriga qaytarish
    if (calculation.returnedScrap > 0) {
      useInventoryStore.getState().addReturnedScrap(order.purity, calculation.returnedScrap);
    }

    // C) Ustaning balansini yopish (berilgan vazn ayiriladi)
    useAuthStore.getState().updateCraftsmanBalance(
      order.craftsman_id,
      -order.given_weight,
      true, // order completed
      calculation.lossPercentage
    );

    const newTimelineItem = {
      stage: 'completed',
      action: "Menejer tekshirdi (QC tasdiqlandi) va mahsulot omborga qabul qilindi",
      timestamp: now,
      user_name: currentUser?.name || 'Menejer',
      user_role: currentUser?.role || 'manager',
      details: `QC Muvaffaqiyatli. Mahsulot: "${productName || order.title}". Shtrix-kod: ${barcode}. Tayyor og'irlik: ${recWeight.toFixed(3)} gr. Omborga kiritildi.`,
    };

    const updatedOrder = {
      ...order,
      status: 'completed',
      received_weight: calculation.receivedWeight,
      returned_scrap: calculation.returnedScrap,
      loss_weight: calculation.lossWeight,
      loss_percentage: calculation.lossPercentage,
      excess_loss: calculation.excessLossWeight,
      financial_damage: calculation.financialLoss,
      alert_triggered: isAlert,
      
      // Timestamps
      reviewed_at: now,
      added_to_inventory_at: now,
      completed_at: now,
      reviewed_by: {
        uid: currentUser?.uid || '',
        name: currentUser?.name || 'Menejer',
      },

      qc_checklist: qcChecklist,
      manager_notes: managerNotes,
      selling_price: finalSellingPrice,
      barcode,
      category,
      finished_product_id: finishedProduct?.id || null,
      timeline: [...(order.timeline || []), newTimelineItem],
    };

    const updatedOrders = get().orders.map((o) => (o.order_id === orderId ? updatedOrder : o));
    get().save(updatedOrders);

    // Save to Firestore
    if (factoryId && db) {
      try {
        const docRef = doc(db, 'factories', factoryId, 'production_orders', orderId);
        await setDoc(docRef, updatedOrder, { merge: true });
      } catch (err) {
        console.error("Firestore reviewAndApproveOrder error:", err);
      }
    }

    // Telegram Alert if excess ugar occurred
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
      finishedProduct,
      telegramResult,
      isAlert,
    };
  },

  // 5. Menejer tomonidan kamchilik aniqlanganda ustaga qayta ishlashga yuborish
  rejectAndReturnToCraftsman: async (orderId, rejectReason = '') => {
    const factoryId = get().currentFactoryId || useAuthStore.getState().currentUser?.factoryId;
    const currentUser = useAuthStore.getState().currentUser;
    const now = new Date().toISOString();

    const order = get().orders.find((o) => o.order_id === orderId);
    if (!order) return { success: false, error: 'Buyurtma topilmadi' };

    const newTimelineItem = {
      stage: 'in_progress',
      action: "Sifat nazoratidan qaytarildi (kamchiliklar aniqlandi)",
      timestamp: now,
      user_name: currentUser?.name || 'Menejer',
      user_role: currentUser?.role || 'manager',
      details: `Sabab: ${rejectReason || "Kamchiliklarni to'g'irlash uchun ustaga qaytarildi"}`,
    };

    const updatedOrder = {
      ...order,
      status: 'in_progress',
      reject_reason: rejectReason,
      timeline: [...(order.timeline || []), newTimelineItem],
    };

    const updated = get().orders.map((o) => (o.order_id === orderId ? updatedOrder : o));
    get().save(updated);

    if (factoryId && db) {
      try {
        const docRef = doc(db, 'factories', factoryId, 'production_orders', orderId);
        await updateDoc(docRef, {
          status: 'in_progress',
          reject_reason: rejectReason,
          timeline: updatedOrder.timeline,
        });
      } catch (err) {
        console.error("Firestore rejectAndReturnToCraftsman error:", err);
      }
    }

    return { success: true, order: updatedOrder };
  },

  // Backward compatibility alias
  updateOrderStatus: async (orderId, status) => {
    if (status === 'in_progress') {
      return get().startOrderWork(orderId);
    }
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

  // Backward compatibility alias for completeOrder
  completeOrder: async (params) => {
    return get().reviewAndApproveOrder({
      orderId: params.orderId,
      approvedWeight: params.receivedWeight,
      approvedScrap: params.returnedScrap,
      productName: params.productName,
      sellingPrice: params.sellingPrice,
      category: params.category,
      managerNotes: params.notes,
    });
  },
}));
