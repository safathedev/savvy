// Savvy Onboarding - Minimalist White Design

import React, { useCallback, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useApp, UserProfile } from "@/lib/app-context";
import { defaultCurrency } from "@/constants/currencies";
import { requestNotificationPermissions, scheduleDailyReminder } from "@/lib/notifications";
import { hatchColors, hatchRadius, hatchSpacing, hatchTypography } from "@/constants/theme";

type Goal = "save" | "invest" | "both";
type LifeSituation = "single" | "parent" | "couple" | "family";

interface OnboardingData {
  name: string;
  lifeSituation: LifeSituation;
  monthlyIncome: number;
  goal: Goal;
  motivation: string;
}

export default function Onboarding() {
  const router = useRouter();
  const { setUserProfile, recordActivity } = useApp();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    lifeSituation: "parent",
    monthlyIncome: 0,
    goal: "both",
    motivation: "",
  });

  const totalSteps = 4;

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0) {
      setStep(step - 1);
    }
  }, [step]);

  const handleComplete = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const notificationsGranted = await requestNotificationPermissions();

    if (notificationsGranted) {
      await scheduleDailyReminder(9, 0);
    }

    const profile: UserProfile = {
      name: data.name || "there",
      goal: data.goal,
      currency: defaultCurrency,
      hasCompletedOnboarding: true,
      notificationsEnabled: notificationsGranted,
      reminderTime: "09:00",
      monthlyIncome: data.monthlyIncome > 0 ? data.monthlyIncome : undefined,
    };

    await setUserProfile(profile);
    await recordActivity();
    router.replace("/(tabs)");
  }, [data, setUserProfile, router]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return (
          <NameStep
            value={data.name}
            onChange={(name) => setData({ ...data, name })}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <GoalStep
            value={data.goal}
            onChange={(goal) => setData({ ...data, goal })}
            onNext={handleNext}
          />
        );
      case 3:
        return <ReadyStep name={data.name || "there"} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
          {step > 0 && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.backButton}>
              <Pressable onPress={handleBack} style={styles.backButtonInner}>
                <Ionicons name="chevron-back" size={24} color={hatchColors.text.primary} />
                <Text style={styles.backText}>Back</Text>
              </Pressable>
            </Animated.View>
          )}

          <View style={styles.content}>{renderStep()}</View>

          <View style={styles.progressContainer}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i === step && styles.progressDotActive,
                  i < step && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.stepContainer}>
      <View style={styles.appIconContainer}>
        <Image
          source={require("@/assets/images/savvy_app_icon.png")}
          style={styles.appIcon}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.title}>Welcome to Savvy</Text>
      <Text style={styles.subtitle}>Your personal guide to{"\n"}smarter money habits</Text>
      <View style={styles.buttonWrapper}>
        <Pressable onPress={onNext}>
          <View style={styles.primaryButton}>
            <Text style={styles.buttonText}>Get Started</Text>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function NameStep({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  const handleContinue = () => {
    if (!value.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    onNext();
  };

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContainer}>
      <Text style={styles.title}>What should we call you?</Text>
      <Text style={styles.subtitle}>We'll use this to personalise your experience</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Your first name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Gemma"
          placeholderTextColor={hatchColors.text.tertiary}
          value={value}
          onChangeText={onChange}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </View>
      <View style={styles.buttonWrapper}>
        <Pressable onPress={handleContinue}>
          <View style={[styles.primaryButton, !value.trim() && styles.primaryButtonDisabled]}>
            <Text style={styles.buttonText}>Continue</Text>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function GoalStep({ value, onChange, onNext }: { value: Goal; onChange: (g: Goal) => void; onNext: () => void }) {
  const goals: { id: Goal; label: string; icon: string; description: string }[] = [
    { id: "save", label: "Save Money", icon: "wallet-outline", description: "Learn practical tips to save daily" },
    { id: "invest", label: "Learn Investing", icon: "trending-up-outline", description: "Understand the basics of investing" },
    { id: "both", label: "Both", icon: "sparkles-outline", description: "The complete financial journey" },
  ];

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContainer}>
      <Text style={styles.title}>What's your main goal?</Text>
      <Text style={styles.subtitle}>Choose what matters most to you right now</Text>
      <View style={styles.goalsContainer}>
        {goals.map((goal) => (
          <Pressable
            key={goal.id}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(goal.id);
            }}
            style={[styles.goalCard, value === goal.id && styles.goalCardSelected]}
          >
            <View style={[styles.goalIcon, value === goal.id && styles.goalIconSelected]}>
              <Ionicons
                name={goal.icon as any}
                size={24}
                color={value === goal.id ? hatchColors.text.inverse : hatchColors.primary.default}
              />
            </View>
            <View style={styles.goalContent}>
              <Text style={styles.goalLabel}>{goal.label}</Text>
              <Text style={styles.goalDescription}>{goal.description}</Text>
            </View>
            <View style={[styles.radioOuter, value === goal.id && styles.radioOuterSelected]}>
              {value === goal.id && <View style={styles.radioInner} />}
            </View>
          </Pressable>
        ))}
      </View>
      <View style={styles.buttonWrapper}>
        <Pressable onPress={onNext}>
          <View style={styles.primaryButton}>
            <Text style={styles.buttonText}>Continue</Text>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function LifeSituationStep({
  value,
  onChange,
  onNext,
}: {
  value: LifeSituation;
  onChange: (v: LifeSituation) => void;
  onNext: () => void;
}) {
  const situations: { id: LifeSituation; label: string; icon: string; description: string }[] = [
    { id: "parent", label: "Parent/Mum", icon: "heart-outline", description: "Raising children, juggling it all" },
    { id: "family", label: "Family", icon: "people-outline", description: "Managing household finances" },
    { id: "couple", label: "In a relationship", icon: "heart-circle-outline", description: "Planning together" },
    { id: "single", label: "Single", icon: "person-outline", description: "Building my own path" },
  ];

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContainer}>
      <Text style={styles.title}>Tell us about yourself</Text>
      <Text style={styles.subtitle}>This helps us personalise your experience</Text>
      <View style={styles.goalsContainer}>
        {situations.map((situation) => (
          <Pressable
            key={situation.id}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(situation.id);
            }}
            style={[styles.goalCard, value === situation.id && styles.goalCardSelected]}
          >
            <View style={[styles.goalIcon, value === situation.id && styles.goalIconSelected]}>
              <Ionicons
                name={situation.icon as any}
                size={24}
                color={value === situation.id ? hatchColors.text.inverse : hatchColors.primary.default}
              />
            </View>
            <View style={styles.goalContent}>
              <Text style={styles.goalLabel}>{situation.label}</Text>
              <Text style={styles.goalDescription}>{situation.description}</Text>
            </View>
            <View style={[styles.radioOuter, value === situation.id && styles.radioOuterSelected]}>
              {value === situation.id && <View style={styles.radioInner} />}
            </View>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={onNext}>
        <View style={styles.primaryButton}>
          <Text style={styles.buttonText}>Continue</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function MonthlyIncomeStep({
  value,
  onChange,
  onNext,
}: {
  value: number;
  onChange: (v: number) => void;
  onNext: () => void;
}) {
  const [displayValue, setDisplayValue] = useState(value > 0 ? value.toString() : "");

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setDisplayValue(cleaned);
    onChange(cleaned ? parseInt(cleaned, 10) : 0);
  };

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContainer}>
      <Text style={styles.title}>What's your monthly income?</Text>
      <Text style={styles.subtitle}>Helps us give you tailored budget insights{"\n"}(You can skip this if you prefer)</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Monthly income (optional)</Text>
        <View style={styles.currencyInputWrapper}>
          <Text style={styles.currencySymbol}>€</Text>
          <TextInput
            style={styles.currencyInput}
            placeholder="2000"
            placeholderTextColor={hatchColors.text.tertiary}
            value={displayValue}
            onChangeText={handleChange}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
      </View>
      <Pressable onPress={onNext}>
        <View style={styles.primaryButton}>
          <Text style={styles.buttonText}>Continue</Text>
        </View>
      </Pressable>
      <Pressable onPress={onNext} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip for now</Text>
      </Pressable>
    </Animated.View>
  );
}

