import { hatchRadius, hatchShadows, hatchSpacing } from "@/constants/theme";
import { useApp } from "@/lib/app-context";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  PRODUCTS,
  PurchasesPackage,
} from "@/lib/revenuecat";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const premiumFeatures = [
  {
    icon: "school",
    title: "16 extra Academy lessons",
    description: "Unlock Intermediate + Advanced (24 lessons total).",
  },
  {
    icon: "bar-chart",
    title: "Deeper money insights",
    description: "Track trends, planned costs, and goal progress with more detail.",
  },
  {
    icon: "sparkles",
    title: "Custom calendar categories",
    description: "Create personal categories for your family routine.",
  },
  {
    icon: "notifications",
    title: "Priority reminder tools",
    description: "More reminder options and premium planning nudges as features roll out.",
  },
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setPremium } = useApp();

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);

  // Load offerings from RevenueCat
  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      console.log("[Paywall] Loading offerings from RevenueCat...");
      const offerings = await getOfferings();
      console.log("[Paywall] Offerings result:", offerings ? "received" : "NULL");
      console.log("[Paywall] Current offering:", offerings?.current?.identifier ?? "NONE");

      if (offerings?.current) {
        const availablePackages = offerings.current.availablePackages;
        console.log("[Paywall] Available packages:", availablePackages.length);
        availablePackages.forEach((pkg: any, i: number) => {
          console.log(`[Paywall] Package ${i}: id=${pkg.identifier} type=${pkg.packageType} price=${pkg.product?.priceString}`);
        });
        setPackages(availablePackages);

        // Auto-select lifetime package if available, else first package
        const lifetimePackage = availablePackages.find(
          (pkg: any) => pkg.identifier === "savvy_lifetime" || pkg.packageType === "LIFETIME"
        );
        setSelectedPackage(lifetimePackage ?? availablePackages[0] ?? null);
        console.log("[Paywall] Selected package:", (lifetimePackage ?? availablePackages[0])?.identifier);
      } else {
        console.log("[Paywall] No current offering! Offerings object:", JSON.stringify(offerings));
      }
    } catch (error) {
      console.error("[Paywall] Error loading offerings:", error);
      Alert.alert("Error", "Could not load subscription options. Please try again.");
    } finally {
      setIsLoadingOfferings(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert("Error", "Please select a plan.");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      console.log("[Paywall] Starting purchase for:", selectedPackage.identifier, selectedPackage.packageType);
      const { success, error } = await purchasePackage(selectedPackage);
      console.log("[Paywall] Purchase result: success=", success, "error=", error);

      if (!success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Purchase failed", error || "Please try again.");
        return;
      }

      // Purchase succeeded through RevenueCat - update local state
      console.log("[Paywall] Purchase succeeded! Setting premium to true.");
      await setPremium(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success!", "Welcome to Savvy Premium!");
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Purchase failed", "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const restored = await restorePurchases();
      if (restored.success && restored.hasPremium) {
        await setPremium(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success!", "Your purchases have been restored.");
        router.back();
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "No active premium found",
        "We could not find an active premium subscription to restore."
      );
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Restore failed", "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format price from package (uses real price from RevenueCat)
  const formatPrice = (pkg: PurchasesPackage): string => {
    return pkg.product?.priceString ?? "";
  };

  // Get package display name
  const getPackageName = (pkg: PurchasesPackage): string => {
    if (pkg.packageType === "MONTHLY" || pkg.identifier?.includes("monthly")) {
      return "Monthly";
    }
    if (pkg.packageType === "ANNUAL" || pkg.identifier?.includes("annual")) {
      return "Annual";
    }
    if (pkg.packageType === "LIFETIME" || pkg.identifier?.includes("lifetime")) {
      return "Lifetime";
    }
    return pkg.identifier ?? "Premium";
  };

  // Get package description
  const getPackageDescription = (pkg: PurchasesPackage): string => {
    if (pkg.packageType === "MONTHLY" || pkg.identifier?.includes("monthly")) {
      return "Renews every month";
    }
    if (pkg.packageType === "ANNUAL" || pkg.identifier?.includes("annual")) {
      return "Renews every year";
    }
    if (pkg.packageType === "LIFETIME" || pkg.identifier?.includes("lifetime")) {
      return "Pay once, own forever";
    }
    return pkg.product?.description || "Premium access";
  };

  // Check if package is a subscription (monthly or annual)
  const isSubscription = (pkg: PurchasesPackage): boolean => {
    return pkg.packageType === "MONTHLY" || pkg.packageType === "ANNUAL" ||
           pkg.identifier?.includes("monthly") || pkg.identifier?.includes("annual");
  };

  return (
    <View style={s.container}>
      <LinearGradient
        colors={["#F0FFF7", "#FFFDF5", "#F7FAFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close premium screen"
        onPress={() => router.back()}
        style={[s.closeButton, { top: insets.top + 8 }]}
      >
        <Ionicons name="close" size={22} color="#374151" />
      </Pressable>

      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: insets.top + 56, paddingBottom: 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(60).duration(350)} style={s.header}>
          <Text style={s.title}>Savvy Premium</Text>
          <Text style={s.subtitle}>
            More guidance, deeper planning, and a calmer path for your family finances.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(110).duration(350)} style={s.featuresCard}>
          {premiumFeatures.map((feature, index) => (
            <View key={feature.title} style={[s.featureRow, index === premiumFeatures.length - 1 && s.featureRowLast]}>
              <View style={s.featureIconWrap}>
                <Ionicons name={feature.icon as any} size={18} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.featureTitle}>{feature.title}</Text>
                <Text style={s.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {isLoadingOfferings ? (
          <Animated.View entering={FadeInDown.delay(150).duration(350)} style={s.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={s.loadingText}>Loading plans...</Text>
          </Animated.View>
        ) : packages.length > 0 ? (
          <>
            <Animated.View entering={FadeInDown.delay(150).duration(350)} style={s.planSection}>
              {packages.map((pkg) => {
                const isSelected = selectedPackage?.identifier === pkg.identifier;
                return (
                  <Pressable
                    key={pkg.identifier}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${getPackageName(pkg)} plan`}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedPackage(pkg);
                    }}
                    style={[s.planCard, isSelected && s.planCardSelected]}
                  >
                    <View style={s.planLeft}>
                      <Text style={s.planTitle}>{getPackageName(pkg)}</Text>
                      <Text style={s.planPrice}>
                        {formatPrice(pkg)}
                        {pkg.packageType === "MONTHLY" && <Text style={s.planPeriod}> / month</Text>}
                        {pkg.packageType === "ANNUAL" && <Text style={s.planPeriod}> / year</Text>}
                      </Text>
                      <Text style={s.planMeta}>{getPackageDescription(pkg)}</Text>
                    </View>
                    <View style={[s.radioOuter, isSelected && s.radioOuterActive]}>
                      {isSelected && <View style={s.radioInner} />}
                    </View>
                  </Pressable>
                );
              })}
            </Animated.View>

          </>
        ) : (
          <Animated.View entering={FadeInDown.delay(150).duration(350)} style={s.errorContainer}>
            <Ionicons name="warning-outline" size={32} color="#DC2626" />
            <Text style={s.errorText}>Could not load subscription options</Text>
            <Pressable onPress={loadOfferings} style={s.retryButton}>
              <Text style={s.retryButtonText}>Retry</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>

      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start premium plan"
          onPress={handlePurchase}
          disabled={isLoading || !selectedPackage}
        >
          <View style={[
            s.ctaButton,
            (isLoading || !selectedPackage) ? s.ctaButtonDisabled : undefined,
          ]}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={s.ctaText}>
                {selectedPackage ? `Get Premium for ${formatPrice(selectedPackage)}` : "Select a plan"}
              </Text>
            )}
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
          onPress={handleRestore}
          disabled={isLoading}
          style={s.restoreButton}
        >
          <Text style={s.restoreText}>Restore purchases</Text>
        </Pressable>

        <Text style={s.disclaimer}>
          Cancel anytime. Auto-renewable for monthly and annual plans. Payment processed securely through the App Store.
        </Text>
        <Text style={s.disclaimerLinks}>
          By purchasing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  closeButton: {
    position: "absolute",
    right: hatchSpacing.screenPadding,
    zIndex: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  scrollContent: { paddingHorizontal: hatchSpacing.screenPadding },

  header: { alignItems: "center", marginBottom: 22 },
  title: { fontSize: 31, fontWeight: "900", color: "#111827" },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
    maxWidth: "92%",
  },

  featuresCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 16,
    ...hatchShadows.sm,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    gap: 10,
  },
  featureRowLast: { borderBottomWidth: 0 },
  featureIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  featureTitle: { fontSize: 14, fontWeight: "800", color: "#111827" },
  featureDescription: { marginTop: 2, fontSize: 12, lineHeight: 17, color: "#6B7280" },

  planSection: { marginBottom: 16 },
  planCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planCardSelected: {
    borderColor: "#10B981",
    borderWidth: 2,
    backgroundColor: "rgba(16, 185, 129, 0.06)",
  },
  planLeft: { flex: 1, marginRight: 12 },
  planTitle: { fontSize: 13, fontWeight: "800", color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 },
  planPrice: { marginTop: 6, fontSize: 26, fontWeight: "900", color: "#111827" },
  planPeriod: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  planMeta: { marginTop: 4, fontSize: 12, color: "#059669", fontWeight: "700" },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: { borderColor: "#10B981" },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#10B981" },

  bottomBar: {
    backgroundColor: "#FFFFFF",
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  ctaButton: {
    width: "100%",
    minHeight: 60,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },
  buttonPressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  ctaText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  restoreButton: { marginTop: 12, padding: 8, alignSelf: "center" },
  restoreText: { fontSize: 13, fontWeight: "700", color: "#10B981" },
  disclaimer: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    color: "#6B7280",
  },
  disclaimerLinks: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
    color: "#9CA3AF",
  },

  // Loading state
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },

  // Error state
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#10B981",
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
