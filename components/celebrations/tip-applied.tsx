// Tip Applied Celebration
// Quick success feedback

import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";

interface TipAppliedCelebrationProps {
  visible: boolean;
}

export function TipAppliedCelebration({ visible }: TipAppliedCelebrationProps) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={ZoomIn.duration(300)}
      exiting={FadeOut.duration(300)}
      className="absolute inset-0 items-center justify-center bg-black/50"
    >
      <View className="bg-success px-8 py-6 rounded-2xl items-center">
        <Text className="text-5xl mb-2">✅</Text>
        <Text className="text-xl font-bold text-white text-center">
          Tip Applied!
        </Text>
        <Text className="text-white/80 text-center mt-1">
          Great job taking action!
        </Text>
      </View>
    </Animated.View>
  );
}
