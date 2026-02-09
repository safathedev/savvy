// Hatch-Inspired Progress Bar for Savvy
// Based on Hatch Sleep iOS: teal fill on gray track

import { hatchColors, hatchRadius, hatchTypography } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";

interface ProgressBarProps extends ViewProps {
  progress: number; // 0-100
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "accent";
}

export function ProgressBar({
  progress,
  showLabel = false,
  size = "md",
  variant = "primary",
  style,
  ...props
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const sizeHeights = { sm: 4, md: 8, lg: 12 };
  const variantColors = {
    primary: hatchColors.primary.default,
    accent: hatchColors.accent.teal,
  };

  return (
    <View style={[styles.container, style]} {...props}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>Progress</Text>
          <Text style={styles.percentText}>{Math.round(clampedProgress)}%</Text>
        </View>
      )}
      <View style={[styles.track, { height: sizeHeights[size] }]}>
        <View
          style={[
            styles.fill,
            { width: `${clampedProgress}%`, backgroundColor: variantColors[variant] },
          ]}
        />
      </View>
    </View>
  );
}

// Lesson progress specifically
interface LessonProgressProps {
  completed: number;
  total: number;
}

export function LessonProgress({ completed, total }: LessonProgressProps) {
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View style={styles.lessonProgressContainer}>
      <View style={styles.lessonProgressHeader}>
        <Text style={styles.lessonProgressTitle}>Your Progress</Text>
        <Text style={styles.lessonProgressCount}>{completed} of {total} lessons</Text>
      </View>
      <ProgressBar progress={progress} size="md" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  labelRow: { flexDirection: "row", justifyContent: "space-between" },
  labelText: { fontSize: hatchTypography.fontSize.sm, color: hatchColors.text.secondary },
  percentText: { fontSize: hatchTypography.fontSize.sm, fontWeight: "500", color: hatchColors.text.primary },
  track: {
    width: "100%",
    borderRadius: hatchRadius.full,
    backgroundColor: hatchColors.background.cardLight,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: hatchRadius.full,
  },
  lessonProgressContainer: { gap: 8 },
  lessonProgressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lessonProgressTitle: { fontSize: hatchTypography.fontSize.sm, fontWeight: "500", color: hatchColors.text.primary },
  lessonProgressCount: { fontSize: hatchTypography.fontSize.sm, color: hatchColors.text.secondary },
});
