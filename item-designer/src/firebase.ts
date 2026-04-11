import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCgYjvH4LSkEW8IY5boFxKfT1XaKcN6-c",
  authDomain: "typerace-160d3.firebaseapp.com",
  projectId: "typerace-160d3",
  storageBucket: "typerace-160d3.firebasestorage.app",
  messagingSenderId: "233596416640",
  appId: "1:233596416640:web:b71b0781c58bdf98faec65",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
