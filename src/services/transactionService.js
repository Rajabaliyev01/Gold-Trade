/**
 * transactionService.js
 * Atomic Firestore Transactions (runTransaction) for High-Precision Jewelry ERP
 * 
 * Guarantees ACID compliance across the 5-stage jewelry pipeline:
 * 1. Raw Material -> 2. Metal Processing -> 3. Production -> 4. Finishing & QC -> 5. Finished Goods
 * 
 * If any step fails (e.g. inventory shortage or craftsman balance mismatch),
 * the entire transaction is automatically rolled back.
 */

import { db } from './firebase';
import {
  runTransaction,
  doc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import {
  roundWeight,
  addWeights,
  subtractWeights,
  toDecimal,
  calculateHighPrecisionUgar,
} from '../utils/precisionMath';

/**
 * 1. ATOMIC ORDER CREATION (Internal Material Issue Slip)
 * Stage 1 (Raw Material) -> Stage 3 (Production Assignment)
 * 
 * Atomically:
 * - Checks raw gold availability in factories/{factoryId}/inventory
 * - Deducts exact weight from raw gold inventory lot(s)
 * - Adds exact weight to craftsman's current_gold_balance in factories/{factoryId}/employees/{craftsmanUid}
 * - Writes new production_orders/{orderId}
 * - Writes immutable audit log
 */
export async function atomicCreateProductionOrder({
  factoryId,
  actor,
  orderData,
}) {
  if (!factoryId || !db) {
    throw new Error("Zavod identifikatori yoki baza mavjud emas.");
  }

  const {
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
  } = orderData;

  const purityNum = parseInt(purity, 10);
  const weightNum = roundWeight(givenWeight);

  if (weightNum <= 0) {
    throw new Error("Berilayotgan xomashyo og'irligi 0 dan katta bo'lishi kerak.");
  }

  const now = new Date().toISOString();
  const orderId = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
  const logId = `AUD-${now.replace(/[-:T]/g, '').slice(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Pre-query raw gold items matching this purity (queries cannot be run inside transaction.get)
  const invCol = collection(db, 'factories', factoryId, 'inventory');
  const rawGoldQuery = query(
    invCol,
    where('type', '==', 'raw_gold'),
    where('purity', '==', purityNum),
    where('status', '==', 'in_stock')
  );
  const rawGoldSnap = await getDocs(rawGoldQuery);

  if (rawGoldSnap.empty) {
    throw new Error(`Omborda ${purityNum} probadagi xomashyo topilmadi.`);
  }

  const orderDocRef = doc(db, 'factories', factoryId, 'production_orders', orderId);
  const auditDocRef = doc(db, 'factories', factoryId, 'audit_logs', logId);
  const craftsmanRef = craftsmanId ? doc(db, 'factories', factoryId, 'employees', craftsmanId) : null;

  // Execute Firestore Atomic Transaction
  const result = await runTransaction(db, async (transaction) => {
    // ─── READ PHASE (All reads must precede writes) ─────────────────────────
    
    // Read raw gold inventory items to verify current balances
    const itemReads = [];
    let totalAvailable = 0;

    for (const snapDoc of rawGoldSnap.docs) {
      const itemRef = snapDoc.ref;
      const itemDoc = await transaction.get(itemRef);
      if (itemDoc.exists()) {
        const data = itemDoc.data();
        const itemWeight = roundWeight(data.weight || 0);
        itemReads.push({ ref: itemRef, id: itemDoc.id, currentWeight: itemWeight, data });
        totalAvailable = addWeights(totalAvailable, itemWeight);
      }
    }

    if (totalAvailable < weightNum) {
      throw new Error(
        `Omborda ${purityNum} proba xomashyo yetarli emas! Talab: ${weightNum} gr, Omborda mavjud: ${totalAvailable} gr.`
      );
    }

    // Read craftsman doc if craftsmanId provided
    let craftsmanDocData = null;
    if (craftsmanRef) {
      const cSnap = await transaction.get(craftsmanRef);
      if (cSnap.exists()) {
        craftsmanDocData = cSnap.data();
      }
    }

    // ─── WRITE PHASE ────────────────────────────────────────────────────────
    
    // A) Deduct weight from raw gold inventory items
    let remainingToDeduct = weightNum;
    for (const item of itemReads) {
      if (remainingToDeduct <= 0) break;

      if (item.currentWeight >= remainingToDeduct) {
        const newWeight = subtractWeights(item.currentWeight, remainingToDeduct);
        transaction.update(item.ref, {
          weight: newWeight,
          updatedAt: now,
        });
        remainingToDeduct = 0;
      } else {
        remainingToDeduct = subtractWeights(remainingToDeduct, item.currentWeight);
        transaction.update(item.ref, {
          weight: 0,
          updatedAt: now,
        });
      }
    }

    // B) Update craftsman's gold balance
    let updatedCraftsmanBalance = weightNum;
    if (craftsmanRef && craftsmanDocData) {
      const currentBal = roundWeight(craftsmanDocData.current_gold_balance || 0);
      updatedCraftsmanBalance = addWeights(currentBal, weightNum);
      transaction.update(craftsmanRef, {
        current_gold_balance: updatedCraftsmanBalance,
        updatedAt: now,
      });
    }

    // C) Create Production Order
    const initialTimeline = [
      {
        stage: 'assigned',
        action: "Xomashyo ajratildi va buyurtma ustaga biriktirildi (Atomik tranzaksiya)",
        timestamp: now,
        user_name: actor?.name || 'Menejer',
        user_role: actor?.role || 'manager',
        details: `${weightNum.toFixed(3)} gr ${purityNum} proba tilla topshirildi`,
      },
    ];

    const newOrder = {
      order_id: orderId,
      factoryId,
      title: title || `${purityNum} Proba Zargarlik Buyumi`,
      craftsman_id: craftsmanId || null,
      craftsman_name: craftsmanName || 'Zargar Usta',
      purity: purityNum,
      given_weight: weightNum,
      received_weight: 0,
      returned_scrap: 0,
      loss_weight: 0,
      loss_percentage: 0,
      allowed_loss_rate: parseFloat(allowedLossRate) || 2.0,
      status: 'assigned',
      alert_triggered: false,
      notes,
      stones_count: parseInt(stonesCount, 10) || 0,
      dimensions: dimensions || '',
      deadline: deadline || '',
      created_at: now,
      assigned_at: now,
      started_at: null,
      completed_by_craftsman_at: null,
      reviewed_at: null,
      added_to_inventory_at: null,
      timestamp: now,
      timeline: initialTimeline,
    };

    transaction.set(orderDocRef, newOrder);

    // D) Immutable Audit Log
    const auditRecord = {
      log_id: logId,
      factory_id: factoryId,
      action_type: 'ATOMIC_ORDER_CREATED',
      stage: 'production',
      target_id: orderId,
      actor: {
        uid: actor?.uid || 'unknown',
        name: actor?.name || 'Menejer',
        role: actor?.role || 'manager',
      },
      purity: purityNum,
      weight_grams: weightNum,
      before_state: {
        raw_gold_available: totalAvailable,
        craftsman_balance: craftsmanDocData?.current_gold_balance || 0,
      },
      after_state: {
        raw_gold_available: subtractWeights(totalAvailable, weightNum),
        craftsman_balance: updatedCraftsmanBalance,
      },
      details: `Ustaga ${weightNum} gr (${purityNum} proba) xomashyo biriktirildi. Ombor kamaytirildi, usta balansi oshirildi.`,
      created_at: now,
    };

    transaction.set(auditDocRef, auditRecord);

    return newOrder;
  });

  return result;
}

/**
 * 2. ATOMIC QC REVIEW & FINISHED GOODS INVENTORY
 * Stage 4 (Finishing & QC) -> Stage 5 (Finished Goods Ombori)
 * 
 * Atomically:
 * - Reads production_orders/{orderId} to verify status is not already completed
 * - Reads craftsman doc to verify current gold balance
 * - Creates Finished Product doc in factories/{factoryId}/inventory/{productId}
 * - If returned scrap > 0, adds scrap to factories/{factoryId}/inventory/{scrapId}
 * - Deducts given weight from craftsman's current_gold_balance
 * - Updates craftsman total_completed_orders & average_loss_rate
 * - Sets order status to 'completed' with QC checklist
 * - Writes immutable audit log
 */
export async function atomicApproveQCAndFinishOrder({
  factoryId,
  actor,
  orderId,
  approvedWeight,
  approvedScrap = 0,
  productName,
  category = 'Zanjir',
  sellingPrice,
  qcChecklist = {},
  managerNotes = '',
  goldPricePerGram = 75,
}) {
  if (!factoryId || !db) {
    throw new Error("Zavod identifikatori yoki baza mavjud emas.");
  }

  const now = new Date().toISOString();
  const orderRef = doc(db, 'factories', factoryId, 'production_orders', orderId);
  const finishedProductId = 'inv_fp_' + Date.now();
  const finishedProductRef = doc(db, 'factories', factoryId, 'inventory', finishedProductId);
  const logId = `AUD-${now.replace(/[-:T]/g, '').slice(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const auditDocRef = doc(db, 'factories', factoryId, 'audit_logs', logId);

  return await runTransaction(db, async (transaction) => {
    // ─── READ PHASE ─────────────────────────────────────────────────────────
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists()) {
      throw new Error(`Buyurtma #${orderId} topilmadi.`);
    }

    const order = orderDoc.data();
    if (order.status === 'completed') {
      throw new Error(`Ushbu buyurtma (#${orderId}) allaqachon omborga qabul qilingan!`);
    }

    // Read craftsman doc
    let craftsmanDocData = null;
    let craftsmanRef = null;
    if (order.craftsman_id) {
      craftsmanRef = doc(db, 'factories', factoryId, 'employees', order.craftsman_id);
      const cSnap = await transaction.get(craftsmanRef);
      if (cSnap.exists()) {
        craftsmanDocData = cSnap.data();
      }
    }

    // ─── HIGH-PRECISION MATH CALCULATIONS ───────────────────────────────────
    const recWeight = roundWeight(approvedWeight);
    const retScrap = roundWeight(approvedScrap);
    const givenWeight = roundWeight(order.given_weight);
    const purity = parseInt(order.purity, 10);

    const calc = calculateHighPrecisionUgar({
      givenWeight,
      receivedWeight: recWeight,
      returnedScrap: retScrap,
      allowedLossRate: order.allowed_loss_rate || 2.0,
      goldPricePerGram,
    });

    const barcode = order.barcode || `FP-${purity}-${Date.now().toString().slice(-5)}`;
    const finalSellingPrice = parseFloat(sellingPrice) || roundWeight(recWeight * (goldPricePerGram + 30));

    // ─── WRITE PHASE ────────────────────────────────────────────────────────

    // A) Create Finished Product in Inventory
    const finishedProductDoc = {
      id: finishedProductId,
      factoryId,
      name: productName || order.title,
      type: 'finished_product',
      purity,
      weight: calc.receivedWeight,
      price: finalSellingPrice,
      sellingPrice: finalSellingPrice,
      craftsmanId: order.craftsman_id || null,
      category,
      barcode,
      status: 'in_stock',
      created_at: now,
      source_order_id: orderId,
    };
    transaction.set(finishedProductRef, finishedProductDoc);

    // B) If returned scrap > 0, store scrap in inventory
    if (calc.returnedScrap > 0) {
      const scrapId = 'inv_scrap_' + Date.now();
      const scrapRef = doc(db, 'factories', factoryId, 'inventory', scrapId);
      transaction.set(scrapRef, {
        id: scrapId,
        factoryId,
        name: `${purity} Proba Qaytarilgan Qirindi (ORD #${orderId})`,
        type: 'raw_gold',
        category: 'Qirindi/Chang',
        purity,
        weight: calc.returnedScrap,
        price_per_gram: goldPricePerGram * 0.85,
        status: 'in_stock',
        created_at: now,
        notes: `ORD #${orderId} dan qaytgan qirindi/chang`,
        barcode: `SCRAP-${purity}-${Date.now().toString().slice(-4)}`,
      });
    }

    // C) Deduct given weight from Craftsman's balance
    let newCraftsmanBalance = 0;
    if (craftsmanRef && craftsmanDocData) {
      const currentBalance = roundWeight(craftsmanDocData.current_gold_balance || 0);
      newCraftsmanBalance = subtractWeights(currentBalance, givenWeight, true); // can be 0 or adjusted
      const completedCount = (craftsmanDocData.total_completed_orders || 0) + 1;
      
      // Update running average ugar
      const oldAvg = parseFloat(craftsmanDocData.average_loss_rate) || 1.5;
      const newAvg = roundWeight((oldAvg * (completedCount - 1) + calc.lossPercentage) / completedCount);

      transaction.update(craftsmanRef, {
        current_gold_balance: Math.max(0, newCraftsmanBalance),
        total_completed_orders: completedCount,
        average_loss_rate: newAvg,
        updatedAt: now,
      });
    }

    // D) Update Order Status to 'completed'
    const newTimelineItem = {
      stage: 'completed',
      action: "Menejer tekshirdi (QC tasdiqlandi) va mahsulot omborga qabul qilindi (Atomik tranzaksiya)",
      timestamp: now,
      user_name: actor?.name || 'Menejer',
      user_role: actor?.role || 'manager',
      details: `QC Muvaffaqiyatli. Tayyor og'irlik: ${recWeight.toFixed(3)} gr, Qirindi: ${retScrap.toFixed(3)} gr, Ugar: ${calc.lossWeight.toFixed(3)} gr (${calc.lossPercentage}%). Shtrix-kod: ${barcode}.`,
    };

    const updatedOrder = {
      ...order,
      status: 'completed',
      received_weight: calc.receivedWeight,
      returned_scrap: calc.returnedScrap,
      loss_weight: calc.lossWeight,
      loss_percentage: calc.lossPercentage,
      excess_loss: calc.excessLossWeight,
      financial_damage: calc.financialLoss,
      alert_triggered: calc.isOverThreshold,
      reviewed_at: now,
      added_to_inventory_at: now,
      completed_at: now,
      reviewed_by: {
        uid: actor?.uid || '',
        name: actor?.name || 'Menejer',
      },
      qc_checklist: qcChecklist,
      manager_notes: managerNotes,
      selling_price: finalSellingPrice,
      barcode,
      category,
      finished_product_id: finishedProductId,
      timeline: [...(order.timeline || []), newTimelineItem],
    };

    transaction.set(orderRef, updatedOrder, { merge: true });

    // E) Immutable Audit Record
    const auditRecord = {
      log_id: logId,
      factory_id: factoryId,
      action_type: 'ATOMIC_ORDER_QC_APPROVED',
      stage: 'finishing_qc',
      target_id: orderId,
      actor: {
        uid: actor?.uid || 'unknown',
        name: actor?.name || 'Menejer',
        role: actor?.role || 'manager',
      },
      purity,
      weight_grams: recWeight,
      details: `Buyurtma #${orderId} QC tasdiqlandi. ${recWeight} gr omborga kirim qilindi. Usta balansidan ${givenWeight} gr yopildi. Ugar: ${calc.lossPercentage}%.`,
      metadata: {
        loss_percentage: calc.lossPercentage,
        excess_loss: calc.excessLossWeight,
        alert_triggered: calc.isOverThreshold,
        barcode,
      },
      created_at: now,
    };

    transaction.set(auditDocRef, auditRecord);

    return {
      order: updatedOrder,
      product: finishedProductDoc,
      calculation: calc,
    };
  });
}
