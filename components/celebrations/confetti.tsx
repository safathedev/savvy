// Confetti component
// Simple confetti animation using emojis

import React, { useEffect, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const CONFETTI_EMOJIS = ["🎉", "🎊", "✨", "💫", "⭐", "🌟"];

interface ConfettiPiece {
  id: number;
  emoji: string;
  startX: number;
  delay: number;
}

export function Confetti() {
  const [pieces] = useState<ConfettiPiece[]>(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)],
      startX: Math.random() * width,
      delay: Math.random() * 500,
    }))
  );

  return (
    <View className="absolute inset-0 pointer-events-none">
      {pieces.map((piece) => (
        <ConfettiPieceComponent key={piece.id} piece={piece} />
      ))}
    </View>
  );
}

function ConfettiPieceComponent({ piece }: { piece: ConfettiPiece }) {
  const translateY = useSharedValue(-50);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      piece.delay,
      withTiming(height + 50, { duration: 3000, easing: Easing.linear })
    );
    rotate.value = withDelay(
      piece.delay,
      withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1
      )
    );
    opacity.value = withDelay(
      piece.delay + 2000,
      withTiming(0, { duration: 1000 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: piece.startX,
          top: 0,
        },
        animatedStyle,
      ]}
    >
      <Text className="text-2xl">{piece.emoji}</Text>
    </Animated.View>
  );
}
