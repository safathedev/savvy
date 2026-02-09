// ─────────────────────────────────────────────────────────────
// Savvy — Academy Screen (Complete with Stats Card)
// ─────────────────────────────────────────────────────────────

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hatchColors } from "@/constants/theme";
import { momsInvestmentJourney } from "@/data/moms-investment-journey";
import { useApp } from "@/lib/app-context";

export default function AcademyScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { completedLessons } = useApp();
    const [activeLevel, setActiveLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");

    const currentLevel = momsInvestmentJourney.find((l) => l.level_id === activeLevel);

    // Find next lesson to highlight (first uncompleted lesson)
    let nextLessonId: string | null = null;
    currentLevel?.modules.forEach((m) => {
        m.lessons.forEach((l) => {
            if (!nextLessonId && !completedLessons.includes(l.lesson_id)) {
                nextLessonId = l.lesson_id;
            }
        });
    });

    const nav = (path: string, isLocked: boolean) => {
        if (isLocked) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(path as any);
    };

    // Calculate progress
    const totalLessons = currentLevel?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 1;
    const completedCount = currentLevel?.modules.reduce(
        (acc, m) => acc + m.lessons.filter((l) => completedLessons.includes(l.lesson_id)).length,
        0
    ) || 0;
    const progress = Math.round((completedCount / totalLessons) * 100);

    // Calculate overall stats (across all levels)
    const allLessons = momsInvestmentJourney.reduce(
        (acc, level) => acc + level.modules.reduce((m, mod) => m + mod.lessons.length, 0),
        0
    );
    const allCompleted = momsInvestmentJourney.reduce(
        (acc, level) =>
            acc +
            level.modules.reduce(
                (m, mod) => m + mod.lessons.filter((l) => completedLessons.includes(l.lesson_id)).length,
                0
            ),
        0
    );

    return (
        <View style={s.root}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top + 16,
                    paddingBottom: insets.bottom + 40,
                    paddingHorizontal: 24,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ──────────────────────────────── */}
                <Animated.View entering={FadeInDown.duration(500)} style={s.headerSection}>
                    <View>
                        <Text style={s.greeting}>Investment Journey</Text>
                        <Text style={s.subtitle}>{currentLevel?.goal || "Learn at your own pace"}</Text>
                    </View>
                </Animated.View>

                {/* ── Stats Card (Always Visible) ──────────────────────── */}
                <Animated.View entering={FadeInDown.delay(100).duration(600)}>
                    <View style={s.statsCard}>
                        {/* Top Row: Overall Progress */}
                        <View style={s.statsRow}>
                            <View style={s.statBlock}>
                                <Text style={s.statLabel}>LESSONS</Text>
                                <Text style={s.statValue}>
                                    {allCompleted}/{allLessons}
                                </Text>
                            </View>
                            <View style={s.statDivider} />
                            <View style={s.statBlock}>
                                <Text style={s.statLabel}>XP EARNED</Text>
                                <Text style={s.statValue}>{allCompleted * 10}</Text>
                            </View>
                            <View style={s.statDivider} />
                            <View style={s.statBlock}>
                                <Text style={s.statLabel}>STREAK</Text>
                                <View style={s.streakRow}>
                                    <Ionicons name="flame" size={18} color="#FFFFFF" />
                                    <Text style={s.statValue}>0</Text>
                                </View>
                            </View>
                        </View>

                        {/* Progress Bar */}
                        {allCompleted > 0 && (
                            <View style={s.progressSection}>
                                <View style={s.progressBarOuter}>
                                    <Animated.View
                                        style={[
                                            s.progressBarInner,
                                            { width: `${Math.round((allCompleted / allLessons) * 100)}%` },
                                        ]}
                                        entering={FadeInDown.delay(200).duration(800)}
                                    />
                                </View>
                                <Text style={s.progressText}>
                                    {Math.round((allCompleted / allLessons) * 100)}% Complete
                                </Text>
                            </View>
                        )}

                        {/* Badges Row */}
                        <View style={s.badgesSection}>
                            <Text style={s.badgesLabel}>BADGES</Text>
                            <View style={s.badgesRow}>
                                {allCompleted > 0 && (
                                    <View style={s.badge}>
                                        <Ionicons name="footsteps" size={20} color="#FFFFFF" />
                                    </View>
                                )}
                                {allCompleted >= 3 && (
                                    <View style={s.badge}>
                                        <Ionicons name="calculator" size={20} color="#FFFFFF" />
                                    </View>
                                )}
                                {allCompleted >= 5 && (
                                    <View style={s.badge}>
                                        <Ionicons name="search" size={20} color="#FFFFFF" />
                                    </View>
                                )}
                                {/* Empty badge slots */}
                                {allCompleted < 5 && (
                                    <>
                                        <View style={s.badgeEmpty}>
                                            <Ionicons name="lock-closed" size={16} color="rgba(255, 255, 255, 0.5)" />
                                        </View>
                                        <View style={s.badgeEmpty}>
                                            <Ionicons name="lock-closed" size={16} color="rgba(255, 255, 255, 0.5)" />
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* ── Level Tabs ──────────────────────────── */}
                <Animated.View entering={FadeInDown.delay(150).duration(600)}>
                    <View style={s.tabs}>
                        {(["beginner", "intermediate", "advanced"] as const).map((lvl) => {
                            const level = momsInvestmentJourney.find((l) => l.level_id === lvl);
                            const levelLessons = level?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 0;
                            const levelCompleted =
                                level?.modules.reduce(
                                    (acc, m) => acc + m.lessons.filter((l) => completedLessons.includes(l.lesson_id)).length,
                                    0
                                ) || 0;
                            const levelProgress = levelLessons > 0 ? Math.round((levelCompleted / levelLessons) * 100) : 0;

                            return (
                                <Pressable
                                    key={lvl}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setActiveLevel(lvl);
                                    }}
                                    style={[s.tab, activeLevel === lvl && s.tabActive]}
                                >
                                    <Text style={[s.tabText, activeLevel === lvl && s.tabTextActive]}>
                                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                                    </Text>
                                    {levelProgress > 0 && (
                                        <Text style={[s.tabProgress, activeLevel === lvl && s.tabProgressActive]}>
                                            {levelProgress}%
                                        </Text>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* ── Lessons by Module ─────────────────────────────── */}
                {currentLevel?.modules.map((module, moduleIdx) => (
                    <Animated.View
                        key={module.module_id}
                        entering={FadeInDown.delay(200 + moduleIdx * 50).duration(600)}
                        style={s.moduleSection}
                    >
                        <Text style={s.moduleTitle}>{module.title}</Text>

                        {module.lessons.map((lesson) => {
                            const isDone = completedLessons.includes(lesson.lesson_id);
                            const isNext = lesson.lesson_id === nextLessonId;
                            const isLocked = !isDone && !isNext;

                            return (
                                <Pressable key={lesson.lesson_id} onPress={() => nav(`/lesson/${lesson.lesson_id}`, isLocked)}>
                                    {({ pressed }) => (
                                        <View
                                            style={[
                                                s.lessonCard,
                                                isNext && s.lessonCardActive,
                                                isDone && s.lessonCardDone,
                                                isLocked && s.lessonCardLocked,
                                                pressed && !isLocked && s.pressed,
                                            ]}
                                        >
                                            {/* Icon */}
                                            <View style={[s.lessonIcon, isNext && s.lessonIconActive, isDone && s.lessonIconDone, isLocked && s.lessonIconLocked]}>
                                                <Ionicons
                                                    name={isDone ? "checkmark-circle" : isLocked ? "lock-closed" : "play-circle"}
                                                    size={24}
                                                    color={isLocked ? hatchColors.primary.default : "#FFFFFF"}
                                                />
                                            </View>

                                            {/* Content */}
                                            <View style={s.lessonContent}>
                                                <View style={s.lessonTitleRow}>
                                                    <Text style={[s.lessonTitle, isNext && s.textWhite]} numberOfLines={1}>
                                                        {lesson.title}
                                                    </Text>
                                                    {isDone && (
                                                        <View style={s.doneBadge}>
                                                            <Ionicons name="checkmark" size={12} color={hatchColors.status.success} />
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={[s.lessonMeta, isNext && s.textWhiteMuted]} numberOfLines={1}>
                                                    {lesson.duration} • {lesson.objective}
                                                </Text>

                                                {/* Show quiz and task count */}
                                                {(lesson.quiz || lesson.interactive_tasks) && (
                                                    <View style={s.lessonFeatures}>
                                                        {lesson.interactive_tasks && lesson.interactive_tasks.length > 0 && (
                                                            <View style={[s.featurePill, isNext && s.featurePillActive]}>
                                                                <Ionicons
                                                                    name="create-outline"
                                                                    size={12}
                                                                    color={isNext ? "rgba(255,255,255,0.9)" : hatchColors.text.tertiary}
                                                                />
                                                                <Text style={[s.featurePillText, isNext && s.textWhiteMuted]}>
                                                                    {lesson.interactive_tasks.length}{" "}
                                                                    {lesson.interactive_tasks.length === 1 ? "task" : "tasks"}
                                                                </Text>
                                                            </View>
                                                        )}
                                                        {lesson.quiz && (
                                                            <View style={[s.featurePill, isNext && s.featurePillActive]}>
                                                                <Ionicons
                                                                    name="help-circle-outline"
                                                                    size={12}
                                                                    color={isNext ? "rgba(255,255,255,0.9)" : hatchColors.text.tertiary}
                                                                />
                                                                <Text style={[s.featurePillText, isNext && s.textWhiteMuted]}>Quiz</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                )}
                                            </View>

                                            {/* Chevron (only for unlocked) */}
                                            {!isLocked && (
                                                <Ionicons
                                                    name="chevron-forward"
                                                    size={20}
                                                    color={isNext ? "#FFFFFF" : hatchColors.text.tertiary}
                                                />
                                            )}
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}
                    </Animated.View>
                ))}

                {/* ── Empty State ─────────────────────────── */}
                {currentLevel && currentLevel.modules.length === 0 && (
                    <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                        <View style={s.emptyState}>
                            <Ionicons name="rocket-outline" size={48} color={hatchColors.text.tertiary} />
                            <Text style={s.emptyTitle}>Coming Soon</Text>
                            <Text style={s.emptyText}>{currentLevel.title} lessons are being prepared for you.</Text>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: hatchColors.background.primary,
    },

    // Header
    headerSection: {
        marginBottom: 24,
    },
    greeting: {
        fontSize: 32,
        fontWeight: "800",
        color: hatchColors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: hatchColors.text.secondary,
        lineHeight: 22,
        fontWeight: "500",
    },

    // Stats Card
    statsCard: {
        backgroundColor: hatchColors.primary.default,
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    statBlock: {
        flex: 1,
        alignItems: "center",
    },
    statLabel: {
        fontSize: 10,
        fontWeight: "800",
        color: "rgba(255, 255, 255, 0.7)",
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    streakRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    progressSection: {
        marginBottom: 20,
    },
    progressBarOuter: {
        height: 8,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressBarInner: {
        height: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        fontWeight: "700",
        color: "rgba(255, 255, 255, 0.9)",
        textAlign: "center",
    },
    badgesSection: {
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.2)",
        paddingTop: 16,
    },
    badgesLabel: {
        fontSize: 10,
        fontWeight: "800",
        color: "rgba(255, 255, 255, 0.7)",
        letterSpacing: 0.8,
        marginBottom: 12,
    },
    badgesRow: {
        flexDirection: "row",
        gap: 12,
    },
    badge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    badgeEmpty: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
        opacity: 0.6,
    },

    // Tabs
    tabs: {
        flexDirection: "row",
        backgroundColor: hatchColors.background.secondary,
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
        gap: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: "center",
        borderRadius: 12,
    },
    tabActive: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    tabText: {
        fontSize: 13,
        fontWeight: "600",
        color: hatchColors.text.tertiary,
        marginBottom: 2,
    },
    tabTextActive: {
        color: hatchColors.text.primary,
        fontWeight: "700",
    },
    tabProgress: {
        fontSize: 10,
        fontWeight: "700",
        color: hatchColors.text.tertiary,
    },
    tabProgressActive: {
        color: hatchColors.primary.default,
    },

    // Module Section
    moduleSection: {
        marginBottom: 32,
    },
    moduleTitle: {
        fontSize: 13,
        fontWeight: "800",
        color: hatchColors.text.tertiary,
        letterSpacing: 0.5,
        marginBottom: 16,
        textTransform: "uppercase",
    },

    // Lesson Card
    lessonCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    lessonCardActive: {
        backgroundColor: hatchColors.primary.default,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    lessonCardDone: {
        backgroundColor: hatchColors.background.secondary,
    },
    lessonCardLocked: {
        backgroundColor: "#E8E8E8",
    },

    // Lesson Icon
    lessonIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: hatchColors.primary.muted,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    lessonIconActive: {
        backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
    lessonIconDone: {
        backgroundColor: "rgba(16, 185, 129, 0.15)",
    },
    lessonIconLocked: {
        backgroundColor: hatchColors.primary.muted,
    },

    // Lesson Content
    lessonContent: {
        flex: 1,
    },
    lessonTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
        gap: 8,
    },
    lessonTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: hatchColors.text.primary,
        flex: 1,
    },
    doneBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    lessonMeta: {
        fontSize: 13,
        color: hatchColors.text.secondary,
        fontWeight: "500",
        marginBottom: 6,
    },
    lessonFeatures: {
        flexDirection: "row",
        gap: 8,
        marginTop: 4,
    },
    featurePill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: hatchColors.background.secondary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    featurePillActive: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    featurePillText: {
        fontSize: 11,
        fontWeight: "600",
        color: hatchColors.text.tertiary,
    },

    // Lock Icon
    lockIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: hatchColors.background.secondary,
        alignItems: "center",
        justifyContent: "center",
    },

    // Text Colors
    textWhite: {
        color: "#FFFFFF",
    },
    textWhiteMuted: {
        color: "rgba(255, 255, 255, 0.8)",
    },

    // Empty State
    emptyState: {
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: hatchColors.text.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: hatchColors.text.secondary,
        textAlign: "center",
        maxWidth: 280,
    },

    // Pressed State
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
});
