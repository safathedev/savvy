// RevenueCat integration layer for Savvy.
// Production implementation - all purchases go through RevenueCat SDK.

import { Platform } from "react-native";

// ===== DEBUG LOGGING =====
const RC_DEBUG = true; // Set to false after confirming RevenueCat works
function rcLog(tag: string, ...args: any[]) {
  if (RC_DEBUG) console.log(`[RevenueCat:${tag}]`, ...args);
}
function rcError(tag: string, ...args: any[]) {
  console.error(`[RevenueCat:${tag}]`, ...args);
}

// Import RevenueCat SDK
let Purchases: any = null;
let LOG_LEVEL: any = null;
let PURCHASES_ERROR_CODE: any = null;

try {
  const purchasesModule = require("react-native-purchases");
  Purchases = purchasesModule.default || purchasesModule;
  LOG_LEVEL = purchasesModule.LOG_LEVEL;
  PURCHASES_ERROR_CODE = purchasesModule.PURCHASES_ERROR_CODE;
  rcLog("IMPORT", "SDK loaded successfully. Purchases object:", typeof Purchases);
  rcLog("IMPORT", "Available methods:", Purchases ? Object.keys(Purchases).slice(0, 20).join(", ") : "NONE");
} catch (error) {
  rcError("IMPORT", "SDK FAILED TO LOAD! Purchases will NOT work!", error);
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

  rcLog("ENTITLEMENT", "Looking for entitlement:", ENTITLEMENT_ID);
  rcLog("ENTITLEMENT", "All entitlements:", JSON.stringify(allEntitlements, null, 2));
  rcLog("ENTITLEMENT", "Active entitlements:", JSON.stringify(activeEntitlements, null, 2));

  const isActive = Boolean(activeEntitlements?.[ENTITLEMENT_ID]);
  rcLog("ENTITLEMENT", `"${ENTITLEMENT_ID}" active:`, isActive);

  return isActive;
}

/**
 * Initialize RevenueCat SDK
 */
