// RevenueCat integration layer for Savvy.
// Production implementation - all purchases go through RevenueCat SDK.

import { Alert, Platform } from "react-native";

// ===== DEBUG LOGGING =====
const RC_DEBUG = true; // Set to false after confirming RevenueCat works

function rcLog(tag: string, ...args: any[]) {
  if (RC_DEBUG) console.log(`[RC:${tag}]`, ...args);
}

function rcError(tag: string, ...args: any[]) {
  console.error(`[RC:${tag}]`, ...args);
}

// Show visible alert for critical debug info (remove after testing!)
function rcAlert(title: string, message: string) {
  if (RC_DEBUG) {
    Alert.alert(`[RC Debug] ${title}`, message);
  }
}

// ===== IMPORT RevenueCat SDK =====
let Purchases: any = null;
let LOG_LEVEL: any = null;
let PURCHASES_ERROR_CODE: any = null;

try {
  const purchasesModule = require("react-native-purchases");
  Purchases = purchasesModule.default || purchasesModule;
  LOG_LEVEL = purchasesModule.LOG_LEVEL;
  PURCHASES_ERROR_CODE = purchasesModule.PURCHASES_ERROR_CODE;
  rcLog("IMPORT", "SDK loaded. Type:", typeof Purchases, "Is null:", Purchases === null);
} catch (error: any) {
  rcError("IMPORT", "SDK FAILED TO LOAD!", error?.message);
  // This will happen in Expo Go - native module not available
}

// Type definitions
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
let configureSucceeded = false;

function getApiKey(): string {
  if (Platform.OS === "ios") return REVENUECAT_IOS_API_KEY;
  if (Platform.OS === "android") return REVENUECAT_ANDROID_API_KEY;
  return "";
}

function hasActiveEntitlement(customerInfo: CustomerInfo): boolean {
  if (!customerInfo) {
    rcLog("ENTITLEMENT", "customerInfo is null/undefined");
    return false;
  }

  const allEntitlements = customerInfo?.entitlements?.all;
  const activeEntitlements = customerInfo?.entitlements?.active;

  rcLog("ENTITLEMENT", "Looking for:", ENTITLEMENT_ID);
  rcLog("ENTITLEMENT", "All:", JSON.stringify(allEntitlements));
  rcLog("ENTITLEMENT", "Active:", JSON.stringify(activeEntitlements));

  const isActive = Boolean(activeEntitlements?.[ENTITLEMENT_ID]);
  rcLog("ENTITLEMENT", "Result:", isActive);

  return isActive;
}

/**
 * Initialize RevenueCat SDK
 */
export async function initializePurchases(): Promise<void> {
  if (initialized) {
    rcLog("INIT", "Already initialized. configure succeeded:", configureSucceeded);
    return;
  }

  rcLog("INIT", "Starting initialization...");
  rcLog("INIT", "Purchases SDK available:", !!Purchases);
  rcLog("INIT", "Platform:", Platform.OS);

  if (!Purchases) {
    rcError("INIT", "SDK NOT AVAILABLE! Are you running in Expo Go? Need a dev/production build!");
    rcAlert("SDK Not Available", "react-native-purchases is not loaded. You need a development or production build (not Expo Go).");
    initialized = true;
    return;
  }

  const apiKey = getApiKey();
  rcLog("INIT", "API Key:", apiKey ? `${apiKey.substring(0, 15)}...` : "EMPTY!");

  if (!apiKey) {
    rcError("INIT", "API key is empty!");
    rcAlert("No API Key", `No API key for platform: ${Platform.OS}`);
    initialized = true;
    return;
  }

  try {
    // Enable DEBUG logging in RevenueCat SDK itself
    if (LOG_LEVEL) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      rcLog("INIT", "Log level set to DEBUG");
    }

    rcLog("INIT", "Calling Purchases.configure({ apiKey })...");
    Purchases.configure({ apiKey });
    configureSucceeded = true;
    rcLog("INIT", "configure() completed!");

    // Verify by fetching customer info
    try {
      const info = await Purchases.getCustomerInfo();
      rcLog("INIT", "Verification - Customer ID:", info?.originalAppUserId);
      rcLog("INIT", "Verification - Active entitlements:", JSON.stringify(info?.entitlements?.active));
    } catch (e: any) {
      rcLog("INIT", "Verification failed (non-fatal):", e?.message);
    }

    initialized = true;
    rcLog("INIT", "SUCCESS! RevenueCat is ready.");
  } catch (error: any) {
    rcError("INIT", "FAILED:", error?.message, error);
    rcAlert("Init Failed", `RevenueCat configure() failed: ${error?.message}`);
    initialized = true;
  }
}

