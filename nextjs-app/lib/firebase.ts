import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCCgYjvH4LSkEW8IY5boFxKfT1XaKcN6-c",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "typerace-160d3.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "typerace-160d3",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "typerace-160d3.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "233596416640",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:233596416640:web:b71b0781c58bdf98faec65"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
