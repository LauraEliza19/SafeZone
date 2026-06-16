import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyA2O32NhLD6ihzFk1u96DraqNIk_8VwA0Q',
  authDomain: 'safezone-d2c2f.firebaseapp.com',
  projectId: 'safezone-d2c2f',
  storageBucket: 'safezone-d2c2f.firebasestorage.app',
  messagingSenderId: '981904022626',
  appId: '1:981904022626:web:8013aef233563ac637053b',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
