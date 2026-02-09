// Premium Button Component — Minimalist White Design
// Simple, clean buttons without gradients

import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { hatchColors, hatchRadius, hatchSpacing, hatchTypography, hatchShadows } from "@/constants/theme";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface PremiumButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function PremiumButton({
  variant = "primary",
  size = "lg",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  onPress,
  onPressIn,
  onPressOut,
  style,
  ...props
}: PremiumButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    onPressOut?.(e);
  };

  const handlePress = (e: any) => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress?.(e);
    }
  };

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, height: 36 },
    md: { paddingVertical: 12, paddingHorizontal: 20, height: 44 },
    lg: { paddingVertical: 16, paddingHorizontal: 24, height: 52 },
    xl: { paddingVertical: 20, paddingHorizontal: 32, height: 60 },
  };

  const textSizes = {
    sm: hatchTypography.fontSize.sm,
    md: hatchTypography.fontSize.base,
    lg: hatchTypography.fontSize.md,
    xl: hatchTypography.fontSize.lg,
  };

  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return { backgroundColor: hatchColors.primary.default };
      case "secondary":
        return { backgroundColor: hatchColors.background.cardLight };
      case "accent":
        return { backgroundColor: hatchColors.accent.amber };
      case "ghost":
        return { backgroundColor: "transparent" };
      case "outline":
        return { backgroundColor: "transparent", borderWidth: 2, borderColor: hatchColors.primary.default };
      default:
        return {};
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary":
      case "accent":
        return hatchColors.text.inverse;
      case "secondary":
        return hatchColors.text.primary;
      case "ghost":
      case "outline":
        return hatchColors.primary.default;
      default:
        return hatchColors.text.primary;
    }
  };

  const isDisabled = disabled || loading;

  return (
    <AnimatedTouchable
      style={[
        styles.button,
        sizeStyles[size],
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={1}
      {...props}
    >
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <>
            {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
            <Text style={[styles.text, { color: getTextColor(), fontSize: textSizes[size] }]}>
              {children}
            </Text>
            {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
          </>
        )}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: hatchRadius.full,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
});
