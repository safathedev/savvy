// Empty State component for Savvy App

import React from "react";
import { View, Text } from "react-native";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "📝",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text className="text-xl font-bold text-foreground text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-base text-muted text-center mb-6">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

// Predefined empty states
export function TrackerEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon="💰"
      title="No savings tracked yet"
      description="Start tracking your savings to see your progress"
      actionLabel="Add First Savings"
      onAction={onAdd}
    />
  );
}

export function TipsEmptyState() {
  return (
    <EmptyState
      icon="💡"
      title="No tips found"
      description="Try selecting a different category"
    />
  );
}
