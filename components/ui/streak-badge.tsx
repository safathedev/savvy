// Streak Badge component for Savvy App
// Duolingo-inspired streak counter

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";

interface StreakBadgeProps {
  streak: number;
  onPress?: () => void;
  size?: "sm" | "md" | "lg";
}

export function StreakBadge({
  streak,
  onPress,
  size = "md",
}: StreakBadgeProps) {
  const haptics = useHaptics();

  const handlePress = () => {
    if (onPress) {
      haptics.light();
      onPress();
    }
  };

  const sizeStyles = {
    sm: "px-2 py-1",
    md: "px-3 py-1.5",
    lg: "px-4 py-2",
  };

  const textSizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (streak === 0) {
    return null;
  }

  const content = (
    <View
      className={cn(
        "flex-row items-center gap-1 rounded-full bg-accent/20",
        sizeStyles[size]
      )}
    >
      <Text className={cn("", textSizeStyles[size])}>🔥</Text>
      <Text
        className={cn("font-bold text-accent", textSizeStyles[size])}
      >
        {streak}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// Weekly activity dots
interface WeeklyActivityProps {
  activity: boolean[]; // 7 booleans for Mon-Sun
}

export function WeeklyActivity({ activity }: WeeklyActivityProps) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <View className="flex-row gap-2 items-center">
      {days.map((day, index) => (
        <View key={index} className="items-center gap-1">
          <Text className="text-xs text-muted">{day}</Text>
          <View
            className={cn(
              "w-6 h-6 rounded-full items-center justify-center",
              activity[index] ? "bg-primary" : "bg-border"
            )}
          >
            {activity[index] && (
              <Text className="text-white text-xs">✓</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
