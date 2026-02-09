// Savvy Lesson Detail — Complete Implementation
import { hatchColors } from "@/constants/theme";
import { findLessonById } from "@/data/moms-investment-journey";
import { useApp } from "@/lib/app-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { markLessonComplete, isLessonCompleted } = useApp();
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Find lesson in course data
  const lesson = findLessonById(id as string);

  if (!lesson) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={hatchColors.text.tertiary} />
          <Text style={styles.errorText}>Lesson not found</Text>
          <Text style={styles.errorSubtext}>ID: {id}</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back to Academy</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isCompleted = isLessonCompleted(lesson.lesson_id);

  const handleComplete = async () => {
    if (isCompleted) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markLessonComplete(lesson.lesson_id);
    setShowCelebration(true);
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    router.back();
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const quizQuestions = lesson.quiz?.questions || [];
  const currentQuestion = quizQuestions[currentQuizIndex];
  const allQuestionsAnswered = quizQuestions.every((q) => quizAnswers[q.id] !== undefined);

  const calculateQuizScore = () => {
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (q.type === "multi_choice" && quizAnswers[q.id] === q.answer_index) {
        correct++;
      } else if (q.type === "true_false") {
        const userAnswer = quizAnswers[q.id] === 0; // 0 = true, 1 = false
        if (userAnswer === q.answer) correct++;
      }
    });
    return correct;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={hatchColors.text.primary} />
          </Pressable>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{lesson.duration}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.titleSection}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonObjective}>{lesson.objective}</Text>
        </Animated.View>

        {/* Content Blocks */}
        {lesson.content_blocks && lesson.content_blocks.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            {lesson.content_blocks.map((block, index) => (
              <View key={index} style={styles.contentBlock}>
                {block.type === "warm_intro" && (
                  <View style={styles.warmIntroBlock}>
                    <Ionicons name="heart" size={20} color={hatchColors.primary.default} />
                    <Text style={styles.warmIntroText}>{block.text}</Text>
                  </View>
                )}
                {block.type === "core_concept" && (
                  <View style={styles.coreConceptBlock}>
                    <Text style={styles.coreConceptLabel}>KEY CONCEPT</Text>
                    <Text style={styles.coreConceptText}>{block.text}</Text>
                  </View>
                )}
                {block.type === "guided_example" && (
                  <View style={styles.guidedExampleBlock}>
                    <Ionicons name="bulb-outline" size={20} color={hatchColors.accent.amber} />
                    <Text style={styles.guidedExampleText}>{block.text}</Text>
                  </View>
                )}
              </View>
            ))}
          </Animated.View>
        )}

        {/* Interactive Tasks */}
        {lesson.interactive_tasks && lesson.interactive_tasks.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={styles.sectionTitle}>Interactive Tasks</Text>
            {lesson.interactive_tasks.map((task, index) => (
              <View key={task.task_id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.taskIcon}>
                    <Ionicons
                      name={
                        task.type === "slider"
                          ? "options"
                          : task.type === "money_input"
                            ? "cash-outline"
                            : task.type === "quick_calc"
                              ? "calculator"
                              : task.type === "mini_plan_builder"
                                ? "construct"
                                : task.type === "comparison_picker"
                                  ? "git-compare"
                                  : "create-outline"
                      }
                      size={20}
                      color={hatchColors.primary.default}
                    />
                  </View>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                </View>
                <Text style={styles.taskType}>{task.type.replace(/_/g, " ").toUpperCase()}</Text>
                <View style={styles.taskPlaceholder}>
                  <Text style={styles.taskPlaceholderText}>Interactive task coming soon</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Quiz Section */}
        {lesson.quiz && quizQuestions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Text style={styles.sectionTitle}>Quick Quiz</Text>
            <View style={styles.quizCard}>
              {!showQuizResults ? (
                <>
                  <View style={styles.quizProgress}>
                    <Text style={styles.quizProgressText}>
                      Question {currentQuizIndex + 1} of {quizQuestions.length}
                    </Text>
                  </View>

                  {currentQuestion && (
                    <View style={styles.questionContainer}>
                      <Text style={styles.questionText}>{currentQuestion.prompt}</Text>

                      {currentQuestion.type === "multi_choice" &&
                        currentQuestion.options?.map((option, optIndex) => (
                          <Pressable
                            key={optIndex}
                            onPress={() => handleQuizAnswer(currentQuestion.id, optIndex)}
                            style={[
                              styles.optionButton,
                              quizAnswers[currentQuestion.id] === optIndex && styles.optionSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                quizAnswers[currentQuestion.id] === optIndex && styles.optionTextSelected,
                              ]}
                            >
                              {option}
                            </Text>
                          </Pressable>
                        ))}

                      {currentQuestion.type === "true_false" && (
                        <View style={styles.trueFalseRow}>
                          <Pressable
                            onPress={() => handleQuizAnswer(currentQuestion.id, 0)}
                            style={[
                              styles.trueFalseButton,
                              quizAnswers[currentQuestion.id] === 0 && styles.optionSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                quizAnswers[currentQuestion.id] === 0 && styles.optionTextSelected,
                              ]}
                            >
                              True
                            </Text>
                          </Pressable>
                          <Pressable
                            onPress={() => handleQuizAnswer(currentQuestion.id, 1)}
                            style={[
                              styles.trueFalseButton,
                              quizAnswers[currentQuestion.id] === 1 && styles.optionSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                quizAnswers[currentQuestion.id] === 1 && styles.optionTextSelected,
                              ]}
                            >
                              False
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.quizNavigation}>
                    {currentQuizIndex > 0 && (
                      <Pressable
                        onPress={() => setCurrentQuizIndex((i) => i - 1)}
                        style={styles.quizNavButton}
                      >
                        <Ionicons name="chevron-back" size={20} color={hatchColors.text.secondary} />
                        <Text style={styles.quizNavText}>Previous</Text>
                      </Pressable>
                    )}
                    <View style={{ flex: 1 }} />
                    {currentQuizIndex < quizQuestions.length - 1 ? (
                      <Pressable
                        onPress={() => setCurrentQuizIndex((i) => i + 1)}
                        style={styles.quizNavButton}
                      >
                        <Text style={styles.quizNavText}>Next</Text>
                        <Ionicons name="chevron-forward" size={20} color={hatchColors.text.secondary} />
                      </Pressable>
                    ) : (
                      allQuestionsAnswered && (
                        <Pressable
                          onPress={() => setShowQuizResults(true)}
                          style={styles.submitQuizButton}
                        >
                          <Text style={styles.submitQuizText}>See Results</Text>
                        </Pressable>
                      )
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.quizResults}>
                  <View style={styles.quizScore}>
                    <Text style={styles.quizScoreNumber}>
                      {calculateQuizScore()}/{quizQuestions.length}
                    </Text>
                    <Text style={styles.quizScoreLabel}>Correct</Text>
                  </View>
                  {quizQuestions.map((q, i) => (
                    <View key={q.id} style={styles.resultItem}>
                      <Ionicons
                        name={
                          (q.type === "multi_choice" && quizAnswers[q.id] === q.answer_index) ||
                            (q.type === "true_false" && (quizAnswers[q.id] === 0) === q.answer)
                            ? "checkmark-circle"
                            : "close-circle"
                        }
                        size={20}
                        color={
                          (q.type === "multi_choice" && quizAnswers[q.id] === q.answer_index) ||
                            (q.type === "true_false" && (quizAnswers[q.id] === 0) === q.answer)
                            ? hatchColors.status.success
                            : hatchColors.status.error
                        }
                      />
                      <View style={styles.resultContent}>
                        <Text style={styles.resultQuestion}>{q.prompt}</Text>
                        <Text style={styles.resultExplanation}>{q.explanation}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Complete Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={handleComplete}
          disabled={isCompleted}
          style={({ pressed }) => [
            styles.completeButton,
            isCompleted && styles.completedButton,
            pressed && !isCompleted && styles.buttonPressed,
          ]}
        >
          <Text style={[styles.completeButtonText, isCompleted && styles.completedButtonText]}>
            {isCompleted ? "✓ Completed" : "Mark as Complete"}
          </Text>
        </Pressable>
      </View>

      {/* Celebration Modal */}
      <Modal visible={showCelebration} animationType="fade" transparent>
        <View style={styles.celebrationOverlay}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.celebrationCard}>
            <View style={styles.celebrationIcon}>
              <Ionicons name="trophy" size={64} color={hatchColors.accent.amber} />
            </View>
            <Text style={styles.celebrationTitle}>Well done! 🎉</Text>
            <Text style={styles.celebrationText}>
              You've completed "{lesson.title}" and earned 10 XP!
            </Text>
            <Pressable onPress={handleCloseCelebration} style={styles.celebrationButton}>
              <Text style={styles.celebrationButtonText}>Continue</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: hatchColors.background.primary,
  },
  header: {
    backgroundColor: hatchColors.background.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: hatchColors.border.light,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: hatchColors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadge: {
    backgroundColor: hatchColors.primary.muted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: hatchColors.primary.default,
  },
  scrollContent: {
    padding: 24,
  },
  titleSection: {
    marginBottom: 32,
  },
  lessonTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: hatchColors.text.primary,
    marginBottom: 12,
  },
  lessonObjective: {
    fontSize: 16,
    color: hatchColors.text.secondary,
    lineHeight: 24,
  },
  contentBlock: {
    marginBottom: 20,
  },
  warmIntroBlock: {
    flexDirection: "row",
    backgroundColor: hatchColors.primary.muted,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  warmIntroText: {
    flex: 1,
    fontSize: 15,
    color: hatchColors.text.primary,
    lineHeight: 22,
    fontStyle: "italic",
  },
  coreConceptBlock: {
    backgroundColor: hatchColors.background.secondary,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: hatchColors.primary.default,
  },
  coreConceptLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: hatchColors.text.tertiary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  coreConceptText: {
    fontSize: 16,
    color: hatchColors.text.primary,
    lineHeight: 24,
    fontWeight: "600",
  },
  guidedExampleBlock: {
    flexDirection: "row",
    backgroundColor: hatchColors.accent.warm,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  guidedExampleText: {
    flex: 1,
    fontSize: 14,
    color: hatchColors.accent.warmText,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: hatchColors.text.tertiary,
    letterSpacing: 0.5,
    marginBottom: 16,
    marginTop: 16,
    textTransform: "uppercase",
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  taskIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: hatchColors.primary.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: hatchColors.text.primary,
  },
  taskType: {
    fontSize: 10,
    fontWeight: "700",
    color: hatchColors.text.tertiary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  taskPlaceholder: {
    backgroundColor: hatchColors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  taskPlaceholderText: {
    fontSize: 13,
    color: hatchColors.text.tertiary,
  },
  quizCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  quizProgress: {
    marginBottom: 16,
  },
  quizProgressText: {
    fontSize: 12,
    fontWeight: "700",
    color: hatchColors.text.tertiary,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 17,
    fontWeight: "600",
    color: hatchColors.text.primary,
    marginBottom: 16,
    lineHeight: 24,
  },
  optionButton: {
    backgroundColor: hatchColors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: {
    backgroundColor: hatchColors.primary.muted,
    borderColor: hatchColors.primary.default,
  },
  optionText: {
    fontSize: 15,
    color: hatchColors.text.primary,
  },
  optionTextSelected: {
    color: hatchColors.primary.default,
    fontWeight: "600",
  },
  trueFalseRow: {
    flexDirection: "row",
    gap: 12,
  },
  trueFalseButton: {
    flex: 1,
    backgroundColor: hatchColors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  quizNavigation: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: hatchColors.border.light,
  },
  quizNavButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  quizNavText: {
    fontSize: 14,
    color: hatchColors.text.secondary,
    fontWeight: "600",
  },
  submitQuizButton: {
    backgroundColor: hatchColors.primary.default,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  submitQuizText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  quizResults: {},
  quizScore: {
    alignItems: "center",
    marginBottom: 24,
  },
  quizScoreNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: hatchColors.primary.default,
  },
  quizScoreLabel: {
    fontSize: 14,
    color: hatchColors.text.secondary,
  },
  resultItem: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  resultContent: {
    flex: 1,
  },
  resultQuestion: {
    fontSize: 14,
    fontWeight: "600",
    color: hatchColors.text.primary,
    marginBottom: 4,
  },
  resultExplanation: {
    fontSize: 13,
    color: hatchColors.text.secondary,
    lineHeight: 18,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: hatchColors.background.primary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: hatchColors.border.light,
    padding: 16,
  },
  completeButton: {
    backgroundColor: hatchColors.primary.default,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  completedButton: {
    backgroundColor: hatchColors.background.secondary,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  completedButtonText: {
    color: hatchColors.status.success,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "700",
    color: hatchColors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: hatchColors.text.tertiary,
    marginBottom: 24,
  },
  backLink: {
    backgroundColor: hatchColors.primary.muted,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backLinkText: {
    fontSize: 15,
    fontWeight: "600",
    color: hatchColors.primary.default,
  },
  celebrationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  celebrationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  celebrationIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: hatchColors.accent.warm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: hatchColors.text.primary,
    marginBottom: 12,
  },
  celebrationText: {
    fontSize: 15,
    color: hatchColors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  celebrationButton: {
    backgroundColor: hatchColors.primary.default,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  celebrationButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
