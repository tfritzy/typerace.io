import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCCgYjvH4LSkEW8IY5boFxKfT1XaKcN6-c",
  authDomain: "typerace-160d3.firebaseapp.com",
  projectId: "typerace-160d3",
  storageBucket: "typerace-160d3.firebasestorage.app",
  messagingSenderId: "233596416640",
  appId: "1:233596416640:web:b71b0781c58bdf98faec65"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export function waitForAuth(): Promise<User> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          unsubscribe();
          reject(error);
        }
      }
    });
  });
}
