// Savvy Minimalist White Design System
// Clean, white, minimal — maximum whitespace, subtle shadows, one accent color

export const hatchColors = {
  // Backgrounds — clean whites and light grays
  background: {
    primary: "#FFFFFF",
    secondary: "#F8F9FA",
    tertiary: "#F1F3F5",
    card: "#F9FAFB",
    cardLight: "#F3F4F6",
  },
  // Primary Brand Color — fresh green (savings / growth)
  primary: {
    default: "#10B981",
    light: "#34D399",
    dark: "#059669",
    muted: "rgba(16, 185, 129, 0.08)",
  },
  // Text Colors — dark grays for readability
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    tertiary: "#9CA3AF",
    inverse: "#FFFFFF",
    link: "#10B981",
    error: "#EF4444",
  },
  // Status Colors
  status: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  // Accent Colors — warm, nurturing palette
  accent: {
    teal: "#14B8A6",
    amber: "#F59E0B",
    purple: "#8B5CF6",
    coral: "#EF4444",
    warm: "#FEF3C7",       // Soft warm yellow for nurturing highlights
    warmText: "#92400E",   // Warm amber text
    peach: "#FFF7ED",      // Soft peach background
    peachText: "#9A3412",  // Rich peach text
  },
  // Border Colors — very subtle
  border: {
    default: "#E5E7EB",
    light: "#F3F4F6",
    focused: "#10B981",
  },
  // Overlay
  overlay: {
    dark: "rgba(0, 0, 0, 0.4)",
    light: "rgba(0, 0, 0, 0.02)",
    modal: "rgba(0, 0, 0, 0.5)",
  },
};

export const hatchTypography = {
  fontFamily: { regular: "System", medium: "System", semibold: "System", bold: "System" },
  fontSize: { xs: 11, sm: 13, base: 15, md: 17, lg: 20, xl: 22, "2xl": 26, "3xl": 32, "4xl": 40 },
  fontWeight: { regular: "400" as const, medium: "500" as const, semibold: "600" as const, bold: "700" as const },
  lineHeight: { tight: 1.2, normal: 1.4, relaxed: 1.6 },
  letterSpacing: { tight: -0.5, normal: 0, wide: 0.5, wider: 1.0 },
};

export const hatchSpacing = {
  0: 0, px: 1, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
  screenPadding: 20, cardPadding: 16, sectionGap: 24, itemGap: 12, inputHeight: 52, buttonHeight: 48,
};

export const hatchRadius = { none: 0, sm: 8, md: 12, lg: 16, xl: 20, "2xl": 24, "3xl": 28, full: 9999 };

