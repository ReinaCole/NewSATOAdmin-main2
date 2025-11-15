// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);