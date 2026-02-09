// Hatch-Inspired Input Component for Savvy
// Based on Hatch Sleep iOS: dark card background, white text, rounded corners

import { hatchColors, hatchRadius, hatchSpacing, hatchTypography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={hatchColors.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

// Currency input specifically for amounts
interface CurrencyInputProps extends Omit<TextInputProps, "value" | "onChangeText"> {
  value: string;
  onChangeText: (value: string) => void;
  currencySymbol?: string;
  label?: string;
}

export function CurrencyInput({
  value,
  onChangeText,
  currencySymbol = "£",
  label,
  ...props
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
        <Text style={styles.currencySymbol}>{currencySymbol}</Text>
        <TextInput
          style={styles.currencyInput}
          placeholderTextColor={hatchColors.text.tertiary}
          keyboardType="decimal-pad"
          value={value}
          onChangeText={onChangeText}
          placeholder="0.00"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
    </View>
  );
}

// Password input with visibility toggle
interface PasswordInputProps extends Omit<TextInputProps, "secureTextEntry"> {
  label?: string;
  error?: string;
}

export function PasswordInput({ label, error, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused, error && styles.inputContainerError]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={hatchColors.text.tertiary}
          secureTextEntry={!isVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        <TouchableOpacity onPress={() => setIsVisible(!isVisible)} style={styles.iconRight}>
          <Ionicons name={isVisible ? "eye-off" : "eye"} size={20} color={hatchColors.text.secondary} />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: {
    fontSize: hatchTypography.fontSize.sm,
    fontWeight: hatchTypography.fontWeight.medium,
    color: hatchColors.text.primary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: hatchColors.background.card,
    borderRadius: hatchRadius.lg,
    paddingHorizontal: hatchSpacing[4],
    height: hatchSpacing.inputHeight,
    borderWidth: 1,
    borderColor: hatchColors.border.default,
  },
  inputContainerFocused: {
    borderColor: hatchColors.border.focused,
  },
  inputContainerError: {
    borderColor: hatchColors.status.error,
  },
  input: {
    flex: 1,
    fontSize: hatchTypography.fontSize.md,
    color: hatchColors.text.primary,
  },
  iconLeft: { marginRight: 12 },
  iconRight: { marginLeft: 12 },
  error: {
    fontSize: hatchTypography.fontSize.sm,
    color: hatchColors.status.error,
  },
  currencySymbol: {
    fontSize: hatchTypography.fontSize["2xl"],
    fontWeight: hatchTypography.fontWeight.bold,
    color: hatchColors.primary.default,
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    fontSize: hatchTypography.fontSize["2xl"],
    fontWeight: hatchTypography.fontWeight.bold,
    color: hatchColors.text.primary,
  },
});
