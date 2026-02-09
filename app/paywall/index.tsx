// Savvy Paywall — Premium Dark Design
import { hatchRadius, hatchShadows, hatchSpacing } from "@/constants/theme";
import { useApp } from "@/lib/app-context";
import { purchasePackage, restorePurchases } from "@/lib/revenuecat";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PlanType = "monthly" | "annual";

const features = [
  { icon: "💎", title: "Unlock Unlimited", description: "Remove all limits on tracking" },
  { icon: "📚", title: "Complete Academy", description: "Access all 8 masterclasses" },
  { icon: "💡", title: "Pro Tips Library", description: "16+ advanced saving strategies" },
  { icon: "🚀", title: "Priority Features", description: "First access to new tools" },
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setPremium } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>("annual");
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { success } = await purchasePackage(selectedPlan === "annual" ? "savvy_annual" : "savvy_monthly");
      if (success) {
        await setPremium(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const restored = await restorePurchases();
      if (restored) {
        await setPremium(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B']}
        style={StyleSheet.absoluteFill}
      />

      {/* Close Button */}
      <Pressable
        onPress={() => router.back()}
        style={[styles.closeButton, { top: insets.top + 8 }]}
      >
        <Ionicons name="close" size={24} color="#94A3B8" />
      </Pressable>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
          <View style={styles.iconCircle}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0)']}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="diamond" size={48} color="#10B981" />
          </View>
          <Text style={styles.title}>Unlock <Text style={{ color: '#10B981' }}>Unlimited</Text></Text>
          <Text style={styles.subtitle}>
            Join the elite club of high performers mastering their wealth.
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.featuresSection}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>{feature.icon}</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
          ))}
        </Animated.View>

        {/* Plans */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.plansSection}>

          {/* Annual Plan */}
          <Pressable
            onPress={() => { Haptics.selectionAsync(); setSelectedPlan("annual"); }}
            style={[styles.planCard, selectedPlan === "annual" && styles.planCardSelected]}
          >
            {selectedPlan === "annual" && (
              <View style={[styles.glowContainer, { opacity: 0.1 }]}>
                <LinearGradient colors={['#10B981', 'transparent']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              </View>
            )}
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
            <View style={styles.planRadio}>
              <View style={[styles.radioOuter, selectedPlan === "annual" && styles.radioOuterSelected]}>
                {selectedPlan === "annual" && <View style={styles.radioInner} />}
              </View>
            </View>
            <View style={styles.planContent}>
              <Text style={styles.planName}>Annual Access</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={styles.planPrice}>£19.99</Text>
                <Text style={styles.planPeriod}>/ year</Text>
              </View>
              <Text style={styles.planSavings}>Save 58% vs monthly</Text>
            </View>
          </Pressable>

          {/* Monthly Plan */}
          <Pressable
            onPress={() => { Haptics.selectionAsync(); setSelectedPlan("monthly"); }}
            style={[styles.planCard, selectedPlan === "monthly" && styles.planCardSelected]}
          >
            {selectedPlan === "monthly" && (
              <View style={[styles.glowContainer, { opacity: 0.1 }]}>
                <LinearGradient colors={['#10B981', 'transparent']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              </View>
            )}
            <View style={styles.planRadio}>
              <View style={[styles.radioOuter, selectedPlan === "monthly" && styles.radioOuterSelected]}>
                {selectedPlan === "monthly" && <View style={styles.radioInner} />}
              </View>
            </View>
            <View style={styles.planContent}>
              <Text style={styles.planName}>Monthly</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={styles.planPrice}>£3.99</Text>
                <Text style={styles.planPeriod}>/ month</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.ctaSection}>
          <Pressable
            onPress={handlePurchase}
            disabled={isLoading}
            style={({ pressed }) => [styles.ctaButton, pressed && !isLoading && styles.buttonPressed]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.ctaText}>
                {selectedPlan === "annual" ? "Start Annual Plan" : "Start Monthly Plan"}
              </Text>
            )}
          </Pressable>

          <Pressable onPress={handleRestore} disabled={isLoading} style={styles.restoreButton}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </Pressable>

          <Text style={styles.disclaimer}>
            Cancel anytime. Subscription automatically renews.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  closeButton: { position: "absolute", right: hatchSpacing.screenPadding, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingHorizontal: hatchSpacing.screenPadding },

  header: { alignItems: "center", marginBottom: 32 },
  iconCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: "center", justifyContent: "center", marginBottom: 20, borderWidth: 1, borderColor: 'rgba(252, 211, 77, 0.2)', overflow: 'hidden' },
  title: { fontSize: 32, fontWeight: "900", color: "#FFFFFF", textAlign: "center", marginBottom: 8, letterSpacing: -1 },
  subtitle: { fontSize: 15, color: "#94A3B8", textAlign: "center", lineHeight: 22, maxWidth: '80%' },

  featuresSection: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  featureItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  featureIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: "center", justifyContent: "center", marginRight: 14 },
  featureEmoji: { fontSize: 18 },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  featureDescription: { fontSize: 12, color: "#94A3B8", marginTop: 2 },

  plansSection: { marginBottom: 32 },
  planCard: { flexDirection: "row", alignItems: "center", backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, marginBottom: 12, borderWidth: 2, borderColor: 'transparent', position: "relative", overflow: "hidden" },
  planCardSelected: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.05)' },
  glowContainer: { ...StyleSheet.absoluteFillObject, opacity: 0.5 },

  bestValueBadge: { position: "absolute", top: 0, right: 0, backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 4, borderBottomLeftRadius: 12 },
  bestValueText: { fontSize: 11, fontWeight: "900", color: '#0F172A' },

  planRadio: { marginRight: 16 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#475569', alignItems: "center", justifyContent: "center" },
  radioOuterSelected: { borderColor: '#10B981' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981' },

  planContent: { flex: 1 },
  planName: { fontSize: 14, fontWeight: "600", color: "#FFFFFF", marginBottom: 2 },
  planPrice: { fontSize: 22, fontWeight: "800", color: "#10B981" },
  planPeriod: { fontSize: 13, fontWeight: "500", color: "#94A3B8" },
  planSavings: { fontSize: 12, color: "#4ADE80", fontWeight: "700", marginTop: 2 },

  ctaSection: { alignItems: "center" },
  ctaButton: { width: "100%", borderRadius: hatchRadius.full, backgroundColor: '#10B981', paddingVertical: 18, alignItems: "center", ...hatchShadows.glow },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  ctaText: { fontSize: 16, fontWeight: "900", color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },

  restoreButton: { marginTop: 20, padding: 12 },
  restoreText: { fontSize: 13, color: "#10B981", fontWeight: "600" },
  disclaimer: { fontSize: 11, color: "#64748B", textAlign: "center", marginTop: 12 },
});
