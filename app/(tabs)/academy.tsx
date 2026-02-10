import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hatchColors, hatchShadows } from "@/constants/theme";
import {
  CourseLevel,
  getCourseProgress,
  getFirstIncompleteLesson,
  getLevelProgress,
  isLessonUnlocked,
  momsInvestmentJourney,
} from "@/data/moms-investment-journey";
import { useApp } from "@/lib/app-context";

function levelLabel(levelId: CourseLevel["level_id"]): string {
  if (levelId === "beginner") return "Beginner";
  if (levelId === "intermediate") return "Intermediate";
  return "Advanced";
}

function levelHeadline(levelId: CourseLevel["level_id"]): string {
  if (levelId === "beginner") return "CALM FOUNDATION";
  if (levelId === "intermediate") return "STABILITY SYSTEMS";
  return "SMART GROWTH";
}

export default function AcademyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completedLessons } = useApp();
  const [activeLevel, setActiveLevel] = useState<CourseLevel["level_id"]>("beginner");

  const currentLevel = useMemo(
    () => momsInvestmentJourney.find((level) => level.level_id === activeLevel),
    [activeLevel]
  );

  const nextLesson = getFirstIncompleteLesson(completedLessons);
  const courseProgress = getCourseProgress(completedLessons);

  const handleOpenLesson = (lessonId: string) => {
    const unlocked = isLessonUnlocked(lessonId, completedLessons);
    if (!unlocked && !completedLessons.includes(lessonId)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/lesson/${lessonId}` as any);
  };

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 20,
        }}
      >
        <Animated.View entering={FadeInDown.duration(350)}>
          <Text style={s.title}>Academy</Text>
          <Text style={s.subtitle}>Calm, practical lessons for real-life money decisions.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(50).duration(350)} style={s.progressCard}>
          <View style={s.progressRow}>
            <View>
              <Text style={s.progressLabel}>Course progress</Text>
              <Text style={s.progressValue}>
                {courseProgress.completed}/{courseProgress.total} lessons
              </Text>
            </View>
            <Text style={s.progressPercent}>{courseProgress.percentage}%</Text>
          </View>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${courseProgress.percentage}%` }]} />
          </View>
          {nextLesson ? (
            <Text style={s.nextText}>Up next: {nextLesson.title}</Text>
          ) : (
            <Text style={s.nextText}>You completed the full academy. Great job.</Text>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(350)} style={s.levelTabs}>
          {(momsInvestmentJourney.map((level) => level.level_id) as CourseLevel["level_id"][]).map(
            (levelId) => {
              const progress = getLevelProgress(levelId, completedLessons);
              const active = activeLevel === levelId;
              return (
                <Pressable
                  key={levelId}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setActiveLevel(levelId);
                  }}
                  style={[s.levelTab, active && s.levelTabActive]}
                >
                  <Text style={[s.levelTabText, active && s.levelTabTextActive]}>
                    {levelLabel(levelId)}
                  </Text>
                  <Text style={[s.levelTabMeta, active && s.levelTabMetaActive]}>
                    {progress.percentage}%
                  </Text>
                </Pressable>
              );
            }
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(350)} style={s.levelIntro}>
          <Text style={s.levelHero}>{levelHeadline(activeLevel)}</Text>
          <Text style={s.levelIntroMeta}>{levelLabel(activeLevel)} learning path</Text>
          <Text style={s.levelIntroText}>{currentLevel?.goal}</Text>
        </Animated.View>

        {currentLevel?.modules.map((module, moduleIndex) => (
          <Animated.View
            key={module.module_id}
            entering={FadeInDown.delay(160 + moduleIndex * 40).duration(350)}
            style={s.moduleSection}
          >
            <Text style={s.moduleTitle}>{module.title}</Text>

            {module.lessons.map((lesson) => {
              const completed = completedLessons.includes(lesson.lesson_id);
              const unlocked = isLessonUnlocked(lesson.lesson_id, completedLessons);
              const locked = !completed && !unlocked;
              const isNext = nextLesson?.lesson_id === lesson.lesson_id;

              return (
                <Pressable key={lesson.lesson_id} onPress={() => handleOpenLesson(lesson.lesson_id)}>
                  {({ pressed }) => (
                    <View
                      style={[
                        s.lessonCard,
                        locked && s.lessonCardLocked,
                        completed && s.lessonCardCompleted,
                        isNext && s.lessonCardNext,
                        pressed && !locked && s.pressed,
                      ]}
                    >
                      <View style={[s.lessonIcon, locked && s.lessonIconLocked]}>
                        <Ionicons
                          name={completed ? "checkmark" : locked ? "lock-closed" : "play"}
                          size={16}
                          color={locked ? hatchColors.text.tertiary : "#FFFFFF"}
                        />
                      </View>

                      <View style={s.lessonBody}>
                        <View style={s.lessonTopRow}>
                          <Text style={s.lessonTitle} numberOfLines={1}>
                            {lesson.title}
                          </Text>
                          {isNext && !completed && (
                            <View style={s.nextBadge}>
                              <Text style={s.nextBadgeText}>Next</Text>
                            </View>
                          )}
                        </View>
                        <Text style={s.lessonMeta} numberOfLines={2}>
                          {lesson.duration} - {lesson.objective}
                        </Text>
                      </View>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: hatchColors.background.primary,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: hatchColors.text.primary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: hatchColors.text.secondary,
    lineHeight: 20,
  },
  progressCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    borderRadius: 20,
    padding: 16,
    ...hatchShadows.sm,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 12,
    color: hatchColors.text.tertiary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  progressValue: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "800",
    color: hatchColors.text.primary,
  },
  progressPercent: {
    fontSize: 22,
    fontWeight: "800",
    color: hatchColors.primary.default,
  },
  progressTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: 999,
    backgroundColor: hatchColors.background.secondary,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: hatchColors.primary.default,
  },
  nextText: {
    marginTop: 10,
    fontSize: 12,
    color: hatchColors.text.secondary,
    fontWeight: "600",
  },
  levelTabs: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    marginBottom: 10,
  },
  levelTab: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: hatchColors.background.secondary,
  },
  levelTabActive: {
    backgroundColor: hatchColors.primary.default,
  },
  levelTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: hatchColors.text.secondary,
  },
  levelTabTextActive: {
    color: "#FFFFFF",
  },
  levelTabMeta: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: hatchColors.text.tertiary,
  },
  levelTabMetaActive: {
    color: "rgba(255,255,255,0.85)",
  },
  levelIntro: {
    marginTop: 2,
    marginBottom: 2,
  },
  levelHero: {
    fontSize: 29,
    fontWeight: "900",
    color: hatchColors.text.primary,
    letterSpacing: -0.6,
  },
  levelIntroMeta: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "800",
    color: hatchColors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  levelIntroText: {
    marginTop: 6,
    fontSize: 13,
    color: hatchColors.text.secondary,
    lineHeight: 20,
  },
  moduleSection: {
    marginTop: 18,
  },
  moduleTitle: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "800",
    color: hatchColors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    ...hatchShadows.sm,
  },
  lessonCardLocked: {
    opacity: 0.6,
  },
  lessonCardCompleted: {
    backgroundColor: hatchColors.background.secondary,
  },
  lessonCardNext: {
    borderColor: hatchColors.primary.default,
  },
  lessonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: hatchColors.primary.default,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  lessonIconLocked: {
    backgroundColor: hatchColors.background.tertiary,
  },
  lessonBody: {
    flex: 1,
  },
  lessonTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lessonTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: hatchColors.text.primary,
    marginRight: 8,
  },
  lessonMeta: {
    marginTop: 4,
    fontSize: 12,
    color: hatchColors.text.secondary,
    lineHeight: 18,
  },
  nextBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: hatchColors.primary.muted,
  },
  nextBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: hatchColors.primary.default,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
});
