import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const MIGRATION_KEYS = [
  { asyncKey: "bitzaChildProfile",    firestoreCollection: "childProfile" },
  { asyncKey: "bitzaParentProfile",   firestoreCollection: "parentProfile" },
  { asyncKey: "familyAppMoodHistory", firestoreCollection: "moodHistory" },
  { asyncKey: "bitzaRoutineItems",    firestoreCollection: "routines" },
  { asyncKey: "calmJournalEntries",   firestoreCollection: "journal" },
  { asyncKey: "bitzaAppointments",    firestoreCollection: "appointments" },
  { asyncKey: "bitzaSupportPerson",   firestoreCollection: "supportPerson" },
  { asyncKey: "bitzaChildProfiles",   firestoreCollection: "childProfiles" },
];

function safeParse(value) {
  try { if (!value) return null; return JSON.parse(value); }
  catch (e) { return null; }
}

async function writeToFirestore(uid, collection, data) {
  try {
    const ref = doc(db, "users", uid, collection, "data");
    await setDoc(ref, { data, updatedAt: serverTimestamp(), migratedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (e) {
    console.log("Firestore write error for " + collection + ":", e?.message);
    return false;
  }
}

async function readFromFirestore(uid, collection) {
  try {
    const ref = doc(db, "users", uid, collection, "data");
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data()?.data ?? null;
    return null;
  } catch (e) {
    console.log("Firestore read error for " + collection + ":", e?.message);
    return null;
  }
}

export const migrateLocalDataToFirestore = async (uid) => {
  if (!uid) return { success: false, error: "No user ID provided." };
  console.log("Starting data migration for:", uid);
  const results = [];
  for (const { asyncKey, firestoreCollection } of MIGRATION_KEYS) {
    try {
      const raw = await AsyncStorage.getItem(asyncKey);
      if (!raw) { results.push({ key: asyncKey, status: "skipped — no local data" }); continue; }
      const parsed = safeParse(raw);
      if (!parsed) { results.push({ key: asyncKey, status: "skipped — could not parse" }); continue; }
      const existing = await readFromFirestore(uid, firestoreCollection);
      if (existing) { results.push({ key: asyncKey, status: "skipped — cloud data already exists" }); continue; }
      const success = await writeToFirestore(uid, firestoreCollection, parsed);
      results.push({ key: asyncKey, status: success ? "migrated" : "failed" });
    } catch (e) {
      results.push({ key: asyncKey, status: "error", error: e?.message });
    }
  }
  const migrated = results.filter((r) => r.status === "migrated").length;
  const failed = results.filter((r) => r.status === "failed" || r.status === "error").length;
  console.log("Migration complete:", results);
  return { success: failed === 0, migrated, failed, results };
};

export const syncToFirestore = async (uid, asyncKey) => {
  if (!uid) return false;
  const mapping = MIGRATION_KEYS.find((k) => k.asyncKey === asyncKey);
  if (!mapping) return false;
  try {
    const raw = await AsyncStorage.getItem(asyncKey);
    if (!raw) return false;
    const parsed = safeParse(raw);
    if (!parsed) return false;
    return await writeToFirestore(uid, mapping.firestoreCollection, parsed);
  } catch (e) {
    console.log("Sync error for " + asyncKey + ":", e?.message);
    return false;
  }
};

export const loadFirestoreDataToLocal = async (uid) => {
  if (!uid) return { success: false };
  console.log("Loading Firestore data for:", uid);
  const results = [];
  for (const { asyncKey, firestoreCollection } of MIGRATION_KEYS) {
    try {
      const cloudData = await readFromFirestore(uid, firestoreCollection);
      if (!cloudData) { results.push({ key: asyncKey, status: "skipped — no cloud data" }); continue; }
      await AsyncStorage.setItem(asyncKey, JSON.stringify(cloudData));
      results.push({ key: asyncKey, status: "loaded" });
    } catch (e) {
      results.push({ key: asyncKey, status: "error", error: e?.message });
    }
  }
  const loaded = results.filter((r) => r.status === "loaded").length;
  return { success: true, loaded, results };
};

export const hasCloudData = async (uid) => {
  if (!uid) return false;
  try { const p = await readFromFirestore(uid, "parentProfile"); return !!p; }
  catch (e) { return false; }
};
