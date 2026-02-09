// Lesson Complete Celebration
// Duolingo-style celebration overlay

import React from "react";
import { View, Text, Modal } from "react-native";
import { Button } from "@/components/ui/button";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

interface LessonCompleteCelebrationProps {
  lessonNumber: number;
  totalLessons: number;
  onContinue: () => void;
}

export function LessonCompleteCelebration({
  lessonNumber,
  totalLessons,
  onContinue,
}: LessonCompleteCelebrationProps) {
  return (
    <Modal transparent animationType="fade">
      <View className="flex-1 bg-black/70 items-center justify-center px-8">
        <Animated.View
          entering={ZoomIn.duration(400)}
          className="bg-background rounded-3xl p-8 w-full items-center"
        >
          {/* Confetti Emoji */}
          <Text className="text-7xl mb-4">🎉</Text>

          {/* Title */}
          <Text className="text-2xl font-bold text-success text-center mb-2">
            Lesson Complete!
          </Text>

          {/* Progress */}
          <Text className="text-base text-muted text-center mb-6">
            You've completed lesson {lessonNumber} of {totalLessons}
          </Text>

          {/* Stats */}
          <View className="flex-row gap-4 mb-8">
            <View className="bg-surface border border-border rounded-xl p-4 items-center flex-1">
              <Text className="text-3xl mb-1">📚</Text>
              <Text className="text-lg font-bold text-foreground">
                {lessonNumber}/{totalLessons}
              </Text>
              <Text className="text-sm text-muted">Lessons</Text>
            </View>
            <View className="bg-surface border border-border rounded-xl p-4 items-center flex-1">
              <Text className="text-3xl mb-1">🎯</Text>
              <Text className="text-lg font-bold text-foreground">
                {Math.round((lessonNumber / totalLessons) * 100)}%
              </Text>
              <Text className="text-sm text-muted">Progress</Text>
            </View>
          </View>

          {/* Continue Button */}
          <Button size="lg" onPress={onContinue} className="w-full">
            {lessonNumber < totalLessons ? "Next Lesson →" : "Finish Course 🎓"}
          </Button>
        </Animated.View>
      </View>
    </Modal>
  );
}
