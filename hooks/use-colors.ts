// Hatch-inspired Color Hook for Savvy
import { hatchColors, hatchComponents, theme } from "@/constants/theme";

export function useColors() {
  return {
    // Primary brand colors
    primary: hatchColors.primary.default,
    primaryLight: hatchColors.primary.light,
    primaryDark: hatchColors.primary.dark,
    primaryMuted: hatchColors.primary.muted,

    // Background colors
    background: hatchColors.background.primary,
    backgroundSecondary: hatchColors.background.secondary,
    backgroundTertiary: hatchColors.background.tertiary,
    
    // Card colors
    card: hatchColors.background.card,
    cardLight: hatchColors.background.cardLight,

    // Text colors
    text: hatchColors.text.primary,
    textSecondary: hatchColors.text.secondary,
    textMuted: hatchColors.text.tertiary,
    textInverse: hatchColors.text.inverse,
    textLink: hatchColors.text.link,
    textError: hatchColors.text.error,

    // Status colors
    success: hatchColors.status.success,
    warning: hatchColors.status.warning,
    error: hatchColors.status.error,
    info: hatchColors.status.info,

    // Accent colors
    accent: hatchColors.accent.amber,
    accentTeal: hatchColors.accent.teal,
    accentPurple: hatchColors.accent.purple,
    accentCoral: hatchColors.accent.coral,

    // Border colors
    border: hatchColors.border.default,
    borderLight: hatchColors.border.light,
    borderFocused: hatchColors.border.focused,

    // Overlay colors
    overlay: hatchColors.overlay.dark,
    overlayLight: hatchColors.overlay.light,
    overlayModal: hatchColors.overlay.modal,

    // Raw access
    hatch: hatchColors,
    components: hatchComponents,
    legacy: theme.colors,
  };
}