function MotivationStep({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  const motivations = [
    { id: "security", label: "Financial security", icon: "shield-checkmark-outline" },
    { id: "freedom", label: "More freedom", icon: "airplane-outline" },
    { id: "family", label: "Provide for family", icon: "home-outline" },
    { id: "goals", label: "Reach my goals", icon: "trophy-outline" },
    { id: "peace", label: "Peace of mind", icon: "leaf-outline" },
    { id: "future", label: "Secure the future", icon: "sunny-outline" },
  ];

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.stepContainer}>
      <Text style={styles.title}>What drives you?</Text>
      <Text style={styles.subtitle}>Select what motivates you most</Text>
      <View style={styles.motivationGrid}>
        {motivations.map((motivation) => (
          <Pressable
            key={motivation.id}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(motivation.id);
            }}
            style={[styles.motivationChip, value === motivation.id && styles.motivationChipSelected]}
          >
            <Ionicons
              name={motivation.icon as any}
              size={20}
              color={value === motivation.id ? hatchColors.text.inverse : hatchColors.primary.default}
            />
            <Text style={[styles.motivationLabel, value === motivation.id && styles.motivationLabelSelected]}>
              {motivation.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={onNext}>
        <View style={styles.primaryButton}>
          <Text style={styles.buttonText}>Continue</Text>
        </View>
      </Pressable>
      <Pressable onPress={onNext} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip for now</Text>
      </Pressable>
    </Animated.View>
  );
}

function ReadyStep({ name, onComplete }: { name: string; onComplete: () => void }) {
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.stepContainer}>
      <View style={styles.celebrationContainer}>
        <Ionicons name="checkmark-done-circle-outline" size={44} color={hatchColors.primary.default} />
      </View>
      <Text style={styles.title}>You're all set, {name}!</Text>
      <Text style={styles.subtitle}>Your financial freedom journey starts now.{"\n"}Let's make every penny count.</Text>
      <View style={styles.featuresCard}>
        <FeatureItem icon="bulb-outline" text="16 money-saving tips" />
        <FeatureItem icon="school-outline" text="24 academy lessons" />
        <FeatureItem icon="flame-outline" text="Daily streak tracking" />
        <FeatureItem icon="calendar-outline" text="Interaktiver Budget Kalender" />
        <FeatureItem icon="wallet-outline" text="Dein ganzes Geld easy im Überblick" />
        <FeatureItem icon="shield-checkmark-outline" text="All deine Daten sicher" />
      </View>
      <View style={styles.buttonWrapper}>
        <Pressable onPress={onComplete}>
          <View style={styles.primaryButton}>
            <Text style={styles.buttonText}>Start Exploring</Text>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon as any} size={20} color={hatchColors.primary.default} style={styles.featureIcon} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: hatchColors.background.primary },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  backButton: { position: "absolute", top: 8, left: hatchSpacing.screenPadding, zIndex: 10 },
  backButtonInner: { flexDirection: "row", alignItems: "center", padding: 8 },
  backText: { fontSize: hatchTypography.fontSize.md, color: hatchColors.text.primary, marginLeft: 4 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 0 },
  progressContainer: { flexDirection: "row", justifyContent: "center", gap: 8, paddingBottom: 32 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: hatchColors.border.default },
  progressDotActive: { width: 24, backgroundColor: hatchColors.primary.default },
  progressDotCompleted: { backgroundColor: hatchColors.primary.light },
  stepContainer: { alignItems: "center", width: "100%", paddingHorizontal: 24 },
  buttonWrapper: { width: "100%", paddingHorizontal: 0, marginHorizontal: -16 },
  illustrationContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: hatchColors.primary.muted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  appIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  appIcon: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: hatchTypography.fontSize["2xl"],
    fontWeight: "700",
    color: hatchColors.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: hatchTypography.fontSize.base,
    color: hatchColors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: hatchColors.primary.default,
    borderRadius: hatchRadius.full,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: hatchColors.border.default,
    opacity: 0.6,
  },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  buttonText: { fontSize: hatchTypography.fontSize.md, fontWeight: "600", color: hatchColors.text.inverse },
  inputContainer: { width: "100%", marginBottom: 24 },
  inputLabel: { fontSize: hatchTypography.fontSize.sm, color: hatchColors.text.secondary, marginBottom: 8 },
  textInput: {
    width: "100%",
    height: hatchSpacing.inputHeight,
    backgroundColor: hatchColors.background.secondary,
    borderRadius: hatchRadius.lg,
    paddingHorizontal: 16,
    fontSize: hatchTypography.fontSize.md,
    color: hatchColors.text.primary,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
  },
  skipButton: { marginTop: 16, padding: 12 },
  skipText: { fontSize: hatchTypography.fontSize.base, color: hatchColors.text.secondary, fontWeight: "500" },
  goalsContainer: { width: "100%", gap: 12, marginBottom: 32 },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: hatchColors.background.card,
    borderRadius: hatchRadius.xl,
    borderWidth: 2,
    borderColor: hatchColors.border.default,
  },
  goalCardSelected: { borderColor: hatchColors.primary.default, backgroundColor: hatchColors.primary.muted },
  goalIcon: {
    width: 52,
    height: 52,
    borderRadius: hatchRadius.lg,
    backgroundColor: hatchColors.background.cardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  goalIconSelected: { backgroundColor: hatchColors.primary.default },
  goalContent: { flex: 1 },
  goalLabel: {
    fontSize: hatchTypography.fontSize.md,
    fontWeight: "600",
    color: hatchColors.text.primary,
    marginBottom: 2,
  },
  goalDescription: { fontSize: hatchTypography.fontSize.sm, color: hatchColors.text.secondary },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: hatchColors.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: { borderColor: hatchColors.primary.default, backgroundColor: hatchColors.primary.default },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#FFFFFF" },
  celebrationContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: hatchColors.primary.muted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  featuresCard: {
    width: "100%",
    backgroundColor: hatchColors.background.card,
    borderRadius: hatchRadius.xl,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
  },
  featureItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  featureIcon: { marginRight: 12 },
  featureText: { fontSize: hatchTypography.fontSize.base, color: hatchColors.text.primary, fontWeight: "500" },
  currencyInputWrapper: {
    width: "100%",
    height: hatchSpacing.inputHeight,
    backgroundColor: hatchColors.background.secondary,
    borderRadius: hatchRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
  },
  currencySymbol: {
    fontSize: hatchTypography.fontSize.lg,
    fontWeight: "600",
    color: hatchColors.text.secondary,
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    fontSize: hatchTypography.fontSize.lg,
    color: hatchColors.text.primary,
    fontWeight: "600",
  },
  motivationGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  motivationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: hatchColors.background.card,
    borderRadius: hatchRadius.full,
    borderWidth: 2,
    borderColor: hatchColors.border.default,
  },
  motivationChipSelected: {
    backgroundColor: hatchColors.primary.default,
    borderColor: hatchColors.primary.default,
  },
  motivationLabel: {
    fontSize: hatchTypography.fontSize.sm,
    fontWeight: "600",
    color: hatchColors.text.primary,
  },
  motivationLabelSelected: {
    color: hatchColors.text.inverse,
  },
});
