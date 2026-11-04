/**
 * Firestore BaaS bilan sinxronizatsiya servisi (gold-trade-01)
 * NoSQL kolleksiyalari: users, inventory, production_orders, transactions
 */

import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  INITIAL_USERS, 
  INITIAL_INVENTORY, 
  INITIAL_PRODUCTION_ORDERS, 
  INITIAL_TRANSACTIONS 
} from './mockData';

export const isFirebaseLive = () => {
  return Boolean(isFirebaseConfigured && db);
};

// 1. Kolleksiyaga yangi hujjat qo'shish yoki yangilash
export const saveDocToFirestore = async (collectionName, docId, data) => {
  if (!isFirebaseLive()) return null;
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    console.warn(`Firestore [${collectionName}/${docId}] yozishda xatolik:`, error);
    return false;
  }
};

// 2. Kolleksiyadagi barcha ma'lumotlarni o'qish
export const getCollectionFromFirestore = async (collectionName) => {
  if (!isFirebaseLive()) return null;
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const items = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  } catch (error) {
    console.warn(`Firestore [${collectionName}] o'qishda xatolik:`, error);
    return null;
  }
};

// 3. Boshlang'ich ma'lumotlarni Firestore bazasiga yuklash (Seeding)
export const seedInitialDataToFirestore = async () => {
  if (!isFirebaseLive()) {
    return { success: false, error: "Firebase ulanmagan" };
  }

  try {
    // A. Users
    for (const user of INITIAL_USERS) {
      await setDoc(doc(db, 'users', user.uid), user, { merge: true });
    }

    // B. Inventory
    for (const item of INITIAL_INVENTORY) {
      await setDoc(doc(db, 'inventory', item.id), item, { merge: true });
    }

    // C. Production Orders
    for (const order of INITIAL_PRODUCTION_ORDERS) {
      await setDoc(doc(db, 'production_orders', order.order_id), order, { merge: true });
    }

    // D. Transactions
    for (const tx of INITIAL_TRANSACTIONS) {
      await setDoc(doc(db, 'transactions', tx.transaction_id), tx, { merge: true });
    }

    return {
      success: true,
      message: "Boshlang'ich ma'lumotlar Firestore (gold-trade-01) bazasiga muvaffaqiyatli yuklandi!",
    };
  } catch (error) {
    console.error("Firestore ga boshlang'ich ma'lumotlarni yuklashda xatolik:", error);
    return { success: false, error: error.message };
  }
};
