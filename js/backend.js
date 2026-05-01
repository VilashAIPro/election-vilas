/**
 * VoteIQ Backend — Firebase Integration Layer
 * 
 * This module provides a fully-integrated backend using:
 *   - Firebase Authentication (Google Sign-In)
 *   - Cloud Firestore (User data, quiz scores, feedback, visits)
 *   - Google Analytics (User actions)
 * 
 * Architecture:
 *   AuthService    → manages sign-in / sign-out / state
 *   DataService    → manages all Firestore reads & writes
 *   UserProfile    → persists user data after auth
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// ————— FIREBASE CONFIGURATION —————
const firebaseConfig = {
  apiKey: "AIzaSyBDCVfC6mzoUBWGrbqh53QaavbH53cMByc",
  authDomain: "election-process-94bdd.firebaseapp.com",
  projectId: "election-process-94bdd",
  storageBucket: "election-process-94bdd.appspot.com",
  messagingSenderId: "835043282672",
  appId: "1:835043282672:web:voteiq",
  measurementId: "G-VOTEIQ2024"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ————— AUTH SERVICE —————
export const AuthService = {
  /**
   * Signs in the user with a Google popup.
   * On success, saves their profile to Firestore.
   * @returns {Promise<import("firebase/auth").User>}
   */
  async signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    await UserProfile.createOrUpdate(result.user);
    logEvent(analytics, 'login', { method: 'google' });
    return result.user;
  },

  /** Signs out the current user. */
  async signOut() {
    await signOut(auth);
    logEvent(analytics, 'logout');
  },

  /**
   * Listens for auth state changes.
   * @param {function} callback - Called with (user | null)
   */
  onStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  /** Returns the currently signed-in user or null. */
  currentUser() {
    return auth.currentUser;
  }
};

// ————— USER PROFILE SERVICE —————
export const UserProfile = {
  /**
   * Creates a Firestore user document on first login, or updates
   * the `lastLogin` timestamp on subsequent logins.
   * @param {import("firebase/auth").User} user
   */
  async createOrUpdate(user) {
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // New user — create a full profile document
      await setDoc(ref, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        quizzesTaken: 0,
        bestScore: 0,
        feedbackCount: 0
      });
    } else {
      // Returning user — update last login
      await updateDoc(ref, { lastLogin: serverTimestamp() });
    }
  },

  /**
   * Retrieves the profile of a user by their UID.
   * @param {string} uid
   * @returns {Promise<Object|null>}
   */
  async get(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  }
};

// ————— DATA SERVICE —————
export const DataService = {
  /**
   * Saves a quiz result to Firestore and updates the user's best score.
   * @param {number} score
   * @param {number} total
   */
  async saveQuizResult(score, total) {
    const user = auth.currentUser;
    const percentage = Math.round((score / total) * 100);

    // Always save the raw attempt
    await addDoc(collection(db, 'quiz_results'), {
      uid: user ? user.uid : 'anonymous',
      score,
      total,
      percentage,
      timestamp: serverTimestamp()
    });

    // Update the user's personal best if logged in
    if (user) {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const updates = {
          quizzesTaken: increment(1)
        };
        if (percentage > (data.bestScore || 0)) {
          updates.bestScore = percentage;
        }
        await updateDoc(ref, updates);
      }
    }

    logEvent(analytics, 'quiz_complete', { score, total, percentage });
  },

  /**
   * Submits user feedback to Firestore.
   * @param {string} feedbackText
   * @param {number} rating - 1 to 5
   */
  async submitFeedback(feedbackText, rating) {
    const user = auth.currentUser;
    await addDoc(collection(db, 'feedback'), {
      uid: user ? user.uid : 'anonymous',
      displayName: user ? user.displayName : 'Guest',
      text: feedbackText,
      rating,
      timestamp: serverTimestamp()
    });
    logEvent(analytics, 'feedback_submitted', { rating });
  },

  /**
   * Logs a page/section visit to Firestore for analytics.
   * @param {string} section - e.g. 'quiz', 'timeline', 'overview'
   */
  async logVisit(section) {
    await addDoc(collection(db, 'visits'), {
      uid: auth.currentUser ? auth.currentUser.uid : 'anonymous',
      section,
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent
    });
    logEvent(analytics, 'page_section_view', { section });
  }
};

// ————— UI CONNECTOR —————
// Bridges the backend services to the existing UI globals in app.js

/**
 * Updates the nav bar to reflect the authenticated user.
 * @param {import("firebase/auth").User|null} user
 */
function updateNavForUser(user) {
  const btn = document.getElementById('btnSignIn');
  if (!btn) return;

  if (user) {
    btn.textContent = user.displayName ? user.displayName.split(' ')[0] : 'Signed In';
    btn.style.background = '#10B981';
    btn.onclick = () => AuthService.signOut();
    btn.setAttribute('aria-label', `Signed in as ${user.displayName}. Click to sign out.`);
  } else {
    btn.textContent = 'Sign In';
    btn.style.background = '';
    btn.disabled = false;
    btn.onclick = () => AuthService.signInWithGoogle().catch(console.warn);
    btn.setAttribute('aria-label', 'Sign in with Google');
  }
}

// Listen for auth state and update UI automatically
AuthService.onStateChange(updateNavForUser);

// Expose backend services to app.js via the global window object
window.VoteIQBackend = {
  AuthService,
  UserProfile,
  DataService
};

// Log a visit on page load
DataService.logVisit('home').catch(() => {});

// Expose signIn globally for backwards-compatible HTML onclick calls
window.signIn = () => AuthService.signInWithGoogle().catch(console.warn);
