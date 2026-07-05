import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './firebase'; // side effect: initializes the Firebase app with our config

const db = getFirestore();
const auth = getAuth();

// Ensure user is signed in anonymously
export const ensureAuth = async (): Promise<string> => {
  if (auth.currentUser) return auth.currentUser.uid;
  const result = await signInAnonymously(auth);
  return result.user.uid;
};

// Save caregiver profile
export const saveCaregiverProfile = async (profile: object) => {
  try {
    const uid = await ensureAuth();
    await setDoc(doc(db, 'users', uid, 'profile', 'caregiver'), {
      ...profile,
      updatedAt: serverTimestamp(),
    });
    await AsyncStorage.setItem('bitzaParentProfile', JSON.stringify(profile));
  } catch (e) {
    console.log('saveCaregiverProfile error:', e);
    await AsyncStorage.setItem('bitzaParentProfile', JSON.stringify(profile));
  }
};

// Save child profile
export const saveChildProfile = async (profile: object) => {
  try {
    const uid = await ensureAuth();
    await setDoc(doc(db, 'users', uid, 'profile', 'child'), {
      ...profile,
      updatedAt: serverTimestamp(),
    });
    await AsyncStorage.setItem('bitzaChildProfile', JSON.stringify(profile));
  } catch (e) {
    console.log('saveChildProfile error:', e);
    await AsyncStorage.setItem('bitzaChildProfile', JSON.stringify(profile));
  }
};

// Save support preferences
export const saveSupportPrefs = async (prefs: object) => {
  try {
    const uid = await ensureAuth();
    await setDoc(doc(db, 'users', uid, 'preferences', 'support'), {
      ...prefs,
      updatedAt: serverTimestamp(),
    });
    await AsyncStorage.setItem('bitzaSupportPrefs', JSON.stringify(prefs));
  } catch (e) {
    console.log('saveSupportPrefs error:', e);
    await AsyncStorage.setItem('bitzaSupportPrefs', JSON.stringify(prefs));
  }
};

// Save caregiver mood
export const saveCaregiverMood = async (mood: string, note: string) => {
  try {
    const uid = await ensureAuth();
    const today = new Date().toISOString().split('T')[0];
    await setDoc(doc(db, 'users', uid, 'moods', 'caregiver', 'entries', today), {
      mood,
      note,
      time: serverTimestamp(),
    });
    await AsyncStorage.setItem('bitzaCaregiverMood', JSON.stringify({ mood, note, time: new Date().toISOString() }));
  } catch (e) {
    console.log('saveCaregiverMood error:', e);
    await AsyncStorage.setItem('bitzaCaregiverMood', JSON.stringify({ mood, note, time: new Date().toISOString() }));
  }
};

// Save child mood
export const saveChildMood = async (mood: string, note: string) => {
  try {
    const uid = await ensureAuth();
    const today = new Date().toISOString().split('T')[0];
    await setDoc(doc(db, 'users', uid, 'moods', 'child', 'entries', today), {
      mood,
      note,
      time: serverTimestamp(),
    });
    await AsyncStorage.setItem('bitzaChildMood', JSON.stringify({ mood, note, time: new Date().toISOString() }));
  } catch (e) {
    console.log('saveChildMood error:', e);
    await AsyncStorage.setItem('bitzaChildMood', JSON.stringify({ mood, note, time: new Date().toISOString() }));
  }
};

// Load caregiver profile (Firestore first, AsyncStorage fallback)
export const loadCaregiverProfile = async () => {
  try {
    const uid = await ensureAuth();
    const snap = await getDoc(doc(db, 'users', uid, 'profile', 'caregiver'));
    if (snap.exists()) {
      const data = snap.data();
      await AsyncStorage.setItem('bitzaParentProfile', JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.log('loadCaregiverProfile falling back to AsyncStorage:', e);
  }
  const local = await AsyncStorage.getItem('bitzaParentProfile');
  return local ? JSON.parse(local) : null;
};

// Load child profile (Firestore first, AsyncStorage fallback)
export const loadChildProfile = async () => {
  try {
    const uid = await ensureAuth();
    const snap = await getDoc(doc(db, 'users', uid, 'profile', 'child'));
    if (snap.exists()) {
      const data = snap.data();
      await AsyncStorage.setItem('bitzaChildProfile', JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.log('loadChildProfile falling back to AsyncStorage:', e);
  }
  const local = await AsyncStorage.getItem('bitzaChildProfile');
  return local ? JSON.parse(local) : null;
};