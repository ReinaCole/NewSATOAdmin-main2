// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCAavAwIuxSXUp2vpEEt4YLnvqgRq67q0",
  authDomain: "adminpage-f9686.firebaseapp.com",
  projectId: "adminpage-f9686",
  storageBucket: "adminpage-f9686.firebasestorage.app",
  messagingSenderId: "8079081540",
  appId: "1:8079081540:web:5a0c61502f5f3f569ebc11",
  measurementId: "G-WGZW4JHK10"
};

// Initialize Firebase only in browser to avoid SSR errors
let app = null;
let auth = null;
let db = null;

if (typeof window !== "undefined") {
  if (!getApps().length) app = initializeApp(firebaseConfig);
  else app = getApps()[0];

  auth = getAuth(app);
  // DO NOT call signInAnonymously(auth) here — remove any auto-signin
  db = getFirestore(app);
}

export { app, auth, db };