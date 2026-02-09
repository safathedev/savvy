// Daily Tip Card for Home Screen
// Featured card with primary color background

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SavingsTip } from "@/data/savings-tips";
import { useHaptics } from "@/hooks/use-haptics";
import { Badge } from "@/components/ui/badge";

interface DailyTipCardProps {
  tip: SavingsTip;
}

export function DailyTipCard({ tip }: DailyTipCardProps) {
  const router = useRouter();
  const haptics = useHaptics();

  const handlePress = () => {
    haptics.light();
    router.push(`/tip/${tip.id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      className="rounded-2xl bg-primary/10 border border-primary/20 p-5"
    >
      <View className="flex-row items-center justify-between mb-3">
        <Badge variant="success" size="sm">
          💡 Daily Tip
        </Badge>
        <Text className="text-sm text-muted">{tip.estimatedSavings}</Text>
      </View>

      <View className="flex-row items-start gap-3">
        <Text className="text-3xl">{tip.icon}</Text>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground mb-1">
            {tip.title}
          </Text>
          <Text className="text-base text-muted leading-6" numberOfLines={2}>
            {tip.description}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-end mt-4">
        <Text className="text-primary font-semibold">Read More →</Text>
      </View>
    </TouchableOpacity>
  );
}
