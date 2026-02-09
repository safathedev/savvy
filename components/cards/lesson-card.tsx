// Lesson Card component for Investment Basics
// Duolingo-style lesson path item

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { InvestmentLesson } from "@/data/investment-lessons";
import { useApp } from "@/lib/app-context";
import { useHaptics } from "@/hooks/use-haptics";
import { useColors } from "@/hooks/use-colors";
import { FreeBadge, PremiumBadge } from "@/components/ui/badge";

interface LessonCardProps {
  lesson: InvestmentLesson;
  isAccessible: boolean;
}

export function LessonCard({ lesson, isAccessible }: LessonCardProps) {
  const router = useRouter();
  const haptics = useHaptics();
  const colors = useColors();
  const { isLessonCompleted, isPremium } = useApp();

  const isCompleted = isLessonCompleted(lesson.id);
  const isLocked = lesson.isPremium && !isPremium;

  const handlePress = () => {
    haptics.light();
    if (isLocked) {
      router.push("/paywall");
    } else {
      router.push(`/lesson/${lesson.id}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className={`bg-surface border rounded-xl p-4 flex-row items-center gap-4 ${
        isCompleted
          ? "border-success/50 bg-success/5"
          : isLocked
          ? "border-border opacity-60"
          : "border-border"
      }`}
    >
      {/* Status Icon */}
      <View
        className={`w-12 h-12 rounded-full items-center justify-center ${
          isCompleted
            ? "bg-success"
            : isLocked
            ? "bg-muted/30"
            : "bg-primary/10 border-2 border-primary"
        }`}
      >
        {isCompleted ? (
          <Ionicons name="checkmark" size={24} color="#FFFFFF" />
        ) : isLocked ? (
          <Ionicons name="lock-closed" size={20} color={colors.muted} />
        ) : (
          <Text className="text-xl font-bold text-primary">
            {lesson.number}
          </Text>
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-1">
          <Text
            className={`text-base font-semibold ${
              isCompleted ? "text-success" : "text-foreground"
            }`}
          >
            {lesson.title}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-sm text-muted">{lesson.duration}</Text>
          {lesson.isPremium ? <PremiumBadge /> : <FreeBadge />}
        </View>
      </View>

      {/* Arrow */}
      <Ionicons
        name={isLocked ? "lock-closed" : "chevron-forward"}
        size={20}
        color={colors.muted}
      />
    </TouchableOpacity>
  );
}
