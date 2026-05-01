/**
 * VoteIQ Main Entry Point
 * Handles Firebase initialization and core event listeners.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "DEMO_KEY",
  authDomain: "voteiq.firebaseapp.com",
  projectId: "voteiq",
  storageBucket: "voteiq.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcde",
  measurementId: "G-VOTEIQ2024"
};

try {
  const app = initializeApp(firebaseConfig);
  window.analytics = getAnalytics(app);
  window.db = getFirestore(app);
  
  // Track visit
  addDoc(collection(window.db, "visits"), { 
    timestamp: new Date(),
    userAgent: navigator.userAgent
  }).catch(() => {});

} catch (error) {
  console.warn("Firebase initialization failed:", error);
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW register failed', err));
  });
}