/**
 * Check if user has active premium subscription via RevenueCat
 */
export async function checkSubscriptionStatus(): Promise<boolean> {
  rcLog("STATUS", "Checking. SDK available:", !!Purchases, "Configured:", configureSucceeded);

  if (!Purchases || !configureSucceeded) return false;

  try {
    await initializePurchases();
    const customerInfo = await Purchases.getCustomerInfo();
    return hasActiveEntitlement(customerInfo);
  } catch (error: any) {
    rcError("STATUS", "Error:", error?.message);
    return false;
  }
}

/**
 * Get current offerings from RevenueCat
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  rcLog("OFFERINGS", "Getting offerings. SDK:", !!Purchases, "Configured:", configureSucceeded);

  if (!Purchases) {
    rcAlert("No SDK", "Cannot load offerings - SDK not available");
    return null;
  }

  try {
    await initializePurchases();

    if (!configureSucceeded) {
      rcAlert("Not Configured", "SDK loaded but configure() failed - cannot fetch offerings");
      return null;
    }

    rcLog("OFFERINGS", "Calling Purchases.getOfferings()...");
    const offerings = await Purchases.getOfferings();

    const pkgCount = offerings?.current?.availablePackages?.length ?? 0;
    rcLog("OFFERINGS", "Current offering:", offerings?.current?.identifier ?? "NONE");
    rcLog("OFFERINGS", "Package count:", pkgCount);

    if (pkgCount === 0) {
      rcAlert("No Packages",
        `Offerings loaded but no packages found!\n` +
        `Current offering: ${offerings?.current?.identifier ?? "NONE"}\n` +
        `All offerings: ${JSON.stringify(Object.keys(offerings?.all ?? {}))}\n\n` +
        `Check RevenueCat dashboard:\n1. Is there a current offering?\n2. Are products added to it?\n3. Are products active in Google Play?`
      );
    } else {
      const pkgInfo = offerings.current.availablePackages.map(
        (p: any) => `${p.identifier} (${p.packageType}) - ${p.product?.priceString}`
      ).join("\n");
      rcLog("OFFERINGS", "Packages:\n" + pkgInfo);
    }

    return offerings;
  } catch (error: any) {
    rcError("OFFERINGS", "Error:", error?.message, error);
    rcAlert("Offerings Error", `Failed to load offerings: ${error?.message}`);
    return null;
  }
}

/**
 * Purchase a package via RevenueCat
 */
