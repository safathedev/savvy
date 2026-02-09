// Glass Card Component — Minimalist White Design
// Simplified: no glassmorphism, clean white cards with borders

import React from "react";
import { View, StyleSheet, type ViewProps } from "react-native";
import { hatchColors, hatchRadius, hatchSpacing, hatchShadows } from "@/constants/theme";

interface GlassCardProps extends ViewProps {
  padding?: number;
  radius?: keyof typeof hatchRadius;
}

export function GlassCard({
  children,
  padding = 20,
  radius = "xl",
  style,
  ...props
}: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: hatchRadius[radius],
          padding,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

// Premium Card - Elevated card with subtle shadow
interface PremiumCardProps extends ViewProps {
  variant?: "default" | "elevated" | "outlined";
  padding?: number;
  radius?: keyof typeof hatchRadius;
}

export function PremiumCard({
  children,
  variant = "default",
  padding = 20,
  radius = "xl",
  style,
  ...props
}: PremiumCardProps) {
  const getCardStyle = () => {
    switch (variant) {
      case "default":
        return { ...hatchShadows.sm };
      case "elevated":
        return { ...hatchShadows.md };
      case "outlined":
        return { borderWidth: 1, borderColor: hatchColors.border.default };
      default:
        return {};
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: hatchRadius[radius],
          padding,
        },
        getCardStyle(),
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

// Gradient Card - Simplified to a colored card
interface GradientCardProps extends ViewProps {
  backgroundColor?: string;
  padding?: number;
  radius?: keyof typeof hatchRadius;
}

export function GradientCard({
  children,
  backgroundColor = hatchColors.primary.default,
  padding = 20,
  radius = "xl",
  style,
  ...props
}: GradientCardProps) {
  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius: hatchRadius[radius],
          padding,
          overflow: "hidden",
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

// Stats Card Item
interface StatsCardItemProps extends ViewProps {
  color: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}

export function StatsCardItem({
  color,
  icon,
  label,
  value,
  style,
  ...props
}: StatsCardItemProps) {
  return (
    <View
      style={[
        styles.statsCard,
        { backgroundColor: `${color}08`, borderColor: `${color}20` },
        style,
      ]}
      {...props}
    >
      <View style={styles.statsIcon}>{icon}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: hatchColors.background.card,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
    overflow: "hidden",
  },
  statsCard: {
    flex: 1,
    borderRadius: hatchRadius.lg,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    minWidth: 100,
  },
  statsIcon: {
    marginBottom: 8,
  },
});
