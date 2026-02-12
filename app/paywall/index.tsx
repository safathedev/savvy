import { hatchRadius, hatchShadows, hatchSpacing } from "@/constants/theme";
import { useApp } from "@/lib/app-context";
import { PRODUCTS, purchasePackage, restorePurchases } from "@/lib/revenuecat";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

type PlanType = "monthly" | "annual";

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

  const [selectedPlan, setSelectedPlan] = useState<PlanType>("annual");
  const [isLoading, setIsLoading] = useState(false);

  const selectedProduct = useMemo(
    () => (selectedPlan === "annual" ? PRODUCTS.ANNUAL : PRODUCTS.MONTHLY),
    [selectedPlan]
  );

  const handlePurchase = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { success, error } = await purchasePackage(selectedProduct.id);

      if (!success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Purchase failed", error || "Please try again.");
        return;
      }

      await setPremium(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(60).duration(350)} style={s.header}>
          <View style={s.heroIconWrap}>
            <Text style={s.heroEmoji}>*</Text>
          </View>
          <Text style={s.title}>Savvy Premium</Text>
          <Text style={s.subtitle}>
            More guidance, deeper planning, and a calmer path for your family finances.
          </Text>
          <View style={s.priceHintPill}>
            <Text style={s.priceHintText}>Now from {PRODUCTS.MONTHLY.price} per month</Text>
          </View>
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

        <Animated.View entering={FadeInDown.delay(150).duration(350)} style={s.planSection}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select annual plan"
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedPlan("annual");
            }}
            style={[s.planCard, selectedPlan === "annual" && s.planCardSelected]}
          >
            <View style={s.planLeft}>
              <Text style={s.planTitle}>Annual</Text>
              <Text style={s.planPrice}>
                {PRODUCTS.ANNUAL.price}
                <Text style={s.planPeriod}> / year</Text>
              </Text>
              <Text style={s.planMeta}>
                {PRODUCTS.ANNUAL.pricePerMonth}/month - Save {PRODUCTS.ANNUAL.savings}
              </Text>
            </View>
            <View style={[s.radioOuter, selectedPlan === "annual" && s.radioOuterActive]}>
              {selectedPlan === "annual" && <View style={s.radioInner} />}
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select monthly plan"
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedPlan("monthly");
            }}
            style={[s.planCard, selectedPlan === "monthly" && s.planCardSelected]}
          >
            <View style={s.planLeft}>
              <Text style={s.planTitle}>Monthly</Text>
              <Text style={s.planPrice}>
                {PRODUCTS.MONTHLY.price}
                <Text style={s.planPeriod}> / month</Text>
              </Text>
              <Text style={s.planMeta}>Flexible and cancel anytime</Text>
            </View>
            <View style={[s.radioOuter, selectedPlan === "monthly" && s.radioOuterActive]}>
              {selectedPlan === "monthly" && <View style={s.radioInner} />}
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(190).duration(350)} style={s.ctaSection}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Start ${selectedPlan} premium plan`}
            onPress={handlePurchase}
            disabled={isLoading}
            style={({ pressed }) => [s.ctaButton, pressed && !isLoading && s.buttonPressed]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={s.ctaText}>Start {selectedPlan === "annual" ? "annual" : "monthly"} plan</Text>
            )}
          </Pressable>

          <Pressable accessibilityRole="button" accessibilityLabel="Restore purchases" onPress={handleRestore} disabled={isLoading} style={s.restoreButton}>
            <Text style={s.restoreText}>Restore purchases</Text>
          </Pressable>

          <Text style={s.disclaimer}>
            Demo mode is currently active. Billing is simulated for now.
          </Text>
        </Animated.View>
      </ScrollView>
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
  heroIconWrap: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    ...hatchShadows.sm,
  },
  heroEmoji: { fontSize: 40 },
  title: { fontSize: 31, fontWeight: "900", color: "#111827" },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
    maxWidth: "92%",
  },
  priceHintPill: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priceHintText: { fontSize: 12, fontWeight: "800", color: "#047857" },

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
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planCardSelected: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  planLeft: { flex: 1, marginRight: 12 },
  planTitle: { fontSize: 13, fontWeight: "800", color: "#374151", textTransform: "uppercase" },
  planPrice: { marginTop: 4, fontSize: 23, fontWeight: "900", color: "#111827" },
  planPeriod: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  planMeta: { marginTop: 3, fontSize: 12, color: "#047857", fontWeight: "700" },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: { borderColor: "#10B981" },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#10B981" },

  ctaSection: { alignItems: "center" },
  ctaButton: {
    width: "100%",
    borderRadius: hatchRadius.full,
    backgroundColor: "#10B981",
    paddingVertical: 17,
    alignItems: "center",
    ...hatchShadows.glow,
  },
  buttonPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  ctaText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  restoreButton: { marginTop: 14, padding: 10 },
  restoreText: { fontSize: 13, fontWeight: "700", color: "#047857" },
  disclaimer: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    color: "#6B7280",
  },
});