export async function purchasePackage(
  packageToPurchase: PurchasesPackage | string
): Promise<{ success: boolean; error?: string; customerInfo?: CustomerInfo }> {
  const pkgInfo = typeof packageToPurchase === "string"
    ? packageToPurchase
    : `${packageToPurchase?.identifier} (${packageToPurchase?.packageType})`;

  rcLog("PURCHASE", "Starting purchase for:", pkgInfo);
  rcLog("PURCHASE", "SDK:", !!Purchases, "Configured:", configureSucceeded);

  if (!Purchases) {
    rcAlert("Purchase Failed", "RevenueCat SDK not available. Build the app with EAS, not Expo Go.");
    return { success: false, error: "RevenueCat SDK not available. Use a production build." };
  }

  if (!configureSucceeded) {
    rcAlert("Purchase Failed", "RevenueCat not configured. Check API key.");
    return { success: false, error: "RevenueCat not configured" };
  }

  try {
    await initializePurchases();

    let purchaseResult;

    if (typeof packageToPurchase === "string") {
      rcLog("PURCHASE", "Looking up package by ID:", packageToPurchase);
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

      rcLog("PURCHASE", "Calling Purchases.purchasePackage() with found package...");
      purchaseResult = await Purchases.purchasePackage(packageObj);
    } else {
      rcLog("PURCHASE", "Calling Purchases.purchasePackage() with package object...");
      rcLog("PURCHASE", "Product ID:", packageToPurchase?.product?.identifier);
      purchaseResult = await Purchases.purchasePackage(packageToPurchase);
    }

    rcLog("PURCHASE", "purchasePackage() returned successfully!");

    const { customerInfo } = purchaseResult;
    rcLog("PURCHASE", "Customer ID:", customerInfo?.originalAppUserId);
    rcLog("PURCHASE", "Active subs:", JSON.stringify(customerInfo?.activeSubscriptions));
    rcLog("PURCHASE", "Non-sub transactions:", JSON.stringify(customerInfo?.nonSubscriptionTransactions));

    const isEntitled = hasActiveEntitlement(customerInfo);

    if (!isEntitled) {
      rcAlert("Purchase Note",
        `Payment went through but entitlement "${ENTITLEMENT_ID}" is NOT active.\n\n` +
        `Active entitlements: ${JSON.stringify(customerInfo?.entitlements?.active)}\n\n` +
        `Check RevenueCat dashboard: Is "${ENTITLEMENT_ID}" linked to the product?`
      );
    }

    return {
      success: isEntitled,
      customerInfo,
      error: isEntitled ? undefined : `Entitlement "${ENTITLEMENT_ID}" not active after purchase`,
    };
  } catch (error: any) {
    rcError("PURCHASE", "Error:", error?.code, error?.message);

    if (PURCHASES_ERROR_CODE && error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { success: false, error: "Purchase cancelled" };
    }

    if (PURCHASES_ERROR_CODE && error.code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
      return { success: false, error: "You already own this product" };
    }

    rcAlert("Purchase Error", `Code: ${error?.code}\nMessage: ${error?.message}`);

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
  rcLog("RESTORE", "Starting. SDK:", !!Purchases, "Configured:", configureSucceeded);

  if (!Purchases || !configureSucceeded) {
    return { success: false, hasPremium: false };
  }

  try {
    await initializePurchases();
    const customerInfo = await Purchases.restorePurchases();
    const hasPremium = hasActiveEntitlement(customerInfo);
    rcLog("RESTORE", "Result:", hasPremium);

    return { success: true, hasPremium, customerInfo };
  } catch (error: any) {
    rcError("RESTORE", "Error:", error?.message);
    return { success: false, hasPremium: false };
  }
}

/**
 * Get customer info from RevenueCat
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!Purchases || !configureSucceeded) return null;

  try {
    await initializePurchases();
    return await Purchases.getCustomerInfo();
  } catch (error: any) {
    rcError("INFO", "Error:", error?.message);
    return null;
  }
}

/**
 * Set custom user ID
 */
export async function identifyUser(userId: string): Promise<void> {
  if (!Purchases || !configureSucceeded) return;
  try {
    await initializePurchases();
    await Purchases.logIn(userId);
  } catch (error: any) {
    rcError("IDENTIFY", "Error:", error?.message);
  }
}

/**
 * Log out current user
 */
export async function logoutUser(): Promise<void> {
  if (!Purchases || !configureSucceeded) return;
  try {
    await initializePurchases();
    await Purchases.logOut();
  } catch (error: any) {
    rcError("LOGOUT", "Error:", error?.message);
  }
}

/**
 * Get available products (fallback for display purposes)
 */
export async function getProducts(): Promise<typeof PRODUCTS> {
  return PRODUCTS;
}
