// Savvy Tip Detail - Minimalist White Design
import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { getTipById } from "@/data/savings-tips";
import { useApp } from "@/lib/app-context";
import { shareTip } from "@/lib/sharing";
import { hatchColors, hatchSpacing, hatchTypography, hatchRadius } from "@/constants/theme";

function cleanDetailLine(line: string): string {
  return line
    .replace(/^\*\*(.*?)\*\*:?$/, "$1")
    .replace(/^\d+\.\s+/, "")
    .replace(/^[-*\u2022]\s+/, "")
    .trim();
}

function parseTipDetails(details: string): { paragraphs: string[]; bullets: string[] } {
  const lines = details
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const paragraphs: string[] = [];
  const bullets: string[] = [];

  lines.forEach((line) => {
    if (/^(\d+\.\s+|[-*\u2022]\s+)/.test(line)) {
      const cleaned = cleanDetailLine(line);
      if (cleaned) bullets.push(cleaned);
      return;
    }

    const cleaned = cleanDetailLine(line);
    if (cleaned) paragraphs.push(cleaned);
  });

  return { paragraphs, bullets };
}

export default function TipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { markTipApplied, isTipApplied } = useApp();

  const tip = getTipById(id);

  if (!tip) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Tip not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isApplied = isTipApplied(tip.id);
  const parsed = parseTipDetails(tip.details || "");
  const actionSteps =
    parsed.bullets.length > 0 ? parsed.bullets : [tip.description].filter(Boolean);

  const handleApply = async () => {
    if (isApplied) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markTipApplied(tip.id);
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    shareTip(tip);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={hatchColors.text.primary} />
          </Pressable>
          <Pressable onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={hatchColors.text.primary} />
          </Pressable>
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}</Text>
          </View>
          <Text style={styles.tipIcon}>{tip.icon}</Text>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <Text style={styles.savingsText}>{tip.estimatedSavings}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.description}>{tip.description}</Text>
          </View>
        </Animated.View>

        {/* Details */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.sectionTitleOutside}>Details</Text>
          <View style={styles.card}>
            {(parsed.paragraphs.length > 0 ? parsed.paragraphs : [tip.details]).map((text, index) => (
              <Text key={index} style={[styles.description, index > 0 && styles.detailParagraph]}>
                {text}
              </Text>
            ))}
          </View>
        </Animated.View>

        {/* Action Steps */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Text style={styles.sectionTitleOutside}>How to Apply</Text>
          <View style={styles.stepsContainer}>
            {actionSteps.map((step, index) => (
              <View key={`${step}-${index}`} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable onPress={handleApply} disabled={isApplied} style={({ pressed }) => [styles.applyButton, pressed && !isApplied && styles.buttonPressed]}>
          {isApplied ? (
            <View style={styles.appliedButton}>
              <Ionicons name="checkmark-circle" size={24} color={hatchColors.status.success} />
              <Text style={styles.appliedText}>Applied</Text>
            </View>
          ) : (
            <View style={styles.applyGradient}>
              <Text style={styles.applyText}>I'll Try This!</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: hatchColors.background.primary },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: hatchTypography.fontSize.lg, color: hatchColors.text.secondary, marginBottom: 16 },
  backLink: { padding: 12 },
  backLinkText: { fontSize: hatchTypography.fontSize.base, color: hatchColors.primary.default, fontWeight: "600" },
  header: { paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: hatchColors.border.default },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: hatchSpacing.screenPadding, paddingVertical: 12 },
  headerButton: { flexDirection: "row", alignItems: "center", padding: 8 },
  headerInfo: { alignItems: "center", paddingHorizontal: hatchSpacing.screenPadding },
  categoryBadge: { backgroundColor: hatchColors.primary.muted, paddingHorizontal: 12, paddingVertical: 6, borderRadius: hatchRadius.full, marginBottom: 12 },
  categoryBadgeText: { fontSize: hatchTypography.fontSize.sm, fontWeight: "600", color: hatchColors.primary.default },
  tipIcon: { fontSize: 48, marginBottom: 12 },
  tipTitle: { fontSize: hatchTypography.fontSize.xl, fontWeight: "700", color: hatchColors.text.primary, textAlign: "center", marginBottom: 12 },
  savingsText: { fontSize: hatchTypography.fontSize.md, fontWeight: "700", color: hatchColors.status.success },
  scrollView: { flex: 1 },
  scrollContent: { padding: hatchSpacing.screenPadding, gap: 16 },
  card: { backgroundColor: hatchColors.background.card, borderRadius: hatchRadius.xl, padding: 20, borderWidth: 1, borderColor: hatchColors.border.default },
  sectionTitle: { fontSize: hatchTypography.fontSize.md, fontWeight: "700", color: hatchColors.text.primary, marginBottom: 12 },
  detailParagraph: { marginTop: 10 },
  sectionTitleOutside: { fontSize: hatchTypography.fontSize.xs, fontWeight: "600", color: hatchColors.text.secondary, letterSpacing: 1, marginBottom: 12 },
  description: { fontSize: hatchTypography.fontSize.base, color: hatchColors.text.secondary, lineHeight: 24 },
  stepsContainer: { gap: 12 },
  stepItem: { flexDirection: "row", alignItems: "flex-start", backgroundColor: hatchColors.background.card, borderRadius: hatchRadius.lg, padding: 16, borderWidth: 1, borderColor: hatchColors.border.default },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: hatchColors.primary.muted, alignItems: "center", justifyContent: "center", marginRight: 12 },
  stepNumberText: { fontSize: hatchTypography.fontSize.md, fontWeight: "700", color: hatchColors.primary.default },
  stepContent: { flex: 1 },
  stepText: { fontSize: hatchTypography.fontSize.base, color: hatchColors.text.secondary, lineHeight: 22 },
  bottomAction: { paddingHorizontal: hatchSpacing.screenPadding, paddingTop: 16, backgroundColor: hatchColors.background.primary, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: hatchColors.border.default },
  applyButton: { borderRadius: hatchRadius.full, overflow: "hidden" },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  applyGradient: { paddingVertical: 16, alignItems: "center", borderRadius: hatchRadius.full, backgroundColor: hatchColors.primary.default },
  applyText: { fontSize: hatchTypography.fontSize.md, fontWeight: "700", color: hatchColors.text.inverse },
  appliedButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: hatchColors.background.card, borderWidth: 2, borderColor: hatchColors.status.success, borderRadius: hatchRadius.full, paddingVertical: 16 },
  appliedText: { fontSize: hatchTypography.fontSize.md, fontWeight: "700", color: hatchColors.status.success },
});

