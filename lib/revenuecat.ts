// RevenueCat integration layer for Savvy.
// Modern implementation with Paywalls and Customer Center support.

import { Platform } from "react-native";

// Conditional import - only load in production
let Purchases: any = null;
let LOG_LEVEL: any = null;
let PURCHASES_ERROR_CODE: any = null;

const DUMMY_MODE = process.env.EXPO_PUBLIC_REVENUECAT_DUMMY !== "false";

if (!DUMMY_MODE) {
  try {
    const purchasesModule = require("react-native-purchases");
    Purchases = purchasesModule.default || purchasesModule;
    LOG_LEVEL = purchasesModule.LOG_LEVEL;
    PURCHASES_ERROR_CODE = purchasesModule.PURCHASES_ERROR_CODE;
  } catch (error) {
    console.warn("RevenueCat SDK not available, using dummy mode");
  }
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

const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || "Savvy Pro";

let initialized = false;
let mockPremiumState = false;

function getApiKey(): string {
  if (Platform.OS === "ios") return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || "";
  if (Platform.OS === "android") return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || "";
  return "";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasActiveEntitlement(customerInfo: CustomerInfo): boolean {
  if (DUMMY_MODE) return mockPremiumState;
  if (!customerInfo) return false;
  return Boolean(customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]);
}

/**
 * Initialize RevenueCat SDK with best practices
 */
export async function initializePurchases(): Promise<void> {
  if (initialized) return;

  if (DUMMY_MODE || !Purchases) {
    initialized = true;
    console.log("RevenueCat initialized in dummy mode");
    return;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("RevenueCat API key missing. Falling back to dummy mode.");
    initialized = true;
    return;
  }

  try {
    // Configure SDK with proper logging for development
    if (__DEV__ && LOG_LEVEL) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Initialize SDK
    await Purchases.configure({ apiKey });

    // Enable automatic collection of Apple Search Ads attribution (iOS only)
    if (Platform.OS === "ios" && Purchases.enableAdServicesAttributionTokenCollection) {
      Purchases.enableAdServicesAttributionTokenCollection();
    }

    initialized = true;
    console.log("RevenueCat initialized successfully");
  } catch (error) {
    console.error("Failed to initialize RevenueCat:", error);
    initialized = true; // Mark as initialized to prevent retry loops
  }
}

/**
 * Check if user has active premium subscription
 */
export async function checkSubscriptionStatus(): Promise<boolean> {
  if (DUMMY_MODE || !Purchases) return mockPremiumState;

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
  if (DUMMY_MODE || !Purchases) return null;

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
 * Purchase a package
 */
export async function purchasePackage(
  packageToPurchase: PurchasesPackage | string
): Promise<{ success: boolean; error?: string; customerInfo?: CustomerInfo }> {
  if (DUMMY_MODE || !Purchases) {
    await delay(1200);
    mockPremiumState = true;
    return { success: true };
  }

  try {
    await initializePurchases();

    let purchaseResult;
    
    // Handle both PurchasesPackage object and product ID string
    if (typeof packageToPurchase === "string") {
      // If string ID provided, find the package in offerings
      const offerings = await getOfferings();
      const currentOffering = offerings?.current;
      
      if (!currentOffering) {
        return { success: false, error: "No offerings available" };
      }

      // Find package by identifier
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
    // Handle specific error cases
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
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  hasPremium: boolean;
  customerInfo?: CustomerInfo;
}> {
  if (DUMMY_MODE || !Purchases) {
    await delay(800);
    return { success: true, hasPremium: mockPremiumState };
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
 * Get customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (DUMMY_MODE || !Purchases) return null;

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
  if (DUMMY_MODE || !Purchases) return;

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
  if (DUMMY_MODE || !Purchases) return;

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
