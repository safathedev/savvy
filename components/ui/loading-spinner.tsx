// Hatch-Inspired Loading Spinner for Savvy
// Based on Hatch Sleep iOS: warm glow loading indicator

import { hatchColors, hatchTypography } from "@/constants/theme";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "large",
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={hatchColors.primary.default} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={hatchColors.primary.default} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: hatchColors.background.primary,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  message: {
    marginTop: 16,
    fontSize: hatchTypography.fontSize.base,
    color: hatchColors.text.secondary,
  },
});
