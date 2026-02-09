// Badge component for Savvy App

import React from "react";
import { View, Text, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface BadgeProps extends ViewProps {
  variant?: "default" | "success" | "premium" | "locked" | "accent";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  size = "sm",
  children,
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-surface border border-border",
    success: "bg-success/20 border border-success/30",
    premium: "bg-accent/20 border border-accent/30",
    locked: "bg-muted/20 border border-muted/30",
    accent: "bg-accent border border-accent",
  };

  const textVariantStyles = {
    default: "text-foreground",
    success: "text-success",
    premium: "text-accent",
    locked: "text-muted",
    accent: "text-white",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5",
    md: "px-3 py-1",
  };

  const textSizeStyles = {
    sm: "text-xs",
    md: "text-sm",
  };

  return (
    <View
      className={cn(
        "rounded-full",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <Text
        className={cn(
          "font-semibold",
          textVariantStyles[variant],
          textSizeStyles[size]
        )}
      >
        {children}
      </Text>
    </View>
  );
}

// Applied badge specifically for tips
export function AppliedBadge() {
  return (
    <Badge variant="success" size="sm">
      ✓ Applied
    </Badge>
  );
}

// Premium badge for locked content
export function PremiumBadge() {
  return (
    <Badge variant="premium" size="sm">
      ⭐ Premium
    </Badge>
  );
}

// Free badge for free content
export function FreeBadge() {
  return (
    <Badge variant="success" size="sm">
      FREE
    </Badge>
  );
}

// Savings badge showing estimated savings
interface SavingsBadgeProps {
  amount: string;
}

export function SavingsBadge({ amount }: SavingsBadgeProps) {
  return (
    <Badge variant="accent" size="sm">
      {amount}
    </Badge>
  );
}
