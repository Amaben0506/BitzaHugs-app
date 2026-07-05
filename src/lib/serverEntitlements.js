import { getFunctions, httpsCallable } from "firebase/functions";
import { app, auth } from "./firebase";

const functions = getFunctions(app);

export const syncServerPremiumEntitlement = async () => {
  if (!auth.currentUser?.uid) {
    return { ok: false, reason: "not_authenticated" };
  }

  try {
    const callable = httpsCallable(functions, "syncRevenueCatEntitlement");
    const result = await callable();
    return { ok: true, data: result.data };
  } catch (error) {
    console.log("Server entitlement sync failed:", error?.message || error);
    return {
      ok: false,
      reason: error?.code || "sync_failed",
      message: error?.message || "Could not sync subscription status.",
    };
  }
};
