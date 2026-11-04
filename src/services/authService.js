/**
 * authService.js
 * Firebase Auth helpers for factory owners (Google & Email) and employees (username/password)
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Secondary Firebase Auth instance for creating employee accounts
// without signing out the currently logged-in factory owner
function getSecondaryAuth() {
  const existingApp = getApps().find((a) => a.name === 'SecondaryApp');
  const app = existingApp || initializeApp(firebaseConfig, 'SecondaryApp');
  return getAuth(app);
}

/**
 * Sign in a factory owner via Google Popup with automatic redirect fallback
 */
export async function signInWithGoogle() {
  // On mobile or small touch screens, popups are frequently blocked by Safari/Chrome;
  // Use redirect directly for seamless mobile experience.
  const isMobile = typeof window !== 'undefined' && (
    window.innerWidth < 768 || 
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  );

  if (isMobile) {
    return signInWithGoogleRedirect();
  }

  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err) {
    console.warn("signInWithPopup error code:", err.code, err.message);

    if (err.code === 'auth/popup-closed-by-user') {
      throw new Error("Google oynasi yopildi. Qaytadan urinib ko'ring.");
    }

    if (err.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'ushbu domen';
      throw new Error(
        `Firebase ruxsat bermadi: "${currentHost}" domeni Firebase Console'da ro'yxatdan o'tmagan. Iltimos, Firebase Console -> Authentication -> Settings -> Authorized domains bo'limiga "${currentHost}" domenini qo'shing.`
      );
    }

    // Popup was blocked or cross-origin policy blocked the window -> use redirect fallback
    if (
      err.code === 'auth/popup-blocked' ||
      err.code === 'auth/cancelled-popup-request' ||
      err.code === 'auth/internal-error' ||
      (err.message && err.message.includes('Cross-Origin-Opener-Policy'))
    ) {
      console.info("Popup blocked or COOP error. Falling back to signInWithRedirect...");
      return await signInWithGoogleRedirect();
    }

    throw new Error(err.message || "Google orqali kirishda xatolik yuz berdi.");
  }
}

/**
 * Direct Google Redirect sign in (bypasses all COOP and popup blocker restrictions)
 */
export async function signInWithGoogleRedirect() {
  try {
    return await signInWithRedirect(auth, googleProvider);
  } catch (err) {
    if (err.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'ushbu domen';
      throw new Error(
        `"${currentHost}" domeni Firebase Console'da ruxsat berilgan domenlar ro'yxatiga kiritilmagan. Firebase Console -> Authentication -> Settings -> Authorized domains ga ushbu domenni qo'shing.`
      );
    }
    throw err;
  }
}

/**
 * Check if returning from a Google redirect
 */
export async function checkGoogleRedirectResult() {
  try {
    return await getRedirectResult(auth);
  } catch (err) {
    console.warn("getRedirectResult warning:", err);
    return null;
  }
}

/**
 * Factory owner Email/Password registration (fallback for environments blocking Google OAuth)
 */
export async function registerFactoryWithEmail(email, password, factoryName, ownerName) {
  if (!email || !password) {
    throw new Error("Email va parolni kiriting.");
  }
  if (password.length < 6) {
    throw new Error("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  const factoryData = {
    name: factoryName || 'Zargarlik Zavodi',
    ownerName: ownerName || 'Zavod Egasi',
    email,
    ownerUid: uid,
    createdAt: new Date().toISOString(),
    allowedUgarRate: 2.0,
  };

  await setDoc(doc(db, 'factories', uid), factoryData);
  return { user: cred.user, factoryData };
}

/**
 * Factory owner Email/Password login
 */
export async function signInFactoryWithEmail(email, password) {
  if (!email || !password) {
    throw new Error("Email va parolni kiriting.");
  }
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      throw new Error("Kiritilgan email yoki parol noto'g'ri.");
    }
    if (err.code === 'auth/user-not-found') {
      throw new Error("Bunday email bilan zavod egasi topilmadi.");
    }
    throw new Error(err.message || "Kirishda xatolik yuz berdi.");
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
