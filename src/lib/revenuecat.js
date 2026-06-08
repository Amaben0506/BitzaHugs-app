import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * RevenueCat SDK API Keys
 *
 * iOS App Store key = used by Apple/TestFlight/release iOS builds
 * Android Play Store key = used by Android release builds
 * Test Store key = used only while running in development mode
 */
const REVENUECAT_IOS_API_KEY = "appl_nrdgYpwvNLPBLEIWXHsUpdPYFqy";
const REVENUECAT_ANDROID_API_KEY = "goog_IXzEaPiCbFMcyjVsQsZdcfIPixp";
const REVENUECAT_TEST_STORE_API_KEY = "rcb_OiEbQvrKAMNOPFQTTGSsagxjjMK";

/**
 * This MUST match the RevenueCat entitlement identifier exactly.
 * Your RevenueCat screenshot shows the entitlement identifier is:
 * BitzaHugs Pro
 */
const PREMIUM_ENTITLEMENT_ID = "BitzaHugs Pro";

/**
 * Local storage key for premium access
 */
const PREMIUM_STORAGE_KEY = "bitzaIsPremium";

let revenueCatConfigured = false;

const getRevenueCatApiKey = () => {
  if (__DEV__) {
    return REVENUECAT_TEST_STORE_API_KEY;
  }

  if (Platform.OS === "ios") {
    return REVENUECAT_IOS_API_KEY;
  }

  if (Platform.OS === "android") {
    return REVENUECAT_ANDROID_API_KEY;
  }

  return REVENUECAT_IOS_API_KEY;
};

const savePremiumStatus = async (customerInfo) => {
  try {
    const activeEntitlements = customerInfo?.entitlements?.active || {};

    const isPremium =
      activeEntitlements[PREMIUM_ENTITLEMENT_ID] !== undefined ||
      activeEntitlements.premium !== undefined;

    await AsyncStorage.setItem(
      PREMIUM_STORAGE_KEY,
      isPremium ? "true" : "false"
    );

    return isPremium;
  } catch (error) {
    console.log("Error saving premium status:", error);
    return false;
  }
};

export const configureRevenueCat = () => {
  if (revenueCatConfigured) {
    return;
  }

  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.WARN);

    Purchases.configure({
      apiKey: getRevenueCatApiKey(),
    });

    Purchases.addCustomerInfoUpdateListener(async (customerInfo) => {
      await savePremiumStatus(customerInfo);
    });

    revenueCatConfigured = true;
  } catch (error) {
    console.log("Error configuring RevenueCat:", error);
  }
};

export const refreshCustomerInfo = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = await savePremiumStatus(customerInfo);

    return {
      customerInfo,
      isPremium,
    };
  } catch (error) {
    console.log("Error refreshing customer info:", error);

    return {
      customerInfo: null,
      isPremium: false,
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

    return {
      success: true,
      customerInfo,
      isPremium,
      error: null,
    };
  } catch (error) {
    if (error?.userCancelled) {
      return {
        success: false,
        customerInfo: null,
        isPremium: false,
        error: "Purchase cancelled.",
      };
    }

    console.log("RevenueCat purchase error:", error);

    return {
      success: false,
      customerInfo: null,
      isPremium: false,
      error: error?.message || "Purchase failed. Please try again.",
    };
  }
};

export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = await savePremiumStatus(customerInfo);

    return {
      success: true,
      customerInfo,
      isPremium,
      error: null,
    };
  } catch (error) {
    console.log("Error restoring purchases:", error);

    return {
      success: false,
      customerInfo: null,
      isPremium: false,
      error: error?.message || "Could not restore purchases.",
    };
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
