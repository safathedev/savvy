// ─────────────────────────────────────────────────────────────
// Savvy — Home Screen
// ─────────────────────────────────────────────────────────────

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hatchColors, hatchShadows } from "@/constants/theme";
import { investmentLessons } from "@/data/investment-lessons";
import { useDailyTip } from "@/hooks/use-daily-tip";
import { MoodOption, useMood } from "@/hooks/use-mood";
import { useStreak } from "@/hooks/use-streak";
import { useApp } from "@/lib/app-context";
import { formatCurrency } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// ── Screen ───────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile, appliedTips, completedLessons, getWeeklySavings } = useApp();
  const tip = useDailyTip();
  const streak = useStreak();
  const mood = useMood();

  const weeklySavings = getWeeklySavings();
  const currency = userProfile?.currency || "GBP";

  const name = userProfile?.name || "there";
  const todayIdx = (new Date().getDay() + 6) % 7;

  const nextLesson =
    investmentLessons.find((l) => !completedLessons.includes(l.id) && !l.isPremium) ||
    investmentLessons.find((l) => !completedLessons.includes(l.id));

  const nav = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path as any);
  };

  const handleMood = (m: MoodOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    mood.selectMood(m);
  };

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scroll}
        scrollEnabled={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 24,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Header ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <View style={s.header}>
            <Text style={s.greeting}>{getGreeting()}, {name}</Text>
            <Pressable onPress={() => nav("/(tabs)/profile")} style={s.avatar}>
              <Text style={s.avatarLetter}>{name[0]?.toUpperCase()}</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* ── 2. Mood Check-in ───────────────────────── */}
        {!mood.isLoading && (
          <Animated.View entering={FadeInDown.delay(100).duration(800)}>
            {mood.selectedMood ? (
              /* ── answered state ── */
              <View style={s.moodDoneCard}>
                <View style={s.moodDoneIcon}>
                  <Text style={s.moodDoneEmoji}>{mood.selectedMood.emoji}</Text>
                </View>
                <View style={s.moodDoneContent}>
                  <Text style={s.moodDoneLabel}>YOUR DAILY AFFIRMATION</Text>
                  <Text style={s.moodDoneText}>{mood.selectedMood.response}</Text>
                </View>
              </View>
            ) : (
              /* ── question state ── */
              <View style={s.moodCardPremium}>
                <Text style={s.moodQuestionRefined}>How are you feeling today?</Text>
                <View style={s.moodOptionsGrid}>
                  {mood.options.map((m) => (
                    <Pressable key={m.id} onPress={() => handleMood(m)}>
                      {({ pressed }) => (
                        <View style={[s.moodPill, pressed && s.moodPillPressed]}>
                          <Text style={s.moodEmojiLarge}>{m.emoji}</Text>
                          <Text style={s.moodLabelRefined}>{m.label}</Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        )}

        {/* ── 4. Learning Mastery Centerpiece ──────────────── */}
        {(nextLesson || tip) && (
          <Animated.View entering={FadeInDown.delay(220).duration(800)}>
            <Pressable
              onPress={() => nextLesson ? nav(`/lesson/${nextLesson.id}`) : tip && nav(`/tip/${tip.id}`)}
            >
              {({ pressed }) => (
                <View style={[s.masteryCard, pressed && s.pressed]}>
                  {/* Background Gradient Effect */}
                  <View style={s.masteryGradient} />

                  <View style={s.masteryHeader}>
                    <View style={s.masteryIconContainer}>
                      <Ionicons
                        name={nextLesson ? "school" : "bulb"}
                        size={24}
                        color="#FFFFFF"
                      />
                    </View>
                    <View style={s.masteryHeaderText}>
                      <Text style={s.masteryLabel}>
                        {nextLesson ? "CONTINUE LEARNING" : "TODAY'S TIP"}
                      </Text>
                      <Text style={s.masteryTitle} numberOfLines={2}>
                        {nextLesson ? nextLesson.title : tip?.title}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Section */}
                  <View style={s.masteryProgressContainer}>
                    <View style={s.masteryStats}>
                      <View style={s.masteryStatItem}>
                        <Ionicons name="book" size={12} color="rgba(255,255,255,0.7)" />
                        <Text style={s.masteryStatText}>{completedLessons.length}/8 Lessons</Text>
                      </View>
                      <View style={s.masteryStatDivider} />
                      <View style={s.masteryStatItem}>
                        <Ionicons name="bulb" size={12} color="rgba(255,255,255,0.7)" />
                        <Text style={s.masteryStatText}>{appliedTips.length}/16 Tips</Text>
                      </View>
                    </View>

                    <View style={s.masteryProgressBarOuter}>
                      <View
                        style={[
                          s.masteryProgressBarInner,
                          { width: `${((completedLessons.length + appliedTips.length) / 24) * 100}%` }
                        ]}
                      />
                    </View>
                  </View>

                  <View style={s.masteryFooter}>
                    <Text style={s.masteryFooterText}>
                      {nextLesson ? "Start next lesson" : "Read daily tip"}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </View>
                </View>
              )}
            </Pressable>
          </Animated.View>
        )}

        {/* ── 5. Weekly Streak & Growth ───────────────── */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <View style={s.weekCard}>
            <View style={s.weekHeader}>
              <Text style={s.weekTitle}>This week</Text>
              {streak.currentStreak > 0 && (
                <View style={s.streakBadge}>
                  <Text style={s.streakBadgeText}>{streak.currentStreak}d streak</Text>
                </View>
              )}
            </View>
            <View style={s.weekRow}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => {
                const done = streak.weeklyActivity?.[i];
                const isToday = i === todayIdx;
                return (
                  <View key={i} style={s.weekCol}>
                    <Text style={[s.weekLabel, isToday && s.weekLabelToday]}>{d}</Text>
                    <View style={[
                      s.weekCircle,
                      done && s.weekCircleDone,
                      isToday && !done && s.weekCircleToday,
                    ]}>
                      {done && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* ── 6. Savings Achievement Card ──────────────── */}
        <Animated.View entering={FadeInDown.delay(380).duration(800)}>
          <Pressable onPress={() => nav("/calendar")}>
            {({ pressed }) => (
              <View style={[s.savingsCard, pressed && s.pressed]}>
                <View style={s.savingsContent}>
                  <View style={s.savingsIconContainer}>
                    <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                  </View>
                  <View style={s.savingsTextContainer}>
                    <Text style={s.savingsLabel}>WEEKLY CONSISTENCY</Text>
                    <Text style={s.savingsAmount}>{formatCurrency(weeklySavings, currency)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.4)" />
                </View>
                <Text style={s.savingsTagline}>Check your progress in the Calendar 🗓️</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>


      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { flex: 1 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },

  // ── header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: hatchColors.text.primary,
    letterSpacing: -0.3,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: hatchColors.primary.default,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // ── mood check-in premium (question)
  moodCardPremium: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    ...hatchShadows.sm,
  },
  moodQuestionRefined: {
    fontSize: 18,
    fontWeight: "700",
    color: hatchColors.text.primary,
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  moodOptionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodPill: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: hatchColors.background.secondary,
    minWidth: 64,
  },
  moodPillPressed: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    transform: [{ scale: 1.05 }],
  },
  moodEmojiLarge: { fontSize: 32, marginBottom: 6 },
  moodLabelRefined: {
    fontSize: 11,
    fontWeight: "600",
    color: hatchColors.text.secondary,
    textAlign: "center",
  },

  // ── mood check-in premium (answered)
  moodDoneCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    ...hatchShadows.sm,
  },
  moodDoneIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: hatchColors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  moodDoneEmoji: { fontSize: 24 },
  moodDoneContent: {
    flex: 1,
  },
  moodDoneLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: hatchColors.text.tertiary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  moodDoneText: {
    fontSize: 14,
    fontWeight: "600",
    color: hatchColors.text.primary,
    lineHeight: 20,
  },
  moodEdit: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: hatchColors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  // ── mastery card (Triple-A Centerpiece)
  masteryCard: {
    backgroundColor: hatchColors.primary.default,
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    overflow: "hidden",
    ...hatchShadows.lg,
  },
  masteryGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    // Note: In real React Native we'd use LinearGradient here
    // But since we are restricted to Vanilla CSS/RN Styles, we simulate depth
    borderBottomRightRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: [{ scale: 2 }, { translateX: 50 }, { translateY: 50 }],
  },
  masteryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  masteryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  masteryHeaderText: {
    flex: 1,
  },
  masteryLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  masteryTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  masteryProgressContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  masteryStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  masteryStatItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  masteryStatText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 6,
  },
  masteryStatDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 12,
  },
  masteryProgressBarOuter: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  masteryProgressBarInner: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  masteryFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  masteryFooterText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // ── week card refined
  weekCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    ...hatchShadows.sm,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  weekTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: hatchColors.text.primary,
  },
  streakBadge: {
    backgroundColor: hatchColors.primary.muted,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  streakBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: hatchColors.primary.default,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  weekCol: {
    alignItems: "center",
    flex: 1,
  },
  weekLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: hatchColors.text.tertiary,
    marginBottom: 10,
  },
  weekLabelToday: {
    color: hatchColors.primary.default,
  },
  weekCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: hatchColors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  weekCircleDone: {
    backgroundColor: hatchColors.primary.default,
  },
  weekCircleToday: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: hatchColors.primary.light,
  },

  // ── savings card (Triple-A)
  savingsCard: {
    backgroundColor: hatchColors.primary.default,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    ...hatchShadows.lg,
  },
  savingsContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  savingsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  savingsTextContainer: {
    flex: 1,
  },
  savingsLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 1,
    marginBottom: 4,
  },
  savingsAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  savingsTagline: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    fontStyle: "italic",
  },
});
