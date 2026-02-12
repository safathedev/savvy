import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hatchColors, hatchShadows } from "@/constants/theme";
import {
  getCourseProgress,
  getFirstIncompleteLesson,
  getLessonLevelId,
  isLessonPremium,
} from "@/data/moms-investment-journey";
import { useStreak } from "@/hooks/use-streak";
import { useApp } from "@/lib/app-context";
import { formatCurrency } from "@/lib/utils";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatWeekRange(): string {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const start = monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const end = sunday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${start} - ${end}`;
}

const MOM_AFFIRMATIONS = [
  "You're doing better than you think. One calm step today is enough.",
  "You carry a lot, and you still show up. That strength will build your future.",
  "Your consistency matters more than perfection. Keep going.",
  "Every small money decision today creates more peace for your family tomorrow.",
  "You are building stability with love, patience, and courage.",
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const streak = useStreak();

  const {
    userProfile,
    completedLessons,
    isPremium,
    savingsGoals,
    getWeeklySavings,
    getReservedExpenses,
    getAvailableAfterReserved,
  } = useApp();

  const name = userProfile?.name || "there";
  const currency = userProfile?.currency || "EUR";
  const todayIndex = (new Date().getDay() + 6) % 7;

  const courseProgress = getCourseProgress(completedLessons);
  const nextLesson = getFirstIncompleteLesson(completedLessons);
  const nextLessonLevel = nextLesson ? getLessonLevelId(nextLesson.lesson_id) : undefined;
  const nextLessonPremiumLocked = nextLesson ? isLessonPremium(nextLesson.lesson_id) && !isPremium : false;

  const weeklyBalance = getWeeklySavings();
  const plannedExpenses = getReservedExpenses();
  const availableAfterPlanned = getAvailableAfterReserved();
  const affirmation = MOM_AFFIRMATIONS[new Date().getDate() % MOM_AFFIRMATIONS.length];
  const goalsPreview = useMemo(
    () =>
      [...savingsGoals]
        .sort((a, b) => {
          const pa = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0;
          const pb = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0;
          return pa - pb;
        })
        .slice(0, 3),
    [savingsGoals]
  );

  const handleNavigate = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path as any);
  };

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
        contentContainerStyle={{
          paddingTop: insets.top + 14,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 20,
          flexGrow: 1,
        }}
      >
        <Animated.View entering={FadeInDown.duration(300)} style={s.headerRow}>
          <View>
            <Text style={s.greeting}>{getGreeting()}, {name}</Text>
            <Text style={s.subGreeting}>One calm money step at a time.</Text>
          </View>
          <Pressable onPress={() => handleNavigate("/(tabs)/profile")} style={s.avatar}>
            <Text style={s.avatarText}>{name[0]?.toUpperCase() || "U"}</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(50).duration(320)} style={s.affirmationCard}>
          <View style={s.affirmationTopRow}>
            <Ionicons name="heart" size={16} color={hatchColors.primary.default} />
            <Text style={s.affirmationTag}>FOR MUMS</Text>
          </View>
          <Text style={s.affirmationText}>{affirmation}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(320)} style={s.streakCard}>
          <View style={s.streakHeader}>
            <View>
              <Text style={s.streakTitle}>This week streak</Text>
              <Text style={s.streakSubtitle}>{formatWeekRange()}</Text>
            </View>
            <View style={s.streakBadge}>
              <Ionicons name="flame" size={18} color={hatchColors.primary.default} />
              <Text style={s.streakBadgeText}>{streak.currentStreak} days</Text>
            </View>
          </View>

          <View style={s.weekRow}>
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
              const done = !!streak.weeklyActivity?.[index];
              const isToday = todayIndex === index;
              return (
                <View key={`${day}-${index}`} style={s.weekCell}>
                  <Text style={[s.weekLabel, isToday && s.weekLabelToday]}>{day}</Text>
                  <View style={[s.weekDot, done && s.weekDotDone, isToday && !done && s.weekDotToday]}>
                    {done && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(110).duration(320)}>
          <Pressable onPress={() => handleNavigate("/(tabs)/track")}>
            {({ pressed }) => (
              <View style={[s.financeCard, pressed && s.pressed]}>
                <Text style={s.financeLabel}>WEEKLY SNAPSHOT</Text>
                <Text style={s.financeValue}>{formatCurrency(weeklyBalance, currency)}</Text>
                <View style={s.financeGrid}>
                  <View>
                    <Text style={s.financeMiniLabel}>Planned expenses</Text>
                    <Text style={s.financeMiniValue}>{formatCurrency(plannedExpenses, currency)}</Text>
                  </View>
                  <View>
                    <Text style={s.financeMiniLabel}>After planned</Text>
                    <Text style={s.financeMiniValue}>{formatCurrency(availableAfterPlanned, currency)}</Text>
                  </View>
                </View>
              </View>
            )}
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(320)} style={s.goalsCard}>
          <View style={s.roadmapHeader}>
            <Text style={s.sectionTitle}>Goals</Text>
            <Pressable onPress={() => handleNavigate("/(tabs)/track")}>
              <Text style={s.linkText}>Open</Text>
            </Pressable>
          </View>

          {goalsPreview.length === 0 ? (
            <Pressable style={s.goalsPlaceholder} onPress={() => handleNavigate("/(tabs)/track")}>
              <Text style={s.goalsPlaceholderTitle}>No goals yet</Text>
              <Text style={s.goalsPlaceholderText}>Create your first goal now.</Text>
            </Pressable>
          ) : (
            <>
              {goalsPreview.map((goal, index) => {
                const progress = goal.targetAmount > 0
                  ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                  : 0;
                return (
                  <Pressable
                    key={`${goal.id}-${index}`}
                    style={s.goalItem}
                    onPress={() => handleNavigate("/(tabs)/track")}
                  >
                    <View style={s.goalTopRow}>
                      <Text style={s.goalTitle} numberOfLines={1}>{goal.title}</Text>
                      <Text style={s.goalPercent}>{progress}%</Text>
                    </View>
                    <Text style={s.goalMeta}>
                      {formatCurrency(goal.currentAmount, currency)} of {formatCurrency(goal.targetAmount, currency)}
                    </Text>
                    <View style={s.goalTrack}>
                      <View style={[s.goalFill, { width: `${progress}%` }]} />
                    </View>
                  </Pressable>
                );
              })}
              {savingsGoals.length > goalsPreview.length ? (
                <Text style={s.goalsMoreText}>+{savingsGoals.length - goalsPreview.length} more goals in Savings</Text>
              ) : null}
            </>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(170).duration(320)}>
          <Pressable
            onPress={() =>
              nextLessonPremiumLocked
                ? handleNavigate("/paywall")
                : nextLesson
                  ? handleNavigate(`/lesson/${nextLesson.lesson_id}`)
                  : handleNavigate("/(tabs)/academy")
            }
          >
            {({ pressed }) => (
              <View style={[s.continueCard, pressed && s.pressed]}>
                <View style={s.continueTopRow}>
                  <View style={s.continueIconWrap}>
                    <Ionicons name="school" size={22} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.continueLabel}>CONTINUE LEARNING</Text>
                    <Text style={s.continueTitle} numberOfLines={2}>
                      {nextLessonPremiumLocked
                        ? "Unlock intermediate and advanced lessons"
                        : nextLesson
                          ? nextLesson.title
                          : "All lessons completed"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.85)" />
                </View>

                <View style={s.continueTrack}>
                  <View style={[s.continueFill, { width: `${courseProgress.percentage}%` }]} />
                </View>

                <View style={s.continueMetaRow}>
                  <Text style={s.continueMeta}>
                    {courseProgress.completed}/{courseProgress.total} lessons ({courseProgress.percentage}%)
                  </Text>
                  {nextLessonPremiumLocked ? (
                    <Text style={s.continueMeta}>PREMIUM</Text>
                  ) : nextLessonLevel ? (
                    <Text style={s.continueMeta}>{nextLessonLevel.toUpperCase()}</Text>
                  ) : null}
                </View>
              </View>
            )}
          </Pressable>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: hatchColors.background.primary },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  greeting: { fontSize: 23, fontWeight: "800", color: hatchColors.text.primary },
  subGreeting: { marginTop: 4, fontSize: 13, color: hatchColors.text.secondary },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: hatchColors.primary.default, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 17, fontWeight: "700", color: "#FFFFFF" },
  affirmationCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginBottom: 14,
  },
  affirmationTopRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  affirmationTag: { fontSize: 10, fontWeight: "800", color: hatchColors.primary.default, letterSpacing: 0.8 },
  affirmationText: { fontSize: 15, fontWeight: "700", color: hatchColors.text.primary, lineHeight: 22 },

  continueCard: {
    borderRadius: 20,
    backgroundColor: hatchColors.primary.default,
    padding: 16,
    marginBottom: 14,
    ...hatchShadows.md,
  },
  continueTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  continueIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.18)", marginRight: 10 },
  continueLabel: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.75)", letterSpacing: 0.8 },
  continueTitle: { marginTop: 3, fontSize: 18, fontWeight: "800", color: "#FFFFFF" },
  continueTrack: { height: 7, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)", overflow: "hidden" },
  continueFill: { height: "100%", borderRadius: 999, backgroundColor: "#FFFFFF" },
  continueMetaRow: { marginTop: 7, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  continueMeta: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.9)" },

  streakCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 14,
  },
  streakHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  streakTitle: { fontSize: 18, fontWeight: "800", color: hatchColors.text.primary },
  streakSubtitle: { marginTop: 3, fontSize: 13, color: hatchColors.text.secondary },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, backgroundColor: hatchColors.primary.muted, paddingHorizontal: 10, paddingVertical: 6 },
  streakBadgeText: { fontSize: 12, fontWeight: "800", color: hatchColors.primary.default },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  weekCell: { flex: 1, alignItems: "center" },
  weekLabel: { fontSize: 11, fontWeight: "700", color: hatchColors.text.tertiary, marginBottom: 7 },
  weekLabelToday: { color: hatchColors.primary.default },
  weekDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: hatchColors.background.secondary, alignItems: "center", justifyContent: "center" },
  weekDotDone: { backgroundColor: hatchColors.primary.default },
  weekDotToday: { borderWidth: 2, borderColor: hatchColors.primary.default, backgroundColor: "#FFFFFF" },

  goalsCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginBottom: 14,
  },
  goalsPlaceholder: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: hatchColors.border.default,
    backgroundColor: hatchColors.background.secondary,
    padding: 12,
  },
  goalsPlaceholderTitle: { fontSize: 15, fontWeight: "800", color: hatchColors.text.primary },
  goalsPlaceholderText: { marginTop: 4, fontSize: 12, color: hatchColors.text.secondary },
  goalItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: hatchColors.background.secondary,
    padding: 10,
    marginBottom: 8,
  },
  goalTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  goalTitle: { flex: 1, fontSize: 14, fontWeight: "800", color: hatchColors.text.primary, marginRight: 8 },
  goalPercent: { fontSize: 13, fontWeight: "800", color: hatchColors.primary.default },
  goalMeta: { marginTop: 4, fontSize: 12, color: hatchColors.text.secondary },
  goalTrack: { marginTop: 8, height: 7, borderRadius: 999, backgroundColor: "#FFFFFF", overflow: "hidden" },
  goalFill: { height: "100%", borderRadius: 999, backgroundColor: hatchColors.primary.default },
  goalsMoreText: { marginTop: 2, fontSize: 12, color: hatchColors.text.tertiary, fontWeight: "600" },

  roadmapHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: hatchColors.text.tertiary, textTransform: "uppercase" },
  linkText: { fontSize: 13, fontWeight: "800", color: hatchColors.primary.default },

  financeCard: {
    borderRadius: 20,
    backgroundColor: hatchColors.primary.default,
    padding: 16,
    marginBottom: 14,
    ...hatchShadows.md,
  },
  financeLabel: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.75)", letterSpacing: 0.8 },
  financeValue: { marginTop: 4, fontSize: 30, fontWeight: "800", color: "#FFFFFF" },
  financeGrid: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  financeMiniLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.8)" },
  financeMiniValue: { marginTop: 2, fontSize: 14, fontWeight: "800", color: "#FFFFFF" },

  pressed: { opacity: 0.93, transform: [{ scale: 0.99 }] },
});
