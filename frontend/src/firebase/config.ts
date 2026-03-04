import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const isFirebaseEnabled = import.meta.env.VITE_USE_FIREBASE_AUTH === 'true';

const firebaseConfig = {
  apiKey: "AIzaSyCCgYjvH4LSkEW8IY5boFxKfT1XaKcN6-c",
  authDomain: "typerace-160d3.firebaseapp.com",
  projectId: "typerace-160d3",
  storageBucket: "typerace-160d3.firebasestorage.app",
  messagingSenderId: "233596416640",
  appId: "1:233596416640:web:b71b0781c58bdf98faec65"
};

export const app = isFirebaseEnabled ? initializeApp(firebaseConfig) : null;
export const auth = isFirebaseEnabled && app ? getAuth(app) : null;
