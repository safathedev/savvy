// Screen Container component for Savvy App
// SafeArea wrapper with consistent styling

import React from "react";
import { View, ScrollView, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
}

export function ScreenContainer({
  children,
  scroll = true,
  padded = true,
  edges = ["top"],
  className,
  ...props
}: ScreenContainerProps) {
  const content = (
    <View
      className={cn("flex-1 bg-background", padded && "px-6", className)}
      {...props}
    >
      {children}
    </View>
  );

  if (scroll) {
    return (
      <SafeAreaView edges={edges} className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-8"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-background">
      {content}
    </SafeAreaView>
  );
}

// Header component for screens
interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  rightElement,
}: ScreenHeaderProps) {
  return (
    <View className="flex-row items-start justify-between mb-6">
      <View className="flex-1">
        <Text className="text-2xl font-bold text-foreground">{title}</Text>
        {subtitle && (
          <Text className="text-base text-muted mt-1">{subtitle}</Text>
        )}
      </View>
      {rightElement}
    </View>
  );
}

// Need to import Text
import { Text } from "react-native";
