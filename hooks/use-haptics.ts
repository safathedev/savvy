// Hook for haptic feedback

import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export function useHaptics() {
  const isSupported = Platform.OS !== "web";

  const light = () => {
    if (isSupported) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const medium = () => {
    if (isSupported) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const heavy = () => {
    if (isSupported) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const success = () => {
    if (isSupported) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const warning = () => {
    if (isSupported) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const error = () => {
    if (isSupported) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const selection = () => {
    if (isSupported) {
      Haptics.selectionAsync();
    }
  };

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    isSupported,
  };
}
