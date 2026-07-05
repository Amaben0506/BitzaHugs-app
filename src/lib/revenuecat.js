import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { scheduleTrialNudges } from "../../utils/notifications";
import { auth, signInUser } from "./firebase";

const REVENUECAT_IOS_API_KEY = "appl_nrdgYpwvNLPBLEIWXHsUpdPYFqy";
const REVENUECAT_ANDROID_API_KEY = "goog_IXzEaPiCbFMcyjVsQsZdcfIPixp";
const REVENUECAT_TEST_STORE_API_KEY = "rcb_OiEbQvrKAMNOPFQTTGSsagxjjMK";
const PREMIUM_ENTITLEMENT_ID = "BitzaHugs Pro";
const PREMIUM_STORAGE_KEY = "bitzaIsPremium";
const PREMIUM_CACHE_KEY = "bitzaPremiumEntitlementCache";

let revenueCatConfigured = false;
let configuredAppUserId = null;

const getRevenueCatApiKey = () => {
  if (__DEV__) return REVENUECAT_TEST_STORE_API_KEY;
  if (Platform.OS === "android") return REVENUECAT_ANDROID_API_KEY;
  return REVENUECAT_IOS_API_KEY;
};

const savePremiumStatus = async (customerInfo) => {
  try {
    const activeEntitlements = customerInfo?.entitlements?.active || {};
    const entitlement = activeEntitlements[PREMIUM_ENTITLEMENT_ID];
    const isPremium = entitlement !== undefined;
    const cache = {
      isPremium,
      checkedAt: new Date().toISOString(),
      entitlementId: PREMIUM_ENTITLEMENT_ID,
      periodType: entitlement?.periodType ?? null,
      expirationDate: entitlement?.expirationDate ?? null,
      willRenew: entitlement?.willRenew ?? null,
      productIdentifier: entitlement?.productIdentifier ?? null,
    };
    await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, isPremium ? "true" : "false");
    await AsyncStorage.setItem(PREMIUM_CACHE_KEY, JSON.stringify(cache));
    return isPremium;
  } catch (error) {
    console.log("Error saving premium status:", error);
    return false;
  }
};

export const configureRevenueCat = () => {
  if (revenueCatConfigured) return;
  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.WARN);
    Purchases.configure({ apiKey: getRevenueCatApiKey() });
    Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
      await savePremiumStatus(customerInfo);
    });
    revenueCatConfigured = true;
  } catch (error) {
    console.log("Error configuring RevenueCat:", error);
  }
};

export const configureRevenueCatForCurrentUser = async () => {
  try {
    const user = auth.currentUser || await signInUser();
    if (!user?.uid) {
      configureRevenueCat();
      return null;
    }

    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.WARN);

    if (!revenueCatConfigured) {
      Purchases.configure({ apiKey: getRevenueCatApiKey(), appUserID: user.uid });
      Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
        await savePremiumStatus(customerInfo);
      });
      revenueCatConfigured = true;
      configuredAppUserId = user.uid;
      return user.uid;
    }

    if (configuredAppUserId !== user.uid) {
      await Purchases.logIn(user.uid);
      configuredAppUserId = user.uid;
      await refreshCustomerInfo();
    }

    return user.uid;
  } catch (error) {
    console.log("Error configuring RevenueCat for Firebase user:", error);
    configureRevenueCat();
    return null;
  }
};

export const refreshCustomerInfo = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = await savePremiumStatus(customerInfo);
    return { customerInfo, isPremium, fromCache: false, error: null };
  } catch (error) {
    console.log("Error refreshing customer info:", error);
    const cached = await checkLocalPremiumStatus();
    return {
      customerInfo: null,
      isPremium: cached,
      fromCache: true,
      error: error?.message || "Could not refresh subscription status.",
    };
  }
};

export const getCurrentOffering = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings?.current || null;
  } catch (error) {
    console.log("Error fetching RevenueCat offerings:", error);
    return null;
  }
};

export const purchasePackage = async (selectedPackage) => {
  try {
    const purchaseResult = await Purchases.purchasePackage(selectedPackage);
    const customerInfo = purchaseResult?.customerInfo;
    const isPremium = await savePremiumStatus(customerInfo);
    const entitlement = customerInfo?.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID];
    if (entitlement?.periodType === "TRIAL") {
      scheduleTrialNudges().catch(() => {});
    }
    return { success: true, customerInfo, isPremium, error: null };
  } catch (error) {
    if (error?.userCancelled) {
      return { success: false, customerInfo: null, isPremium: false, error: "Purchase cancelled." };
    }
    console.log("RevenueCat purchase error:", error);
    return { success: false, customerInfo: null, isPremium: false, error: error?.message || "Purchase failed. Please try again." };
  }
};

export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = await savePremiumStatus(customerInfo);
    return { success: true, customerInfo, isPremium, error: null };
  } catch (error) {
    console.log("Error restoring purchases:", error);
    return { success: false, customerInfo: null, isPremium: false, error: error?.message || "Could not restore purchases." };
  }
};

export const checkLocalPremiumStatus = async () => {
  try {
    const storedValue = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
    return storedValue === "true";
  } catch (error) {
    console.log("Error checking local premium status:", error);
    return false;
  }
};

export const getCachedPremiumEntitlement = async () => {
  try {
    const stored = await AsyncStorage.getItem(PREMIUM_CACHE_KEY);
    if (stored) return JSON.parse(stored);
    return { isPremium: await checkLocalPremiumStatus(), checkedAt: null };
  } catch (error) {
    console.log("Error checking cached premium entitlement:", error);
    return { isPremium: false, checkedAt: null };
  }
};

export { PREMIUM_ENTITLEMENT_ID, PREMIUM_STORAGE_KEY, PREMIUM_CACHE_KEY };
