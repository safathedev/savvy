export type CalendarCategory = "family" | "school" | "home" | "work";

export interface CalendarCategoryConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  colorLight: string;
  isCustom?: boolean;
}

export const CALENDAR_CATEGORIES: Record<CalendarCategory, CalendarCategoryConfig> = {
  family: {
    id: "family",
    label: "Family",
    icon: "people",
    color: "#14B8A6",
    colorLight: "#E6FFFA",
  },
  school: {
    id: "school",
    label: "School",
    icon: "school",
    color: "#F97316",
    colorLight: "#FFF4E6",
  },
  home: {
    id: "home",
    label: "Home",
    icon: "home",
    color: "#10B981",
    colorLight: "#ECFDF5",
  },
  work: {
    id: "work",
    label: "Work",
    icon: "briefcase",
    color: "#3B82F6",
    colorLight: "#EFF6FF",
  },
};

export const DEFAULT_CALENDAR_CATEGORY_ORDER: CalendarCategory[] = [
  "family",
  "school",
  "home",
  "work",
];

export const DURATIONS = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "60 min", minutes: 60 },
] as const;

export const QUICK_TEMPLATES = [
  { title: "School drop-off", start: "08:00", duration: 30, category: "school" },
  { title: "Family dinner", start: "18:00", duration: 60, category: "family" },
  { title: "Home chores", start: "19:00", duration: 45, category: "home" },
  { title: "Work call", start: "10:00", duration: 30, category: "work" },
] as const;

export const CATEGORY_COLOR_PRESETS = [
  "#14B8A6",
  "#10B981",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F97316",
  "#EAB308",
  "#EF4444",
  "#64748B",
] as const;

function clampColor(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function lightenColor(hex: string, amount: number = 0.86): string {
  const clean = hex.replace("#", "");
  const normalized = clean.length === 3
    ? clean.split("").map((char) => char + char).join("")
    : clean.padEnd(6, "0").slice(0, 6);

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  const lr = clampColor(r + (255 - r) * amount);
  const lg = clampColor(g + (255 - g) * amount);
  const lb = clampColor(b + (255 - b) * amount);

  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb
    .toString(16)
    .padStart(2, "0")}`;
}

export function createCategoryId(label: string): string {
  const base = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);

  const suffix = Date.now().toString(36).slice(-4);
  return base ? `${base}_${suffix}` : `custom_${suffix}`;
}
