/**
 * authService.js
 * Firebase Auth helpers for factory owners (Google) and employees (username/password)
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  getAuth,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firebaseConfig, auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();

// Secondary Firebase Auth instance for creating employee accounts
// without signing out the currently logged-in factory owner
function getSecondaryAuth() {
  const existingApp = getApps().find((a) => a.name === 'SecondaryApp');
  const app = existingApp || initializeApp(firebaseConfig, 'SecondaryApp');
  return getAuth(app);
}

/**
 * Sign in a factory owner via Google popup.
 */
export async function signInWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err) {
    if (err.code === 'auth/popup-closed-by-user') {
      throw new Error("Google oynasi yopildi. Qaytadan urinib ko'ring.");
    }
    if (err.code === 'auth/operation-not-allowed') {
      throw new Error(
        "Google bilan kirish Firebase Console'da yoqilmagan. Firebase Console -> Authentication -> Sign-in method bo'limidan Google provayderini yoqing."
      );
    }
    throw new Error(err.message || "Google orqali kirishda xatolik yuz berdi.");
  }
}

/**
 * Create a new employee account for a given factory.
 */
export async function createEmployeeAccount(factoryId, { name, username, password, role, phone }) {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

  if (!cleanUsername) {
    throw new Error("Foydalanuvchi nomi noto'g'ri (faqat lotin harflari, raqamlar va pastki chiziq).");
  }

  if (!password || password.length < 6) {
    throw new Error("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
  }

  // 1. Check if username is already taken
  const indexRef = doc(db, 'employees_index', cleanUsername);
  const indexSnap = await getDoc(indexRef);
  if (indexSnap.exists()) {
    throw new Error(`"${cleanUsername}" foydalanuvchi nomi band. Boshqa nom tanlang.`);
  }

  // Auth email format: username.factoryId@goldtrade.uz
  const authEmail = `${cleanUsername}.${factoryId.toLowerCase()}@goldtrade.uz`;

  // 2. Create Firebase Auth user in secondary auth (keeps factory owner signed in)
  const secAuth = getSecondaryAuth();
  let credential;
  try {
    credential = await createUserWithEmailAndPassword(secAuth, authEmail, password);
    await signOut(secAuth);
  } catch (err) {
    if (err.code === 'auth/operation-not-allowed') {
      throw new Error(
        "Email/Password autentifikatsiyasi Firebase Console'da yoqilmagan. Firebase Console -> Authentication -> Sign-in method bo'limidan Email/Password ni yoqing."
      );
    }
    if (err.code === 'auth/email-already-in-use') {
      throw new Error(`Ushbu foydalanuvchi nomi allaqachon ro'yxatdan o'tgan.`);
    }
    throw err;
  }

  const uid = credential.user.uid;

  const employeeDoc = {
    uid,
    name: name.trim(),
    username: cleanUsername,
    role: role || 'craftsman',
    phone: phone || '',
    status: true,
    current_gold_balance: 0,
    average_loss_rate: 1.5,
    total_completed_orders: 0,
    factoryId,
    createdAt: new Date().toISOString(),
  };

  // 3. Store in factories/{factoryId}/employees/{uid}
  await setDoc(doc(db, 'factories', factoryId, 'employees', uid), employeeDoc);

  // 4. Store in employees_index for O(1) login lookup
  await setDoc(doc(db, 'employees_index', cleanUsername), {
    factoryId,
    authEmail,
    uid,
  });

  // 5. Store in employees_uid_index for O(1) onAuthStateChanged lookup
  await setDoc(doc(db, 'employees_uid_index', uid), {
    factoryId,
  });

  return employeeDoc;
}

/**
 * Sign in as an employee using username + password.
 */
export async function signInAsEmployee(username, password) {
  const cleanUsername = username.trim().toLowerCase();

  if (!cleanUsername) {
    throw new Error("Foydalanuvchi nomini (login) kiriting.");
  }
  if (!password) {
    throw new Error("Parolni kiriting.");
  }

  // 1. Look up the employee index to find their authEmail
  const indexRef = doc(db, 'employees_index', cleanUsername);
  let indexSnap;
  try {
    indexSnap = await getDoc(indexRef);
  } catch (err) {
    console.error("Firestore lookup error:", err);
    throw new Error("Server bilan aloqa uzildi. Internet aloqasini tekshiring.");
  }

  if (!indexSnap.exists()) {
    throw new Error(`Bunday foydalanuvchi nomi (@${username}) topilmadi. Loginni tekshirib qayta kiriting.`);
  }

  const { authEmail, factoryId, uid } = indexSnap.data();

  // 2. Check employee status
  try {
    const empRef = doc(db, 'factories', factoryId, 'employees', uid);
    const empSnap = await getDoc(empRef);
    if (empSnap.exists() && empSnap.data().status === false) {
      throw new Error("Sizning hisobingiz nofaol qilingan. Zavod ma'muriyatiga murojaat qiling.");
    }
  } catch (e) {
    if (e.message && e.message.includes('nofaol')) throw e;
  }

  // 3. Sign in with Firebase Auth
  try {
    return await signInWithEmailAndPassword(auth, authEmail, password);
  } catch (err) {
    console.warn("Firebase Auth signIn error:", err.code);
    if (
      err.code === 'auth/wrong-password' || 
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/invalid-login-credentials'
    ) {
      throw new Error("Kiritilgan parol noto'g'ri! Iltimos, parolni qaytadan tekshiring.");
    }
    if (err.code === 'auth/user-not-found') {
      throw new Error("Hodim hisobi topilmadi. Zavod egasiga murojaat qiling.");
    }
    if (err.code === 'auth/too-many-requests') {
      throw new Error("Urinishlar soni ko'payib ketdi. Iltimos, birozdan keyin qayta urinib ko'ring.");
    }
    throw new Error(err.message || "Kirishda xatolik yuz berdi.");
  }
}

/**
 * Sign out the current Firebase Auth user.
 */
export async function signOutUser() {
  return signOut(auth);
}
