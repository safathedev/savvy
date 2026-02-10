import { hatchColors, hatchShadows } from "@/constants/theme";
import {
  InteractiveTask,
  QUIZ_PASSING_PERCENT,
  findLessonById,
  getNextLesson,
  isLessonUnlocked,
} from "@/data/moms-investment-journey";
import { useApp } from "@/lib/app-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PracticeInputs = Record<string, Record<string, string>>;
type PracticeChoices = Record<string, string>;

type PracticeResult = {
  title: string;
  detail: string;
  tone: "good" | "warn" | "neutral";
};

function sanitizeNumberInput(value: string): string {
  return value.replace(/[^0-9.,]/g, "");
}

function parseNumber(value?: string): number {
  if (!value) return 0;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getPracticeResult(taskId: string, values: Record<string, string>): PracticeResult | null {
  if (taskId === "cashflow_snapshot") {
    const income = parseNumber(values.income);
    const fixed = parseNumber(values.fixed);
    const flex = parseNumber(values.flex);
    if (income <= 0) return null;
    const remaining = income - fixed - flex;

    if (remaining >= 0) {
      return {
        title: `Remaining this month: ${formatNumber(remaining)}`,
        detail: "Good. Protect essentials first, then decide where the remainder should go.",
        tone: "good",
      };
    }

    return {
      title: `Current gap: ${formatNumber(Math.abs(remaining))}`,
      detail: "Reduce one flexible category first and re-check this snapshot.",
      tone: "warn",
    };
  }

  if (taskId === "bucket_split_planner") {
    const income = parseNumber(values.income);
    const essentialsPct = parseNumber(values.essentials_pct);
    const flexPct = parseNumber(values.flex_pct);
    if (income <= 0) return null;

    const futurePct = 100 - essentialsPct - flexPct;
    if (futurePct < 0) {
      return {
        title: "Percent total is above 100%",
        detail: "Lower essentials or life/flex percentages so future stays positive.",
        tone: "warn",
      };
    }

    const essentialsAmount = (income * essentialsPct) / 100;
    const flexAmount = (income * flexPct) / 100;
    const futureAmount = income - essentialsAmount - flexAmount;

    return {
      title: `Future bucket: ${formatNumber(futureAmount)} (${futurePct.toFixed(0)}%)`,
      detail: `Essentials ${formatNumber(essentialsAmount)} | Life/Flex ${formatNumber(flexAmount)}`,
      tone: "good",
    };
  }

  if (taskId === "unit_price_lab") {
    const aPrice = parseNumber(values.a_price);
    const aSize = parseNumber(values.a_size);
    const bPrice = parseNumber(values.b_price);
    const bSize = parseNumber(values.b_size);
    if (aPrice <= 0 || aSize <= 0 || bPrice <= 0 || bSize <= 0) return null;

    const unitA = (aPrice / aSize) * 100;
    const unitB = (bPrice / bSize) * 100;
    const cheaper = unitA < unitB ? "A" : unitB < unitA ? "B" : "Tie";

    return {
      title: `A: ${formatNumber(unitA)} /100 | B: ${formatNumber(unitB)} /100`,
      detail:
        cheaper === "Tie"
          ? "Both are equal in unit price."
          : `Product ${cheaper} is better value per 100g/ml.`,
      tone: "good",
    };
  }

  if (taskId === "emergency_target_builder") {
    const essentials = parseNumber(values.essentials);
    const months = parseNumber(values.months);
    if (essentials <= 0 || months <= 0) return null;

    const target = essentials * months;
    return {
      title: `Starter target: ${formatNumber(target)}`,
      detail: "Set one automatic transfer so this target grows every month.",
      tone: "good",
    };
  }

  if (taskId === "automation_rule_builder") {
    const defaultAmount = parseNumber(values.default_amount);
    const fallbackAmount = parseNumber(values.fallback_amount);
    if (defaultAmount <= 0 || fallbackAmount <= 0) return null;

    return {
      title: `Default year: ${formatNumber(defaultAmount * 12)} | Fallback year: ${formatNumber(fallbackAmount * 12)}`,
      detail: "The fallback keeps your habit alive during difficult months.",
      tone: "neutral",
    };
  }

  if (taskId === "long_term_growth_check") {
    const monthly = parseNumber(values.monthly);
    const years = parseNumber(values.years);
    const returnRate = parseNumber(values.return_rate) || 5;
    if (monthly <= 0 || years <= 0) return null;

    const n = years * 12;
    const monthlyRate = returnRate / 100 / 12;
    const contributions = monthly * n;
    const estimatedValue =
      monthlyRate > 0
        ? monthly * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate)
        : contributions;
    const estimatedGrowth = Math.max(0, estimatedValue - contributions);

    return {
      title: `Estimated value: ${formatNumber(estimatedValue)}`,
      detail: `Contributions ${formatNumber(contributions)} | Estimated growth ${formatNumber(estimatedGrowth)}`,
      tone: "good",
    };
  }

  return null;
}

