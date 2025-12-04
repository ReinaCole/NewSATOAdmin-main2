// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

  
// firestore ni gail
apiKey: "AIzaSyDfQ7p3pTkC-0IPg0_hQhofcdz1SDQUGxM",
authDomain: "sato-ai-b64a2.firebaseapp.com",
projectId: "sato-ai-b64a2",
 storageBucket: "sato-ai-b64a2.firebasestorage.app",
messagingSenderId: "385603776948",
 appId: "1:385603776948:web:822bfc5f94261e36b482e1",
 measurementId: "G-6ND50VWJ87"


//firestore ni kian
//apiKey: "AIzaSyBCAavAwIuxSXUp2vpEEt4YLnvqgRq67q0",
// authDomain: "adminpage-f9686.firebaseapp.com",
//projectId: "adminpage-f9686",
//storageBucket: "adminpage-f9686.firebasestorage.app",
// messagingSenderId: "8079081540",
// appId: "1:8079081540:web:5a0c61502f5f3f569ebc11",
// measurementId: "G-WGZW4JHK10"
 
};

// Initialize Firebase only in browser to avoid SSR errors
let app = null;
let auth = null;
let db = null;
let storage = null;

if (typeof window !== "undefined") {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

  auth = getAuth(app);       // Auth ready, but no auto-signin
  db = getFirestore(app);    // Firestore ready
  storage = getStorage(app); // Storage ready
}

export { app, auth, db, storage };