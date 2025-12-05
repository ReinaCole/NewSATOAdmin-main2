// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Use Vite env vars so you can switch projects without editing source
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBCAavAwIuxSXUp2vpEEt4YLnvqgRq67q0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "adminpage-f9686.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "adminpage-f9686",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "adminpage-f9686.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "8079081540",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:8079081540:web:5a0c61502f5f3f569ebc11",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WGZW4JHK10"
};

// Initialize Firebase only in browser to avoid SSR errors
let app = null;
let auth = null;
let db = null;

if (typeof window !== "undefined") {
  if (!getApps().length) app = initializeApp(firebaseConfig);
  else app = getApps()[0];

  // debug: confirm which Firebase project is connected
  console.log("Firebase projectId:", (app as any)?.options?.projectId ?? firebaseConfig.projectId);

  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };