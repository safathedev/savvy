// Savings Entry Card for Tracker
// Shows a single savings entry with delete option

import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SavingsEntry } from "@/lib/app-context";
import { formatCurrency, CurrencyCode } from "@/constants/currencies";
import { getCategoryById } from "@/data/categories";
import { useHaptics } from "@/hooks/use-haptics";
import { useColors } from "@/hooks/use-colors";

interface SavingsEntryCardProps {
  entry: SavingsEntry;
  currency: CurrencyCode;
  onDelete: (id: string) => void;
}

export function SavingsEntryCard({
  entry,
  currency,
  onDelete,
}: SavingsEntryCardProps) {
  const haptics = useHaptics();
  const colors = useColors();
  const category = getCategoryById(entry.category);

  const handleDelete = () => {
    haptics.warning();
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this savings entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            haptics.success();
            onDelete(entry.id);
          },
        },
      ]
    );
  };

  return (
    <View className="flex-row items-center bg-surface border border-border rounded-xl p-4 gap-3">
      {/* Category Icon */}
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: `${category?.color || "#22C55E"}20` }}
      >
        <Text className="text-lg">{category?.icon || "💰"}</Text>
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">
          {formatCurrency(entry.amount, currency)}
        </Text>
        <Text className="text-sm text-muted">
          {category?.name || "Savings"}
          {entry.note ? ` • ${entry.note}` : ""}
        </Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        onPress={handleDelete}
        className="p-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color={colors.muted} />
      </TouchableOpacity>
    </View>
  );
}
