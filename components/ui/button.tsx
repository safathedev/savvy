// Hatch-Inspired Button Component for Savvy
// Based on Hatch Sleep iOS app design: pill-shaped, teal primary, animated

import { hatchColors, hatchComponents, hatchRadius, hatchSpacing, hatchTypography } from "@/constants/theme";
import { useHaptics } from "@/hooks/use-haptics";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: string;
  onPress?: () => void;
  style?: any;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  children,
  onPress,
  style,
}: ButtonProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const isDisabled = disabled || loading;

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.85, { duration: 100 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 150 });
  }, []);

  const handlePress = useCallback(() => {
    if (!isDisabled) {
      haptics.medium();
      onPress?.();
    }
  }, [isDisabled, haptics, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Size configurations
  const sizeConfig = {
    sm: { height: 44, paddingHorizontal: 20, fontSize: hatchTypography.fontSize.sm },
    md: { height: hatchSpacing.buttonHeight, paddingHorizontal: 24, fontSize: hatchTypography.fontSize.md },
    lg: { height: 56, paddingHorizontal: 32, fontSize: hatchTypography.fontSize.lg },
  };

  const currentSize = sizeConfig[size];

  // Variant styles matching Hatch
  const variantStyles = {
    primary: {
      backgroundColor: hatchComponents.button.primary.background,
      textColor: hatchComponents.button.primary.text,
      pressedBg: hatchComponents.button.primary.pressedBackground,
    },
    secondary: {
      backgroundColor: hatchComponents.button.secondary.background,
      textColor: hatchComponents.button.secondary.text,
      pressedBg: hatchComponents.button.secondary.pressedBackground,
    },
    ghost: {
      backgroundColor: hatchComponents.button.ghost.background,
      textColor: hatchComponents.button.ghost.text,
      pressedBg: hatchComponents.button.ghost.pressedBackground,
    },
    destructive: {
      backgroundColor: hatchComponents.button.destructive.background,
      textColor: hatchComponents.button.destructive.text,
      pressedBg: hatchComponents.button.destructive.pressedBackground,
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      style={[animatedStyle, fullWidth && styles.fullWidth, style]}
    >
      <View
        style={[
          styles.base,
          {
            height: currentSize.height,
            paddingHorizontal: currentSize.paddingHorizontal,
            backgroundColor: currentVariant.backgroundColor,
            borderRadius: hatchRadius["3xl"],
          },
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={currentVariant.textColor} size="small" />
        ) : (
          <View style={styles.content}>
            {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
            <Text
              style={[
                styles.text,
                { color: currentVariant.textColor, fontSize: currentSize.fontSize },
              ]}
            >
              {children}
            </Text>
            {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

// Icon Button
interface IconButtonProps {
  icon: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
}

export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  onPress,
  disabled = false,
  style,
}: IconButtonProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  const handlePress = useCallback(() => {
    if (!disabled) {
      haptics.light();
      onPress?.();
    }
  }, [disabled, haptics, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizes = { sm: 36, md: 44, lg: 52 };
  const backgrounds = {
    primary: hatchColors.primary.default,
    secondary: hatchColors.background.card,
    ghost: "transparent",
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[
        animatedStyle,
        styles.iconButton,
        { width: sizes[size], height: sizes[size], backgroundColor: backgrounds[variant] },
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fullWidth: { width: "100%" },
  content: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  text: { fontWeight: "600", textAlign: "center" },
  iconLeft: { marginRight: 4 },
  iconRight: { marginLeft: 4 },
  disabled: { opacity: 0.5 },
  iconButton: { borderRadius: 9999, alignItems: "center", justifyContent: "center" },
});
