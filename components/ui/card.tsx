// Hatch-Inspired Card Component for Savvy
// Based on Hatch Sleep iOS: dark card backgrounds, rounded corners, subtle shadows

import { hatchColors, hatchRadius, hatchShadows, hatchSpacing, hatchTypography } from "@/constants/theme";
import { useHaptics } from "@/hooks/use-haptics";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CardVariant = "default" | "elevated" | "accent";

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ variant = "default", children, onPress, style }: CardProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const isInteractive = !!onPress;

  const handlePressIn = useCallback(() => {
    if (isInteractive) scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  }, [isInteractive]);

  const handlePressOut = useCallback(() => {
    if (isInteractive) scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [isInteractive]);

  const handlePress = useCallback(() => {
    if (isInteractive) {
      haptics.light();
      onPress?.();
    }
  }, [isInteractive, haptics, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const variantConfig = {
    default: { backgroundColor: hatchColors.background.card, borderWidth: 1, borderColor: hatchColors.border.default, ...hatchShadows.none },
    elevated: { backgroundColor: hatchColors.background.tertiary, ...hatchShadows.md },
    accent: { backgroundColor: hatchColors.primary.muted, ...hatchShadows.sm },
  };

  const config = variantConfig[variant];
  const cardStyle: ViewStyle = {
    borderRadius: hatchRadius.xl,
    padding: hatchSpacing.cardPadding,
    backgroundColor: config.backgroundColor,
    overflow: "hidden",
    ...config,
  };

  if (isInteractive) {
    return (
      <AnimatedPressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} style={animatedStyle}>
        <View style={[cardStyle, style]}>{children}</View>
      </AnimatedPressable>
    );
  }
  return <View style={[cardStyle, style]}>{children}</View>;
}

// Stat Card - For displaying numbers with labels
interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  color?: string;
  onPress?: () => void;
}

export function StatCard({ icon, value, label, color, onPress }: StatCardProps) {
  return (
    <Card variant="default" onPress={onPress} style={styles.statCard}>
      <View style={[styles.statIcon, color && { backgroundColor: `${color}25` }]}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

// Selection Card - For onboarding/selection flows
interface SelectionCardProps {
  icon: string;
  title: string;
  description?: string;
  selected?: boolean;
  onPress?: () => void;
}

export function SelectionCard({ icon, title, description, selected = false, onPress }: SelectionCardProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  const handlePress = useCallback(() => {
    haptics.selection();
    onPress?.();
  }, [haptics, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} style={animatedStyle}>
      <View style={[styles.selectionCard, selected && styles.selectionCardSelected]}>
        <View style={[styles.selectionIconContainer, selected && styles.selectionIconContainerSelected]}>
          <Text style={styles.selectionIcon}>{icon}</Text>
        </View>
        <View style={styles.selectionContent}>
          <Text style={[styles.selectionTitle, selected && styles.selectionTitleSelected]}>{title}</Text>
          {description && <Text style={[styles.selectionDescription, selected && styles.selectionDescriptionSelected]}>{description}</Text>}
        </View>
        <View style={[styles.selectionIndicator, selected && styles.selectionIndicatorSelected]}>
          {selected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </View>
    </AnimatedPressable>
  );
}

// List Row - For settings/list items (Hatch style)
interface ListRowProps {
  title: string;
  value?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

export function ListRow({ title, value, icon, onPress, showChevron = true, destructive = false }: ListRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.listRow, pressed && styles.listRowPressed]}>
      {icon && <View style={styles.listRowIcon}>{icon}</View>}
      <Text style={[styles.listRowTitle, destructive && styles.listRowTitleDestructive]}>{title}</Text>
      {value && <Text style={styles.listRowValue}>{value}</Text>}
      {showChevron && onPress && <Text style={styles.listRowChevron}>›</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Stat Card
  statCard: { flex: 1, minWidth: 140, alignItems: "flex-start" },
  statIcon: {
    width: 48, height: 48, borderRadius: hatchRadius.lg,
    backgroundColor: hatchColors.primary.muted,
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  statIconText: { fontSize: 24 },
  statValue: { fontSize: 24, fontWeight: "700", color: hatchColors.text.primary, marginBottom: 4 },
  statLabel: { fontSize: 14, color: hatchColors.text.secondary },

  // Selection Card
  selectionCard: {
    flexDirection: "row", alignItems: "center",
    padding: hatchSpacing[4], backgroundColor: hatchColors.background.card,
    borderRadius: hatchRadius.xl, borderWidth: 2, borderColor: "transparent", gap: 14,
  },
  selectionCardSelected: { backgroundColor: hatchColors.primary.muted, borderColor: hatchColors.primary.default },
  selectionIconContainer: {
    width: 52, height: 52, borderRadius: hatchRadius.lg,
    backgroundColor: hatchColors.background.cardLight, alignItems: "center", justifyContent: "center",
  },
  selectionIconContainerSelected: { backgroundColor: hatchColors.primary.default },
  selectionIcon: { fontSize: 28 },
  selectionContent: { flex: 1, gap: 2 },
  selectionTitle: { fontSize: 17, fontWeight: "600", color: hatchColors.text.primary },
  selectionTitleSelected: { color: hatchColors.text.primary },
  selectionDescription: { fontSize: 14, color: hatchColors.text.secondary },
  selectionDescriptionSelected: { color: hatchColors.text.primary },
  selectionIndicator: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2,
    borderColor: hatchColors.border.default, alignItems: "center", justifyContent: "center",
  },
  selectionIndicatorSelected: { backgroundColor: hatchColors.primary.default, borderColor: hatchColors.primary.default },
  checkmark: { fontSize: 14, color: hatchColors.text.inverse, fontWeight: "700" },

  // List Row (Hatch style)
  listRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 16, paddingHorizontal: hatchSpacing.screenPadding,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: hatchColors.border.light,
  },
  listRowPressed: { backgroundColor: hatchColors.background.card },
  listRowIcon: { marginRight: 12 },
  listRowTitle: { flex: 1, fontSize: hatchTypography.fontSize.md, color: hatchColors.text.primary },
  listRowTitleDestructive: { color: hatchColors.accent.coral },
  listRowValue: { fontSize: hatchTypography.fontSize.md, color: hatchColors.text.secondary, marginRight: 8 },
  listRowChevron: { fontSize: 20, color: hatchColors.text.tertiary },
});
