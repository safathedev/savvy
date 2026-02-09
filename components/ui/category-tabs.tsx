// Category Tabs component for Savvy App
// Horizontal scrollable filter tabs (YNAB-inspired)

import React from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/use-haptics";

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface CategoryTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function CategoryTabs({
  tabs,
  activeTab,
  onTabChange,
}: CategoryTabsProps) {
  const haptics = useHaptics();

  const handleTabPress = (tabId: string) => {
    if (tabId !== activeTab) {
      haptics.selection();
      onTabChange(tabId);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-6"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => handleTabPress(tab.id)}
            className={cn(
              "px-4 py-2 rounded-full",
              isActive ? "bg-primary" : "bg-surface border border-border"
            )}
            activeOpacity={0.8}
          >
            <Text
              className={cn(
                "text-sm font-medium",
                isActive ? "text-white" : "text-foreground"
              )}
            >
              {tab.icon ? `${tab.icon} ${tab.label}` : tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// Predefined category tabs for savings tips
export const SAVINGS_CATEGORY_TABS: Tab[] = [
  { id: "all", label: "All Tips" },
  { id: "shopping", label: "Shopping", icon: "🛒" },
  { id: "cooking", label: "Cooking", icon: "🍳" },
  { id: "home", label: "Home", icon: "🏠" },
  { id: "general", label: "General", icon: "💡" },
];
