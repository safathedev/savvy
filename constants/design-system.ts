// Savvy Premium Design System
// Inspired by Apple Liquid Glass, Headspace, Duolingo, Acorns, Monzo

/**
 * 🎨 COLOR PALETTE
 * Primary: Fresh mint green (approachable, financial growth)
 * Accent: Warm coral/orange (energy, action, warmth for mums)
 * Surface: Soft creamy white with subtle warmth
 */

export const colors = {
  // Brand Colors
  primary: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981", // Main primary
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },

  // Accent - Warm Coral (for CTAs, highlights)
  accent: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316", // Main accent
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
  },

  // Secondary - Soft Teal (for Learn/Education)
  secondary: {
    50: "#F0FDFA",
    100: "#CCFBF1",
    200: "#99F6E4",
    300: "#5EEAD4",
    400: "#2DD4BF",
    500: "#14B8A6", // Main secondary
    600: "#0D9488",
    700: "#0F766E",
    800: "#115E59",
    900: "#134E4A",
  },

  // Success - For completions, streaks
  success: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    200: "#BBF7D0",
    300: "#86EFAC",
    400: "#4ADE80",
    500: "#22C55E",
    600: "#16A34A",
    700: "#15803D",
  },

  // Warning - For alerts
  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
  },

  // Error
  error: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    500: "#EF4444",
    600: "#DC2626",
  },

  // Neutrals - Warm grays
  neutral: {
    0: "#FFFFFF",
    50: "#FAFAF9", // Warm white
    100: "#F5F5F4",
    200: "#E7E5E4",
    300: "#D6D3D1",
    400: "#A8A29E",
    500: "#78716C",
    600: "#57534E",
    700: "#44403C",
    800: "#292524",
    900: "#1C1917",
    950: "#0C0A09",
  },

  // Special - Premium Gold (for achievements)
  gold: {
    400: "#FACC15",
    500: "#EAB308",
    600: "#CA8A04",
  },

  // Glassmorphism colors
  glass: {
    white: "rgba(255, 255, 255, 0.85)",
    whiteMedium: "rgba(255, 255, 255, 0.6)",
    whiteLight: "rgba(255, 255, 255, 0.3)",
    dark: "rgba(0, 0, 0, 0.4)",
    darkLight: "rgba(0, 0, 0, 0.1)",
  },
} as const;

/**
 * 📐 SPACING SYSTEM
 * Based on 4px grid with 8px base unit
 */
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

/**
 * 🔤 TYPOGRAPHY
 * SF Pro inspired with clear hierarchy
 */
export const typography = {
  // Font families (system fonts)
  fontFamily: {
    sans: "System",
    mono: "SpaceMono",
  },

  // Font sizes
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    "2xl": 28,
    "3xl": 34,
    "4xl": 40,
    "5xl": 48,
  },

  // Line heights
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Font weights
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    heavy: "800",
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
  },
} as const;

/**
 * 🔲 BORDER RADIUS
 * Generous rounded corners for friendly feel
 */
export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
} as const;

/**
 * 🌑 SHADOWS
 * Subtle, soft shadows for depth
 */
export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  // Colored shadows for buttons
  primary: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  accent: {
    shadowColor: colors.accent[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

/**
 * ⚡ ANIMATIONS
 * Timing and easing for micro-interactions
 */
export const animations = {
  // Durations
  duration: {
    instant: 100,
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
  },

  // Spring configs for react-native-reanimated
  spring: {
    gentle: { damping: 20, stiffness: 150 },
    bouncy: { damping: 12, stiffness: 200 },
    snappy: { damping: 15, stiffness: 400 },
  },
} as const;

/**
 * 📱 COMPONENT PRESETS
 * Ready-to-use style presets
 */
export const presets = {
  // Card styles
  card: {
    default: {
      backgroundColor: colors.neutral[0],
      borderRadius: borderRadius.xl,
      padding: spacing[5],
      ...shadows.md,
    },
    glass: {
      backgroundColor: colors.glass.white,
      borderRadius: borderRadius.xl,
      padding: spacing[5],
      borderWidth: 1,
      borderColor: colors.glass.whiteLight,
      ...shadows.lg,
    },
    elevated: {
      backgroundColor: colors.neutral[0],
      borderRadius: borderRadius["2xl"],
      padding: spacing[6],
      ...shadows.xl,
    },
  },

  // Button styles
  button: {
    primary: {
      backgroundColor: colors.primary[500],
      borderRadius: borderRadius.full,
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[6],
      ...shadows.primary,
    },
    secondary: {
      backgroundColor: colors.neutral[100],
      borderRadius: borderRadius.full,
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[6],
      ...shadows.sm,
    },
    accent: {
      backgroundColor: colors.accent[500],
      borderRadius: borderRadius.full,
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[6],
      ...shadows.accent,
    },
  },

  // Input styles
  input: {
    default: {
      backgroundColor: colors.neutral[100],
      borderRadius: borderRadius.lg,
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[4],
      borderWidth: 2,
      borderColor: "transparent",
    },
    focused: {
      borderColor: colors.primary[500],
      backgroundColor: colors.neutral[0],
    },
  },
} as const;

/**
 * 🎯 SEMANTIC TOKENS
 * Context-aware color assignments
 */
export const semanticColors = {
  light: {
    background: colors.neutral[50],
    backgroundSecondary: colors.neutral[0],
    foreground: colors.neutral[900],
    foregroundSecondary: colors.neutral[600],
    muted: colors.neutral[500],
    border: colors.neutral[200],
    borderStrong: colors.neutral[300],
    primary: colors.primary[500],
    primaryForeground: colors.neutral[0],
    accent: colors.accent[500],
    accentForeground: colors.neutral[0],
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
  },
  dark: {
    background: colors.neutral[950],
    backgroundSecondary: colors.neutral[900],
    foreground: colors.neutral[50],
    foregroundSecondary: colors.neutral[400],
    muted: colors.neutral[500],
    border: colors.neutral[800],
    borderStrong: colors.neutral[700],
    primary: colors.primary[400],
    primaryForeground: colors.neutral[900],
    accent: colors.accent[400],
    accentForeground: colors.neutral[900],
    success: colors.success[400],
    warning: colors.warning[400],
    error: colors.error[500],
  },
} as const;

// Export theme type
export type ThemeColors = typeof semanticColors.light;