export const hatchShadows = {
  none: { shadowColor: "transparent", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  sm: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  md: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  lg: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  glow: { shadowColor: "#10B981", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
};

export const hatchComponents = {
  button: {
    primary: { background: hatchColors.primary.default, text: hatchColors.text.inverse, pressedBackground: hatchColors.primary.dark, borderRadius: hatchRadius.full, height: hatchSpacing.buttonHeight },
    secondary: { background: hatchColors.background.tertiary, text: hatchColors.text.primary, pressedBackground: hatchColors.border.default, borderRadius: hatchRadius.full, height: hatchSpacing.buttonHeight },
    ghost: { background: "transparent", text: hatchColors.primary.default, pressedBackground: hatchColors.primary.muted, borderRadius: hatchRadius.md, height: hatchSpacing.buttonHeight },
    destructive: { background: "transparent", text: hatchColors.accent.coral, pressedBackground: "rgba(239, 68, 68, 0.06)", borderRadius: hatchRadius.md, height: hatchSpacing.buttonHeight },
  },
  input: { default: { background: hatchColors.background.secondary, text: hatchColors.text.primary, placeholder: hatchColors.text.tertiary, border: hatchColors.border.default, borderFocused: hatchColors.border.focused, borderRadius: hatchRadius.lg, height: hatchSpacing.inputHeight } },
  card: { default: { background: hatchColors.background.card, borderRadius: hatchRadius.xl, padding: hatchSpacing.cardPadding }, elevated: { background: hatchColors.background.card, borderRadius: hatchRadius.xl, padding: hatchSpacing.cardPadding, ...hatchShadows.md } },
  modal: { background: hatchColors.background.primary, borderRadius: hatchRadius["2xl"], overlayColor: hatchColors.overlay.dark },
  toggle: { trackOn: hatchColors.primary.default, trackOff: hatchColors.border.default, thumb: "#FFFFFF", width: 51, height: 31 },
  slider: { track: hatchColors.border.default, fill: hatchColors.primary.default, thumb: "#FFFFFF", thumbSize: 28 },
  listRow: { background: "transparent", pressedBackground: hatchColors.background.secondary, borderColor: hatchColors.border.light, height: 56, padding: hatchSpacing.screenPadding },
  navigation: { headerBackground: hatchColors.background.primary, headerText: hatchColors.text.primary, backButtonColor: hatchColors.text.primary, tabBarBackground: hatchColors.background.primary, tabBarBorder: hatchColors.border.light, tabActive: hatchColors.primary.default, tabInactive: hatchColors.text.tertiary },
};

// Legacy theme export for backwards compatibility
export const theme = {
  colors: {
    primary: hatchColors.primary.default,
    primaryLight: hatchColors.primary.light,
    primaryDark: hatchColors.primary.dark,
    primaryMuted: hatchColors.primary.muted,
    accent: hatchColors.accent.amber,
    accentLight: hatchColors.accent.teal,
    accentMuted: hatchColors.primary.muted,
    success: hatchColors.status.success,
    successMuted: "rgba(16, 185, 129, 0.08)",
    bg: hatchColors.background.primary,
    bgSecondary: hatchColors.background.secondary,
    card: hatchColors.background.card,
    cardGlass: hatchColors.background.tertiary,
    cardDark: hatchColors.background.cardLight,
    text: hatchColors.text.primary,
    textSecondary: hatchColors.text.secondary,
    textMuted: hatchColors.text.tertiary,
    textInverse: hatchColors.text.inverse,
    border: hatchColors.border.default,
    borderLight: hatchColors.border.light,
    overlay: hatchColors.overlay.dark,
    overlayLight: hatchColors.overlay.light,
  },
  typography: {
    regular: hatchTypography.fontWeight.regular,
    medium: hatchTypography.fontWeight.medium,
    semibold: hatchTypography.fontWeight.semibold,
    bold: hatchTypography.fontWeight.bold,
    xs: hatchTypography.fontSize.xs, sm: hatchTypography.fontSize.sm, base: hatchTypography.fontSize.base, md: hatchTypography.fontSize.md, lg: hatchTypography.fontSize.lg, xl: hatchTypography.fontSize.xl, "2xl": hatchTypography.fontSize["2xl"], "3xl": hatchTypography.fontSize["3xl"], "4xl": hatchTypography.fontSize["4xl"],
    tight: hatchTypography.lineHeight.tight, normal: hatchTypography.lineHeight.normal, relaxed: hatchTypography.lineHeight.relaxed,
  },
  spacing: { xs: hatchSpacing[1], sm: hatchSpacing[2], md: hatchSpacing[3], base: hatchSpacing[4], lg: hatchSpacing[5], xl: hatchSpacing[6], "2xl": hatchSpacing[8], "3xl": hatchSpacing[10], "4xl": hatchSpacing[12] },
  radius: { sm: hatchRadius.sm, md: hatchRadius.md, lg: hatchRadius.lg, xl: hatchRadius.xl, "2xl": hatchRadius["2xl"], full: hatchRadius.full },
  shadows: hatchShadows,
};

export type Theme = typeof theme;
export type HatchColors = typeof hatchColors;
export type HatchTypography = typeof hatchTypography;
