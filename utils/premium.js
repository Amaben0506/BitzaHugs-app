import AsyncStorage from "@react-native-async-storage/async-storage";

const PREMIUM_KEY = "bitzaIsPremium";

export const checkIsPremium = async () => {
  try {
    const value = await AsyncStorage.getItem(PREMIUM_KEY);
    return value === "true";
  } catch (e) {
    return false;
  }
};

export const setPremium = async (value) => {
  try {
    await AsyncStorage.setItem(PREMIUM_KEY, value ? "true" : "false");
  } catch (e) {
    console.log("Error setting premium:", e);
  }
};

export const clearPremium = async () => {
  try {
    await AsyncStorage.removeItem(PREMIUM_KEY);
  } catch (e) {
    console.log("Error clearing premium:", e);
  }
};