export async function initializePurchases(): Promise<void> {
  rcLog("INIT", "initializePurchases called. Already initialized:", initialized);

  if (initialized) return;

  if (!Purchases) {
    rcError("INIT", "Purchases SDK is NULL - SDK was not imported! This is a critical error.");
    initialized = true;
    return;
  }

  const apiKey = getApiKey();
  rcLog("INIT", "Platform:", Platform.OS);
  rcLog("INIT", "API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "EMPTY!");

  if (!apiKey) {
    rcError("INIT", "API key is empty! Cannot initialize RevenueCat.");
    initialized = true;
    return;
  }

  try {
    // Always enable debug logging for now to diagnose issues
    if (LOG_LEVEL) {
      rcLog("INIT", "Setting log level to DEBUG");
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    rcLog("INIT", "Calling Purchases.configure()...");
    await Purchases.configure({ apiKey });
    rcLog("INIT", "Purchases.configure() succeeded!");

    // Enable automatic collection of Apple Search Ads attribution (iOS only)
    if (Platform.OS === "ios" && Purchases.enableAdServicesAttributionTokenCollection) {
      Purchases.enableAdServicesAttributionTokenCollection();
    }

    // Verify initialization by getting customer info
    try {
      const info = await Purchases.getCustomerInfo();
      rcLog("INIT", "Customer ID:", info?.originalAppUserId);
      rcLog("INIT", "Active entitlements:", JSON.stringify(info?.entitlements?.active, null, 2));
      rcLog("INIT", "All subscriptions:", JSON.stringify(info?.activeSubscriptions, null, 2));
    } catch (verifyError) {
      rcLog("INIT", "Post-init verification failed (non-fatal):", verifyError);
    }

    initialized = true;
    rcLog("INIT", "RevenueCat initialized successfully!");
  } catch (error) {
    rcError("INIT", "Failed to initialize RevenueCat:", error);
    initialized = true;
  }
}

/**
 * Check if user has active premium subscription via RevenueCat
 */
export async function checkSubscriptionStatus(): Promise<boolean> {
  rcLog("STATUS", "checkSubscriptionStatus called. Purchases available:", !!Purchases);

  if (!Purchases) return false;

  try {
    await initializePurchases();
    const customerInfo = await Purchases.getCustomerInfo();
    rcLog("STATUS", "Got customer info for:", customerInfo?.originalAppUserId);
    const result = hasActiveEntitlement(customerInfo);
    rcLog("STATUS", "Premium status:", result);
    return result;
  } catch (error) {
    rcError("STATUS", "Error checking subscription status:", error);
    return false;
  }
}

/**
 * Get current offerings from RevenueCat
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  rcLog("OFFERINGS", "getOfferings called. Purchases available:", !!Purchases);

  if (!Purchases) {
    rcError("OFFERINGS", "Purchases SDK is null - cannot load offerings");
    return null;
  }

  try {
    await initializePurchases();
    rcLog("OFFERINGS", "Fetching offerings from RevenueCat...");
    const offerings = await Purchases.getOfferings();

    rcLog("OFFERINGS", "Current offering:", offerings?.current?.identifier ?? "NONE");
    rcLog("OFFERINGS", "Available packages count:", offerings?.current?.availablePackages?.length ?? 0);

    if (offerings?.current?.availablePackages) {
      offerings.current.availablePackages.forEach((pkg: any, i: number) => {
        rcLog("OFFERINGS", `Package ${i}:`, {
          identifier: pkg.identifier,
          packageType: pkg.packageType,
          productId: pkg.product?.identifier,
          price: pkg.product?.priceString,
          title: pkg.product?.title,
        });
      });
    } else {
      rcLog("OFFERINGS", "No current offering or no packages available!");
      rcLog("OFFERINGS", "Full offerings response:", JSON.stringify(offerings, null, 2));
    }

    return offerings;
  } catch (error) {
    rcError("OFFERINGS", "Error fetching offerings:", error);
    return null;
  }
}

/**
 * Purchase a package via RevenueCat
 */
export async function purchasePackage(
  packageToPurchase: PurchasesPackage | string
): Promise<{ success: boolean; error?: string; customerInfo?: CustomerInfo }> {
  rcLog("PURCHASE", "purchasePackage called");
  rcLog("PURCHASE", "Package type:", typeof packageToPurchase);
  rcLog("PURCHASE", "Package value:", typeof packageToPurchase === "string"
    ? packageToPurchase
    : { identifier: packageToPurchase?.identifier, packageType: packageToPurchase?.packageType, productId: packageToPurchase?.product?.identifier }
  );

  if (!Purchases) {
    rcError("PURCHASE", "Purchases SDK is null - cannot process purchase!");
    return { success: false, error: "RevenueCat SDK not available" };
  }

  try {
    await initializePurchases();

    let purchaseResult;

    if (typeof packageToPurchase === "string") {
      rcLog("PURCHASE", "String ID provided, looking up package in offerings...");
      const offerings = await getOfferings();
      const currentOffering = offerings?.current;

      if (!currentOffering) {
        rcError("PURCHASE", "No current offering available!");
        return { success: false, error: "No offerings available" };
      }

      const packageObj = currentOffering.availablePackages.find(
        (pkg: any) => pkg.identifier === packageToPurchase
      );

      if (!packageObj) {
        rcError("PURCHASE", "Package not found for ID:", packageToPurchase);
        rcLog("PURCHASE", "Available IDs:", currentOffering.availablePackages.map((p: any) => p.identifier));
        return { success: false, error: "Package not found" };
      }

      rcLog("PURCHASE", "Found package, calling Purchases.purchasePackage()...");
      purchaseResult = await Purchases.purchasePackage(packageObj);
    } else {
      rcLog("PURCHASE", "Package object provided, calling Purchases.purchasePackage()...");
      purchaseResult = await Purchases.purchasePackage(packageToPurchase);
    }

    rcLog("PURCHASE", "purchasePackage() returned!");
    rcLog("PURCHASE", "Purchase result keys:", Object.keys(purchaseResult || {}));

    const { customerInfo } = purchaseResult;
    rcLog("PURCHASE", "Customer ID after purchase:", customerInfo?.originalAppUserId);
    rcLog("PURCHASE", "Active subscriptions:", JSON.stringify(customerInfo?.activeSubscriptions, null, 2));
    rcLog("PURCHASE", "Non-subscription transactions:", JSON.stringify(customerInfo?.nonSubscriptionTransactions, null, 2));

    const isEntitled = hasActiveEntitlement(customerInfo);
    rcLog("PURCHASE", "Has entitlement after purchase:", isEntitled);

    return {
      success: isEntitled,
      customerInfo,
      error: isEntitled
        ? undefined
        : "Purchase completed but entitlement not active. Check RevenueCat entitlement name matches: " + ENTITLEMENT_ID,
    };
  } catch (error: any) {
    rcError("PURCHASE", "Purchase error! Code:", error?.code, "Message:", error?.message);
    rcError("PURCHASE", "Full error:", JSON.stringify(error, null, 2));

    if (PURCHASES_ERROR_CODE && error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      rcLog("PURCHASE", "User cancelled purchase");
      return { success: false, error: "Purchase cancelled" };
    }

    if (PURCHASES_ERROR_CODE && error.code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
      rcLog("PURCHASE", "Product already purchased");
      return { success: false, error: "You already own this product" };
    }

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
  rcLog("RESTORE", "restorePurchases called. Purchases available:", !!Purchases);

  if (!Purchases) {
    rcError("RESTORE", "Purchases SDK is null");
    return { success: false, hasPremium: false };
  }

  try {
    await initializePurchases();
    rcLog("RESTORE", "Calling Purchases.restorePurchases()...");
    const customerInfo = await Purchases.restorePurchases();

    rcLog("RESTORE", "Restore completed. Customer ID:", customerInfo?.originalAppUserId);
    rcLog("RESTORE", "Active entitlements:", JSON.stringify(customerInfo?.entitlements?.active, null, 2));

    const hasPremium = hasActiveEntitlement(customerInfo);
    rcLog("RESTORE", "Has premium after restore:", hasPremium);

    return {
      success: true,
      hasPremium,
      customerInfo,
    };
  } catch (error) {
    rcError("RESTORE", "Restore error:", error);
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
    rcLog("INFO", "Customer info:", customerInfo?.originalAppUserId);
    return customerInfo;
  } catch (error) {
    rcError("INFO", "Error getting customer info:", error);
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
    rcError("IDENTIFY", "Error identifying user:", error);
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
    rcError("LOGOUT", "Error logging out user:", error);
  }
}

/**
 * Get available products (fallback for display purposes)
 */
export async function getProducts(): Promise<typeof PRODUCTS> {
  return PRODUCTS;
}
