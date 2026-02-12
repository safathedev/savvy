// RevenueCat integration layer for Savvy.
// Default behavior stays in dummy mode until EXPO_PUBLIC_REVENUECAT_DUMMY is set to "false".

import { Platform } from "react-native";

// Keep prices aligned with the paywall UI.
export const PRODUCTS = {
  MONTHLY: {
    id: "savvy_monthly",
    price: "\u00a31.99",
    period: "month",
    pricePerMonth: "\u00a31.99",
  },
  ANNUAL: {
    id: "savvy_annual",
    price: "\u00a314.99",
    period: "year",
    pricePerMonth: "\u00a31.25",
    savings: "37%",
  },
} as const;

export type ProductType = keyof typeof PRODUCTS;

type PurchasesModule = {
  configure: (params: { apiKey: string }) => Promise<void> | void;
  getCustomerInfo: () => Promise<any>;
  purchaseProduct: (productId: string) => Promise<any>;
  restorePurchases: () => Promise<any>;
  getOfferings?: () => Promise<any>;
};

const DUMMY_MODE = process.env.EXPO_PUBLIC_REVENUECAT_DUMMY !== "false";
const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || "premium";

let purchasesCache: PurchasesModule | null | undefined;
let initialized = false;
let mockPremiumState = false;

function getApiKey(): string {
  if (Platform.OS === "ios") return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || "";
  if (Platform.OS === "android") return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || "";
  return "";
}

function loadPurchasesModule(): PurchasesModule | null {
  if (purchasesCache !== undefined) return purchasesCache;

  try {
    // Avoid hard dependency while this project still runs in dummy mode.
    const runtimeRequire = eval("require");
    const module = runtimeRequire("react-native-purchases");
    purchasesCache = (module?.default ?? module) as PurchasesModule;
  } catch {
    purchasesCache = null;
  }

  return purchasesCache;
}

function hasActiveEntitlement(customerInfo: any): boolean {
  return Boolean(customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Initialize RevenueCat SDK (real mode) or dummy mode.
 */
export async function initializePurchases(): Promise<void> {
  if (initialized) return;

  if (DUMMY_MODE) {
    initialized = true;
    console.log("RevenueCat initialized in dummy mode");
    return;
  }

  const purchases = loadPurchasesModule();
  const apiKey = getApiKey();

  if (!purchases || !apiKey) {
    console.warn(
      "RevenueCat SDK/key missing. Falling back to dummy mode. " +
        "Set EXPO_PUBLIC_REVENUECAT_DUMMY=false and provide platform API keys."
    );
    initialized = true;
    return;
  }

  await purchases.configure({ apiKey });
  initialized = true;
}

/**
 * Check if user has active subscription.
 */
export async function checkSubscriptionStatus(): Promise<boolean> {
  if (DUMMY_MODE) return mockPremiumState;

  try {
    await initializePurchases();
    const purchases = loadPurchasesModule();
    if (!purchases) return false;
    const customerInfo = await purchases.getCustomerInfo();
    return hasActiveEntitlement(customerInfo);
  } catch {
    return false;
  }
}

/**
 * Purchase a subscription package.
 */
export async function purchasePackage(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  if (DUMMY_MODE) {
    await delay(1200);
    mockPremiumState = true;
    return { success: true };
  }

  try {
    await initializePurchases();
    const purchases = loadPurchasesModule();
    if (!purchases) return { success: false, error: "Purchases SDK not available" };

    const result = await purchases.purchaseProduct(productId);
    const customerInfo = result?.customerInfo ?? result;
    return {
      success: hasActiveEntitlement(customerInfo),
      error: hasActiveEntitlement(customerInfo) ? undefined : "Purchase completed but entitlement not active",
    };
  } catch (error: any) {
    const message =
      error?.userCancelled === true
        ? "Purchase cancelled"
        : error?.message || "Purchase failed";
    return { success: false, error: message };
  }
}

/**
 * Restore previous purchases.
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  hasPremium: boolean;
}> {
  if (DUMMY_MODE) {
    await delay(800);
    return { success: true, hasPremium: mockPremiumState };
  }

  try {
    await initializePurchases();
    const purchases = loadPurchasesModule();
    if (!purchases) return { success: false, hasPremium: false };

    const customerInfo = await purchases.restorePurchases();
    return { success: true, hasPremium: hasActiveEntitlement(customerInfo) };
  } catch {
    return { success: false, hasPremium: false };
  }
}

/**
 * Get available products.
 * In real mode you can later map offerings into this shape.
 */
export async function getProducts(): Promise<typeof PRODUCTS> {
  return PRODUCTS;
}
