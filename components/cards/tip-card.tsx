// Tip Card component for Savings Hub
// Displays a single saving tip in the list

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SavingsTip } from "@/data/savings-tips";
import { useApp } from "@/lib/app-context";
import { useHaptics } from "@/hooks/use-haptics";
import { AppliedBadge, SavingsBadge } from "@/components/ui/badge";

interface TipCardProps {
  tip: SavingsTip;
}

export function TipCard({ tip }: TipCardProps) {
  const router = useRouter();
  const haptics = useHaptics();
  const { isTipApplied } = useApp();

  const isApplied = isTipApplied(tip.id);

  const handlePress = () => {
    haptics.light();
    router.push(`/tip/${tip.id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className="bg-surface border border-border rounded-xl p-4 flex-row items-start gap-3"
    >
      <View className="w-12 h-12 bg-primary/10 rounded-xl items-center justify-center">
        <Text className="text-2xl">{tip.icon}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground mb-1">
          {tip.title}
        </Text>
        <Text className="text-sm text-muted mb-2" numberOfLines={2}>
          {tip.description}
        </Text>
        <View className="flex-row items-center gap-2">
          <SavingsBadge amount={tip.estimatedSavings} />
          {isApplied && <AppliedBadge />}
        </View>
      </View>
    </TouchableOpacity>
  );
}
