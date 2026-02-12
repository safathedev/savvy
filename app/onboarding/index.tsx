// Savvy Onboarding - Minimalist White Design

import React, { useCallback, useState } from "react";
import {
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

interface OnboardingData {
  name: string;
  goal: Goal;
}

export default function Onboarding() {
  const router = useRouter();
  const { setUserProfile } = useApp();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    goal: "both",
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
    };

    await setUserProfile(profile);
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
      <View style={styles.illustrationContainer}>
        <Ionicons name="leaf-outline" size={50} color={hatchColors.primary.default} />
      </View>
      <Text style={styles.title}>Welcome to Savvy</Text>
      <Text style={styles.subtitle}>Your personal guide to{"\n"}smarter money habits</Text>
      <Pressable onPress={onNext} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </Animated.View>
  );
}

function NameStep({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
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
      <Pressable onPress={onNext} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
      <Pressable onPress={onNext} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip for now</Text>
      </Pressable>
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
      <Pressable onPress={onNext} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>Continue</Text>
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
      </View>
      <Pressable onPress={onComplete} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>Start Exploring</Text>
      </Pressable>
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
  content: { flex: 1, justifyContent: "center", paddingHorizontal: hatchSpacing.screenPadding },
  progressContainer: { flexDirection: "row", justifyContent: "center", gap: 8, paddingBottom: 32 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: hatchColors.border.default },
  progressDotActive: { width: 24, backgroundColor: hatchColors.primary.default },
  progressDotCompleted: { backgroundColor: hatchColors.primary.light },
  stepContainer: { alignItems: "center" },
  illustrationContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: hatchColors.primary.muted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
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
    backgroundColor: hatchColors.primary.default,
    borderRadius: hatchRadius.full,
    paddingVertical: 16,
    alignItems: "center",
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
});
