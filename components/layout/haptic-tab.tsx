// Haptic Tab component for Tab Bar
// Provides haptic feedback on tab press

import React from "react";
import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { useHaptics } from "@/hooks/use-haptics";

interface HapticTabProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

export function HapticTab({ children, onPress, ...props }: HapticTabProps) {
  const haptics = useHaptics();

  const handlePress = (e: any) => {
    haptics.light();
    onPress?.(e);
  };

  return (
    <TouchableOpacity onPress={handlePress} {...props}>
      {children}
    </TouchableOpacity>
  );
}
