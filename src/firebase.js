import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, getDocs } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-mode',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const isDemo = !import.meta.env.VITE_FIREBASE_API_KEY;

let app = null;
let db = null;

if (!isDemo) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) {
    console.warn('Firebase init failed, running in demo mode:', e);
  }
}

export { db, isDemo };
export { collection, addDoc, query, where, orderBy, onSnapshot, getDocs };
