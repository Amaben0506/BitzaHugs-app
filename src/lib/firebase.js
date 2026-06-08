import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, getReactNativePersistence, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail, GoogleAuthProvider, OAuthProvider, signInWithCredential } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyA4IgaR-iwft9mMVPX8PgANril8lTtTzAU",
  authDomain: "bitzahugs.firebaseapp.com",
  projectId: "bitzahugs",
  storageBucket: "bitzahugs.firebasestorage.app",
  messagingSenderId: "656339305336",
  appId: "1:656339305336:web:57d74225954a140a0bfe8d"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

let auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch (e) {
  auth = getAuth(app);
}
export { auth };

export const signInUser = async () => {
  try { const c = await signInAnonymously(auth); return c.user; }
  catch (e) { return null; }
};

export const createAccount = async (email, password, displayName) => {
  try {
    const c = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(c.user, { displayName });
    return { user: c.user, error: null };
  } catch (e) { return { user: null, error: getFriendlyError(e.code) }; }
};

export const signInWithEmail = async (email, password) => {
  try {
    const c = await signInWithEmailAndPassword(auth, email, password);
    return { user: c.user, error: null };
  } catch (e) { return { user: null, error: getFriendlyError(e.code) }; }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (e) { return { success: false, error: getFriendlyError(e.code) }; }
};

export const signInWithGoogle = async (idToken) => {
  try {
    const c = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    return { user: c.user, error: null };
  } catch (e) { return { user: null, error: getFriendlyError(e.code) }; }
};

export const signInWithApple = async (identityToken, nonce) => {
  try {
    const p = new OAuthProvider("apple.com");
    const c = await signInWithCredential(auth, p.credential({ idToken: identityToken, rawNonce: nonce }));
    return { user: c.user, error: null };
  } catch (e) { return { user: null, error: getFriendlyError(e.code) }; }
};

export const signOutUser = async () => {
  try { await signOut(auth); return { success: true }; }
  catch (e) { return { success: false }; }
};

export const subscribeToAuthState = (callback) => onAuthStateChanged(auth, callback);
export const getCurrentUser = () => auth.currentUser;

function getFriendlyError(code) {
  const e = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    "auth/invalid-credential": "Incorrect email or password. Please try again.",
  };
  return e[code] || "Something went wrong. Please try again.";
}
