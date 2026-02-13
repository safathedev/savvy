// RevenueCat integration layer for Savvy.
// Production implementation - all purchases go through RevenueCat SDK.

import { Platform } from "react-native";

// Import RevenueCat SDK
let Purchases: any = null;
let LOG_LEVEL: any = null;
let PURCHASES_ERROR_CODE: any = null;

try {
  const purchasesModule = require("react-native-purchases");
  Purchases = purchasesModule.default || purchasesModule;
  LOG_LEVEL = purchasesModule.LOG_LEVEL;
  PURCHASES_ERROR_CODE = purchasesModule.PURCHASES_ERROR_CODE;
} catch (error) {
  console.error("RevenueCat SDK not available - purchases will not work!", error);
}

// Type definitions for better TypeScript support
export type PurchasesOfferings = any;
export type PurchasesPackage = any;
export type CustomerInfo = any;

// Product identifiers - must match RevenueCat dashboard exactly
export const PRODUCTS = {
  LIFETIME: {
    id: "savvy_lifetime",
    price: "$35.99",
    period: "lifetime",
    description: "One-time payment, unlimited access forever",
  },
  ANNUAL: {
    id: "savvy_annual:p1y",
    price: "$24.99",
    period: "year",
    description: "Renews annually",
  },
  MONTHLY: {
    id: "savvy_monthly:p1m",
    price: "$4.99",
    period: "month",
    description: "Renews monthly",
  },
} as const;

export type ProductType = keyof typeof PRODUCTS;

// RevenueCat configuration - hardcoded for production
const REVENUECAT_ANDROID_API_KEY = "goog_IHFQLPCJgsqyVfavgMAiFJfewIA";
const REVENUECAT_IOS_API_KEY = ""; // Add iOS key when available
const ENTITLEMENT_ID = "Savvy Pro";

let initialized = false;

function getApiKey(): string {
  if (Platform.OS === "ios") return REVENUECAT_IOS_API_KEY;
  if (Platform.OS === "android") return REVENUECAT_ANDROID_API_KEY;
  return "";
}

function hasActiveEntitlement(customerInfo: CustomerInfo): boolean {
  if (!customerInfo) return false;
  return Boolean(customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]);
}

/**
 * Initialize RevenueCat SDK
 */
export async function initializePurchases(): Promise<void> {
  if (initialized) return;

  if (!Purchases) {
    console.error("RevenueCat SDK not loaded - cannot initialize");
    initialized = true;
    return;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("RevenueCat API key missing! Set EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY or EXPO_PUBLIC_REVENUECAT_IOS_API_KEY");
    initialized = true;
    return;
  }

  try {
    if (__DEV__ && LOG_LEVEL) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    await Purchases.configure({ apiKey });

    // Enable automatic collection of Apple Search Ads attribution (iOS only)
    if (Platform.OS === "ios" && Purchases.enableAdServicesAttributionTokenCollection) {
      Purchases.enableAdServicesAttributionTokenCollection();
    }

    initialized = true;
    console.log("RevenueCat initialized successfully with API key");
  } catch (error) {
    console.error("Failed to initialize RevenueCat:", error);
    initialized = true;
  }
}

/**
 * Check if user has active premium subscription via RevenueCat
 */
export async function checkSubscriptionStatus(): Promise<boolean> {
  if (!Purchases) return false;

  try {
    await initializePurchases();
    const customerInfo = await Purchases.getCustomerInfo();
    return hasActiveEntitlement(customerInfo);
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
}

/**
 * Get current offerings from RevenueCat
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  if (!Purchases) return null;

  try {
    await initializePurchases();
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error("Error fetching offerings:", error);
    return null;
  }
}

/**
 * Purchase a package via RevenueCat
 */
export async function purchasePackage(
  packageToPurchase: PurchasesPackage | string
): Promise<{ success: boolean; error?: string; customerInfo?: CustomerInfo }> {
  if (!Purchases) {
    return { success: false, error: "RevenueCat SDK not available" };
  }

  try {
    await initializePurchases();

    let purchaseResult;

    // Handle both PurchasesPackage object and product ID string
    if (typeof packageToPurchase === "string") {
      const offerings = await getOfferings();
      const currentOffering = offerings?.current;

      if (!currentOffering) {
        return { success: false, error: "No offerings available" };
      }

      const packageObj = currentOffering.availablePackages.find(
        (pkg: any) => pkg.identifier === packageToPurchase
      );

      if (!packageObj) {
        return { success: false, error: "Package not found" };
      }

      purchaseResult = await Purchases.purchasePackage(packageObj);
    } else {
      purchaseResult = await Purchases.purchasePackage(packageToPurchase);
    }

    const { customerInfo } = purchaseResult;

    return {
      success: hasActiveEntitlement(customerInfo),
      customerInfo,
      error: hasActiveEntitlement(customerInfo)
        ? undefined
        : "Purchase completed but entitlement not active",
    };
  } catch (error: any) {
    if (PURCHASES_ERROR_CODE && error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { success: false, error: "Purchase cancelled" };
    }

    if (PURCHASES_ERROR_CODE && error.code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
      return { success: false, error: "You already own this product" };
    }

    console.error("Purchase error:", error);
    return {
      success: false,
      error: error?.message || "Purchase failed. Please try again.",
    };
  }
}

/**
 * Restore previous purchases via RevenueCat
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  hasPremium: boolean;
  customerInfo?: CustomerInfo;
}> {
  if (!Purchases) {
    return { success: false, hasPremium: false };
  }

  try {
    await initializePurchases();
    const customerInfo = await Purchases.restorePurchases();

    return {
      success: true,
      hasPremium: hasActiveEntitlement(customerInfo),
      customerInfo,
    };
  } catch (error) {
    console.error("Restore error:", error);
    return { success: false, hasPremium: false };
  }
}

/**
 * Get customer info from RevenueCat
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!Purchases) return null;

  try {
    await initializePurchases();
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error("Error getting customer info:", error);
    return null;
  }
}

/**
 * Set custom user ID (optional - for cross-platform tracking)
 */
export async function identifyUser(userId: string): Promise<void> {
  if (!Purchases) return;

  try {
    await initializePurchases();
    await Purchases.logIn(userId);
  } catch (error) {
    console.error("Error identifying user:", error);
  }
}

/**
 * Log out current user
 */
export async function logoutUser(): Promise<void> {
  if (!Purchases) return;

  try {
    await initializePurchases();
    await Purchases.logOut();
  } catch (error) {
    console.error("Error logging out user:", error);
  }
}

/**
 * Get available products (fallback for display purposes)
 */
export async function getProducts(): Promise<typeof PRODUCTS> {
  return PRODUCTS;
}
