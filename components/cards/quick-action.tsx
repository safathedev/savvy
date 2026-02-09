// Quick Action Card for Home Screen
// Grid of quick navigation actions

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, Href } from "expo-router";
import { useHaptics } from "@/hooks/use-haptics";
import { useColors } from "@/hooks/use-colors";

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: Href;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: "save",
    label: "Saving Tips",
    icon: "💡",
    href: "/(tabs)/save",
    color: "#F59E0B",
  },
  {
    id: "learn",
    label: "Learn Investing",
    icon: "📈",
    href: "/(tabs)/learn",
    color: "#3B82F6",
  },
  {
    id: "track",
    label: "Track Savings",
    icon: "💰",
    href: "/(tabs)/track",
    color: "#22C55E",
  },
];

export function QuickActions() {
  const router = useRouter();
  const haptics = useHaptics();
  const colors = useColors();

  const handlePress = (action: QuickAction) => {
    haptics.light();
    router.push(action.href);
  };

  return (
    <View className="flex-row gap-3">
      {quickActions.map((action) => (
        <TouchableOpacity
          key={action.id}
          onPress={() => handlePress(action)}
          activeOpacity={0.8}
          className="flex-1 bg-surface border border-border rounded-xl p-4 items-center"
        >
          <View
            className="w-12 h-12 rounded-full items-center justify-center mb-2"
            style={{ backgroundColor: `${action.color}20` }}
          >
            <Text className="text-2xl">{action.icon}</Text>
          </View>
          <Text className="text-sm font-medium text-foreground text-center">
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
