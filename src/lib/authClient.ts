import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDfJf4fJfJfJfJfJfJfJfJfJfJfJfJfJfJf",
  authDomain: "myapp-12345.firebaseapp.com",
  projectId: "myapp-12345",
  storageBucket: "myapp-12345.appspot.com",
  appId: "1:12345:web:12345",
  measurementId: "G-12345"
};

const auth = getAuth();
const firestore = getFirestore();
const storage = getStorage();
const analytics = getAnalytics();

// Google provider
const provider = new GoogleAuthProvider();

// Sign in with Google
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Get user data from Firestore
export async function getUserData(uid) {
  const userDoc = doc(firestore, 'users', uid);
  const userSnapshot = await getDoc(userDoc);
  return userSnapshot.data();
}

// Verify user on server
export async function verifyOnServer(user) {
  const idToken = await user.getIdToken();
  const res = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}