function getTaskCompletionCount(
  tasks: InteractiveTask[],
  taskInputs: PracticeInputs,
  taskChoices: PracticeChoices
): number {
  let completed = 0;

  tasks.forEach((task) => {
    if (task.type === "scenario_choice" || task.type === "comparison_picker" || task.type === "multi_choice") {
      if (taskChoices[task.task_id]) completed += 1;
      return;
    }

    const fields = Array.isArray(task.fields) ? task.fields : [];
    if (fields.length === 0) return;

    const values = taskInputs[task.task_id] || {};
    const allFilled = fields.every((field: any) => {
      const key = typeof field?.key === "string" ? field.key : "";
      return key && values[key] && values[key].trim().length > 0;
    });
    if (allFilled) completed += 1;
  });

  return completed;
}

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completedLessons, markLessonComplete, isLessonCompleted } = useApp();

  const lesson = findLessonById(id as string);

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const [taskInputs, setTaskInputs] = useState<PracticeInputs>({});
  const [taskChoices, setTaskChoices] = useState<PracticeChoices>({});

  if (!lesson) {
    return (
      <View style={[s.root, { paddingTop: insets.top + 16 }]}>
        <View style={s.centerCard}>
          <Ionicons name="alert-circle-outline" size={52} color={hatchColors.text.tertiary} />
          <Text style={s.centerTitle}>Lesson not found</Text>
          <Text style={s.centerText}>ID: {id}</Text>
          <Pressable style={s.primaryBtn} onPress={() => router.back()}>
            <Text style={s.primaryBtnText}>Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isCompleted = isLessonCompleted(lesson.lesson_id);
  const unlocked = isLessonUnlocked(lesson.lesson_id, completedLessons);
  const locked = !isCompleted && !unlocked;

  const quizQuestions = lesson.quiz?.questions ?? [];
  const hasQuiz = quizQuestions.length > 0;
  const nextLesson = getNextLesson(lesson.lesson_id);
  const practiceTasks = lesson.interactive_tasks ?? [];

  const answeredCount = quizQuestions.filter(
    (question) => quizAnswers[question.id] !== undefined
  ).length;
  const completedPracticeCount = useMemo(
    () => getTaskCompletionCount(practiceTasks, taskInputs, taskChoices),
    [practiceTasks, taskChoices, taskInputs]
  );

  const score = useMemo(() => {
    if (!hasQuiz) return { correct: 0, total: 0, percent: 100 };

    let correct = 0;
    for (const question of quizQuestions) {
      if (question.type === "multi_choice") {
        if (quizAnswers[question.id] === question.answer_index) correct += 1;
      } else {
        const answerAsBool = quizAnswers[question.id] === 0;
        if (answerAsBool === question.answer) correct += 1;
      }
    }

    const percent = quizQuestions.length
      ? Math.round((correct / quizQuestions.length) * 100)
      : 0;

    return { correct, total: quizQuestions.length, percent };
  }, [hasQuiz, quizAnswers, quizQuestions]);

  const completionReady = isCompleted || !hasQuiz || quizPassed;

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const updateTaskInput = (taskId: string, key: string, value: string) => {
    const normalized = sanitizeNumberInput(value);
    setTaskInputs((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        [key]: normalized,
      },
    }));
  };

  const selectTaskOption = (taskId: string, optionId: string) => {
    setTaskChoices((prev) => ({ ...prev, [taskId]: optionId }));
    Haptics.selectionAsync();
  };

  const handleSubmitQuiz = async () => {
    const passed = score.percent >= QUIZ_PASSING_PERCENT;
    setQuizPassed(passed);
    setShowQuizResult(true);

    if (!passed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (!isCompleted) {
      await markLessonComplete(lesson.lesson_id);
    }
    setShowCelebration(true);
  };

  const handleRetryQuiz = () => {
    setShowQuizResult(false);
    setQuizPassed(false);
    setQuizIndex(0);
  };

  const handleCompleteNoQuiz = async () => {
    if (isCompleted || hasQuiz) return;
    await markLessonComplete(lesson.lesson_id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCelebration(true);
  };

  const handleContinueAfterCelebration = () => {
    setShowCelebration(false);

    if (nextLesson) {
      router.replace(`/lesson/${nextLesson.lesson_id}` as any);
      return;
    }

    router.replace("/(tabs)/academy" as any);
  };

  const handleBottomAction = async () => {
    if (isCompleted) {
      if (nextLesson) {
        router.replace(`/lesson/${nextLesson.lesson_id}` as any);
      } else {
        router.replace("/(tabs)/academy" as any);
      }
      return;
    }

    if (!hasQuiz) {
      await handleCompleteNoQuiz();
    }
  };

  const renderPracticeTask = (task: InteractiveTask, index: number) => {
    const fields = Array.isArray(task.fields) ? task.fields : [];
    const options = Array.isArray(task.options) ? task.options : [];
    const values = taskInputs[task.task_id] || {};
    const selectedOptionId = taskChoices[task.task_id];
    const selectedOption = options.find((option: any, optionIndex) => {
      const optionId =
        typeof option?.id === "string" && option.id.trim() ? option.id : `option-${optionIndex}`;
      return optionId === selectedOptionId;
    });
    const result = getPracticeResult(task.task_id, values);

    return (
      <Animated.View
        key={`${task.task_id}-${index}`}
        entering={FadeInDown.delay(100 + index * 40).duration(260)}
        style={s.practiceCard}
      >
        <Text style={s.practiceTitle}>{task.title}</Text>
        {task.description ? <Text style={s.practiceDescription}>{task.description}</Text> : null}

        {fields.length > 0 ? (
          <View style={s.fieldGroup}>
            {fields.map((field: any, fieldIndex) => {
              const key = typeof field?.key === "string" ? field.key : `field_${fieldIndex}`;
              const label = typeof field?.label === "string" ? field.label : `Field ${fieldIndex + 1}`;
              const placeholder = typeof field?.placeholder === "string" ? field.placeholder : "0";

              return (
                <View key={`${task.task_id}-${key}`} style={s.fieldRow}>
                  <Text style={s.fieldLabel}>{label}</Text>
                  <TextInput
                    value={values[key] || ""}
                    onChangeText={(value) => updateTaskInput(task.task_id, key, value)}
                    keyboardType="decimal-pad"
                    placeholder={placeholder}
                    placeholderTextColor={hatchColors.text.secondary}
                    style={s.fieldInput}
                  />
                </View>
              );
            })}
          </View>
        ) : null}

        {options.length > 0 ? (
          <View>
            {options.map((option: any, optionIndex) => {
              const optionId =
                typeof option?.id === "string" && option.id.trim() ? option.id : `option-${optionIndex}`;
              const selected = selectedOptionId === optionId;
              return (
                <Pressable
                  key={`${task.task_id}-${optionId}-${optionIndex}`}
                  onPress={() => selectTaskOption(task.task_id, optionId)}
                  style={[s.optionBtn, selected && s.optionBtnSelected]}
                >
                  <Text style={[s.optionText, selected && s.optionTextSelected]}>
                    {typeof option?.label === "string" ? option.label : "Option"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {result ? (
          <View
            style={[
              s.resultCard,
              result.tone === "good" && s.resultCardGood,
              result.tone === "warn" && s.resultCardWarn,
            ]}
          >
            <Text style={s.resultCardTitle}>{result.title}</Text>
            <Text style={s.resultCardText}>{result.detail}</Text>
          </View>
        ) : null}

        {selectedOption?.feedback ? (
          <Text style={s.feedbackText}>{String(selectedOption.feedback)}</Text>
        ) : null}

        {task.hint ? <Text style={s.hintText}>{task.hint}</Text> : null}
      </Animated.View>
    );
  };

  if (locked) {
    return (
      <View style={[s.root, { paddingTop: insets.top + 16 }]}>
        <View style={s.centerCard}>
          <Ionicons name="lock-closed" size={52} color={hatchColors.text.tertiary} />
          <Text style={s.centerTitle}>This lesson is locked</Text>
          <Text style={s.centerText}>Complete the previous lesson first.</Text>
          <Pressable style={s.primaryBtn} onPress={() => router.replace("/(tabs)/academy" as any)}>
            <Text style={s.primaryBtnText}>Go to academy</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const currentQuestion = quizQuestions[quizIndex];

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={s.headerBtn}>
          <Ionicons name="chevron-back" size={22} color={hatchColors.text.primary} />
        </Pressable>
        <View style={s.headerMeta}>
          <Text style={s.headerDuration}>{lesson.duration}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 120 }}
      >
        <Animated.View entering={FadeInDown.duration(300)}>
          <Text style={s.title}>{lesson.title}</Text>
          <Text style={s.objective}>{lesson.objective}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(260)} style={s.articleCard}>
          {lesson.content_blocks?.map((block, index) => (
            <Text key={`${lesson.lesson_id}-paragraph-${index}`} style={[s.paragraph, index === 0 && s.paragraphLead]}>
              {block.text}
            </Text>
          ))}
        </Animated.View>

        {practiceTasks.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Guided practice</Text>
            {practiceTasks.map((task, index) => renderPracticeTask(task, index))}
          </View>
        ) : null}

        {hasQuiz ? (
          <Animated.View entering={FadeInDown.delay(220).duration(250)} style={s.section}>
            <Text style={s.sectionTitle}>Lesson quiz</Text>
            <View style={s.quizCard}>
              {!showQuizResult ? (
                <>
                  <Text style={s.quizProgress}>
                    Question {quizIndex + 1} / {quizQuestions.length}
                  </Text>

                  {currentQuestion ? (
                    <View>
                      <Text style={s.quizQuestion}>{currentQuestion.prompt}</Text>

                      {currentQuestion.type === "multi_choice" &&
                        currentQuestion.options?.map((option, index) => {
                          const selected = quizAnswers[currentQuestion.id] === index;
                          return (
                            <Pressable
                              key={`${currentQuestion.id}-${index}`}
                              onPress={() => handleQuizAnswer(currentQuestion.id, index)}
                              style={[s.optionBtn, selected && s.optionBtnSelected]}
                            >
                              <Text style={[s.optionText, selected && s.optionTextSelected]}>
                                {option}
                              </Text>
                            </Pressable>
                          );
                        })}

                      {currentQuestion.type === "true_false" ? (
                        <View style={s.trueFalseRow}>
                          {["True", "False"].map((label, index) => {
                            const selected = quizAnswers[currentQuestion.id] === index;
                            return (
                              <Pressable
                                key={`${currentQuestion.id}-${label}-${index}`}
                                onPress={() => handleQuizAnswer(currentQuestion.id, index)}
                                style={[s.trueFalseBtn, selected && s.optionBtnSelected]}
                              >
                                <Text style={[s.optionText, selected && s.optionTextSelected]}>
                                  {label}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  <View style={s.quizNavRow}>
                    <Pressable
                      disabled={quizIndex === 0}
                      onPress={() => setQuizIndex((value) => Math.max(0, value - 1))}
                      style={[s.ghostBtn, quizIndex === 0 && s.disabledBtn]}
                    >
                      <Text style={s.ghostBtnText}>Back</Text>
                    </Pressable>

                    {quizIndex < quizQuestions.length - 1 ? (
                      <Pressable
                        onPress={() => setQuizIndex((value) => Math.min(quizQuestions.length - 1, value + 1))}
                        style={s.ghostBtn}
                      >
                        <Text style={s.ghostBtnText}>Next</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        disabled={answeredCount !== quizQuestions.length}
                        onPress={handleSubmitQuiz}
                        style={[s.submitBtn, answeredCount !== quizQuestions.length && s.disabledBtn]}
                      >
                        <Text style={s.submitBtnText}>Check answers</Text>
                      </Pressable>
                    )}
                  </View>
                </>
              ) : (
                <View>
                  <Text style={s.resultScore}>
                    {score.correct}/{score.total} correct ({score.percent}%)
                  </Text>
                  <Text style={s.resultStatus}>
                    {quizPassed
                      ? "Passed. Great work."
                      : `Not passed yet. You need ${QUIZ_PASSING_PERCENT}% and can retry now.`}
                  </Text>

                  {!quizPassed ? (
                    <Pressable onPress={handleRetryQuiz} style={s.submitBtn}>
                      <Text style={s.submitBtnText}>Retry quiz</Text>
                    </Pressable>
                  ) : null}
                </View>
              )}
            </View>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(250).duration(250)} style={s.section}>
          <Text style={s.sectionTitle}>Summary</Text>
          <View style={s.infoCard}>
            <Text style={s.infoText}>{lesson.objective}</Text>
            {practiceTasks.length > 0 ? (
              <Text style={s.summaryMeta}>
                Guided practice completed: {completedPracticeCount}/{practiceTasks.length}
              </Text>
            ) : null}
            {hasQuiz && !isCompleted ? (
              <Text style={s.summaryHint}>This lesson is completed automatically when you pass the quiz.</Text>
            ) : null}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 14 }]}>
        <Pressable
          onPress={handleBottomAction}
          style={[s.primaryBtn, !completionReady && !isCompleted && s.disabledBtn]}
          disabled={!isCompleted && hasQuiz}
        >
          <Text style={s.primaryBtnText}>
            {isCompleted
              ? nextLesson
                ? "Go to next lesson"
                : "Back to academy"
              : hasQuiz
                ? "Pass quiz to complete"
                : "Complete lesson"}
          </Text>
        </Pressable>
      </View>

      <Modal visible={showCelebration} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.modalCard}>
            <Ionicons name="trophy" size={54} color={hatchColors.primary.default} />
            <Text style={s.modalTitle}>Congratulations</Text>
            <Text style={s.modalText}>
              Lesson completed. {nextLesson ? `Next lesson unlocked: ${nextLesson.title}` : "You finished all lessons."}
            </Text>

            <Pressable style={s.primaryBtn} onPress={handleContinueAfterCelebration}>
              <Text style={s.primaryBtnText}>{nextLesson ? "Next lesson" : "Back to academy"}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: hatchColors.background.primary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: hatchColors.border.default,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: hatchColors.background.secondary,
  },
  headerMeta: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: hatchColors.primary.muted,
  },
  headerDuration: {
    fontSize: 12,
    fontWeight: "700",
    color: hatchColors.primary.default,
  },
  title: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: "800",
    color: hatchColors.text.primary,
  },
  objective: {
    marginTop: 6,
    fontSize: 15,
    color: hatchColors.text.secondary,
    lineHeight: 21,
  },
  articleCard: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: "#FFFFFF",
    padding: 14,
  },
  paragraph: {
    fontSize: 15,
    color: hatchColors.text.primary,
    lineHeight: 22,
    marginBottom: 10,
  },
  paragraphLead: {
    fontWeight: "600",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "800",
    color: hatchColors.text.tertiary,
    textTransform: "uppercase",
  },
  practiceCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 10,
    ...hatchShadows.sm,
  },
  practiceTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: hatchColors.text.primary,
  },
  practiceDescription: {
    marginTop: 5,
    fontSize: 13,
    color: hatchColors.text.secondary,
    lineHeight: 19,
  },
  fieldGroup: {
    marginTop: 8,
    gap: 8,
  },
  fieldRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: hatchColors.background.secondary,
    padding: 10,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: hatchColors.text.tertiary,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  fieldInput: {
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: "700",
    color: hatchColors.text.primary,
  },
  resultCard: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: hatchColors.background.secondary,
    padding: 10,
  },
  resultCardGood: {
    borderColor: hatchColors.primary.default,
    backgroundColor: hatchColors.primary.muted,
  },
  resultCardWarn: {
    borderColor: hatchColors.status.error,
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  resultCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: hatchColors.text.primary,
  },
  resultCardText: {
    marginTop: 4,
    fontSize: 12,
    color: hatchColors.text.secondary,
    lineHeight: 18,
  },
  feedbackText: {
    marginTop: 8,
    fontSize: 12,
    color: hatchColors.text.secondary,
    lineHeight: 18,
  },
  hintText: {
    marginTop: 6,
    fontSize: 12,
    color: hatchColors.text.tertiary,
  },
  infoCard: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: hatchColors.background.secondary,
  },
  infoText: {
    fontSize: 14,
    color: hatchColors.text.secondary,
    lineHeight: 20,
  },
  quizCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: "#FFFFFF",
    padding: 12,
    ...hatchShadows.sm,
  },
  quizProgress: {
    fontSize: 12,
    fontWeight: "700",
    color: hatchColors.text.tertiary,
  },
  quizQuestion: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: hatchColors.text.primary,
    lineHeight: 22,
    marginBottom: 8,
  },
  optionBtn: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    marginBottom: 8,
    backgroundColor: hatchColors.background.secondary,
  },
  optionBtnSelected: {
    borderColor: hatchColors.primary.default,
    backgroundColor: hatchColors.primary.muted,
  },
  optionText: {
    fontSize: 14,
    color: hatchColors.text.primary,
    fontWeight: "600",
  },
  optionTextSelected: {
    color: hatchColors.primary.default,
  },
  trueFalseRow: {
    flexDirection: "row",
    gap: 8,
  },
  trueFalseBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: hatchColors.background.secondary,
    alignItems: "center",
  },
  quizNavRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ghostBtn: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: hatchColors.background.secondary,
  },
  ghostBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: hatchColors.text.secondary,
  },
  submitBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: hatchColors.primary.default,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  resultScore: {
    fontSize: 18,
    fontWeight: "800",
    color: hatchColors.text.primary,
  },
  resultStatus: {
    marginTop: 6,
    fontSize: 14,
    color: hatchColors.text.secondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  summaryMeta: {
    marginTop: 6,
    fontSize: 12,
    color: hatchColors.text.tertiary,
  },
  summaryHint: {
    marginTop: 4,
    fontSize: 12,
    color: hatchColors.text.secondary,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: hatchColors.border.default,
    backgroundColor: hatchColors.background.primary,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: hatchColors.primary.default,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "800",
    color: hatchColors.text.primary,
  },
  modalText: {
    marginTop: 8,
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
    color: hatchColors.text.secondary,
    lineHeight: 20,
  },
  centerCard: {
    marginTop: 80,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
  },
  centerTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "800",
    color: hatchColors.text.primary,
  },
  centerText: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 14,
    color: hatchColors.text.secondary,
    textAlign: "center",
  },
});
