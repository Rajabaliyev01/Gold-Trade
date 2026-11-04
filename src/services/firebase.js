import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Web app Firebase konfiguratsiyasi
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAYcvy_LxkWw89C36yTEOwuY_-Wx9DXU8Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gold-trade-01.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gold-trade-01",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gold-trade-01.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1086686957592",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1086686957592:web:26cd518ce93fc70131b36d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-2N5TBHGM9X"
};

// Firebase konfiguratsiyasi to'g'riligini tekshirish
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "your_project_id"
);

let app = null;
let auth = null;
let db = null;
let storage = null;
let analytics = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Brauzer muhitida Analytics ni xavfsiz initsializatsiya qilish
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      }).catch(() => {});
    }

    console.info("🔥 Firebase muvaffaqiyatli ulandi (Project: gold-trade-01)");
  } catch (err) {
    console.warn("Firebase initsializatsiyasida ogohlantirish:", err);
  }
} else {
  console.info("⚡ Tizim Local/Offline rejimda ishlamoqda.");
}

export { app, auth, db, storage, analytics, firebaseConfig };
