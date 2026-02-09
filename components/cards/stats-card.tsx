// Stats Card component for Home Screen
// Shows monthly and total savings with green gradient background

import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { formatCurrency, CurrencyCode } from "@/constants/currencies";

interface StatsCardProps {
  monthlySavings: number;
  totalSavings: number;
  currency: CurrencyCode;
}

export function StatsCard({
  monthlySavings,
  totalSavings,
  currency,
}: StatsCardProps) {
  return (
    <View className="rounded-2xl overflow-hidden">
      <LinearGradient
        colors={["#22C55E", "#16A34A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5"
      >
        <Text className="text-white/80 text-sm font-medium mb-1">
          This Month
        </Text>
        <Text className="text-white text-3xl font-bold mb-4">
          {formatCurrency(monthlySavings, currency)}
        </Text>

        <View className="border-t border-white/20 pt-4">
          <Text className="text-white/80 text-sm font-medium mb-1">
            Total Saved
          </Text>
          <Text className="text-white text-xl font-semibold">
            {formatCurrency(totalSavings, currency)}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
