// Global App State Context for Savvy App

import {
  CALENDAR_CATEGORIES,
  createCategoryId,
  lightenColor,
} from "@/constants/calendar-types";
import { CurrencyCode } from "@/constants/currencies";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { generateId, getDayIndex, getTodayDate } from "./utils";

const MAX_MONEY_AMOUNT = 10000;

type SavingsEntryType = "income" | "expense";

// Types
export interface UserProfile {
  name: string;
  goal: "save" | "invest" | "both";
  currency: CurrencyCode;
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
  reminderTime: string; // HH:MM format
  monthlyIncome?: number;
}

export interface SavingsEntry {
  id: string;
  type: SavingsEntryType;
  amount: number;
  category: string;
  note: string;
  date: string; // ISO string
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  weeklyActivity: boolean[]; // 7 days, Mon-Sun
  weekStartDate: string; // YYYY-MM-DD (Monday)
}

interface NotificationSettings {
  enabled: boolean;
  reminderTime: string;
}

export type CalendarEventType = string;

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO string
  time?: string; // HH:mm format
  endTime?: string; // HH:mm format
  allDay?: boolean;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
  type: CalendarEventType;
  amount?: number;
  color: string;
  note?: string;
}

export interface CustomCalendarCategory {
  id: string;
  label: string;
  color: string;
  colorLight: string;
}

interface AppState {
  // User Profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => Promise<void>;

  // Savings Tracker
  savingsEntries: SavingsEntry[];
  addSavingsEntry: (entry: Omit<SavingsEntry, "id">) => Promise<void>;
  updateSavingsEntry: (entry: SavingsEntry) => Promise<void>;
  deleteSavingsEntry: (id: string) => Promise<void>;
  getTotalSavings: () => number;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getMonthlySavings: () => number;
  getWeeklySavings: () => number;
  getReservedExpenses: () => number;
  getAvailableAfterReserved: () => number;
  getUpcomingCostEvents: () => CalendarEvent[];

  // Savings Goals
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => Promise<void>;
  updateSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;

  // Lessons
  completedLessons: string[];
  markLessonComplete: (lessonId: string) => Promise<void>;
  isLessonCompleted: (lessonId: string) => boolean;

  // Tips
  appliedTips: string[];
  markTipApplied: (tipId: string) => Promise<void>;
  isTipApplied: (tipId: string) => boolean;

  // Streak
  streakData: StreakData;
  recordActivity: () => Promise<void>;

  // Premium
  isPremium: boolean;
  setPremium: (status: boolean) => Promise<void>;

  // Notification Settings
  notificationSettings: NotificationSettings;
  setNotificationSettings: (settings: NotificationSettings) => Promise<void>;

  // Calendar Events
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, "id">) => Promise<void>;
  updateCalendarEvent: (event: CalendarEvent) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  customCalendarCategories: CustomCalendarCategory[];
  addCustomCalendarCategory: (category: {
    label: string;
    color: string;
  }) => Promise<CustomCalendarCategory | null>;

  // Loading
  isLoading: boolean;
}

function clampAmount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_MONEY_AMOUNT, Math.max(0, value));
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }
  return new Date(year, month - 1, day);
}

function getWeekStartDate(date: Date = new Date()): string {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  const year = copy.getFullYear();
  const month = String(copy.getMonth() + 1).padStart(2, "0");
  const dayNum = String(copy.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayNum}`;
}

function getDateDifferenceInDays(from: string, to: string): number {
  if (!from) return Number.POSITIVE_INFINITY;
  const fromDate = parseDateOnly(from);
  const toDate = parseDateOnly(to);
  const diffMs = toDate.getTime() - fromDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function sanitizeWeeklyActivity(value: unknown): boolean[] {
  if (!Array.isArray(value) || value.length !== 7) {
    return [false, false, false, false, false, false, false];
  }
  return value.map((item) => Boolean(item));
}

function ensureUniqueIds<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();

  return items.map((item) => {
    let nextId =
      typeof item.id === "string" && item.id.trim() ? item.id : generateId();

    while (seen.has(nextId)) {
      nextId = generateId();
    }

    seen.add(nextId);
    return nextId === item.id ? item : { ...item, id: nextId };
  });
}

function normalizeSavingsEntry(entry: any): SavingsEntry {
  const rawAmount = Math.abs(Number(entry?.amount) || 0);
  const normalizedAmount = clampAmount(rawAmount);
  const normalizedType: SavingsEntryType =
    entry?.type === "income" || entry?.type === "expense"
      ? entry.type
      : Number(entry?.amount) < 0
        ? "expense"
        : "income";

  return {
    id: typeof entry?.id === "string" ? entry.id : generateId(),
    type: normalizedType,
    amount: normalizedAmount,
    category: typeof entry?.category === "string" && entry.category.trim() ? entry.category : normalizedType,
    note: typeof entry?.note === "string" ? entry.note : "",
    date: typeof entry?.date === "string" ? entry.date : new Date().toISOString(),
  };
}

function normalizeSavingsGoal(goal: any): SavingsGoal {
  return {
    id: typeof goal?.id === "string" ? goal.id : generateId(),
    title: typeof goal?.title === "string" ? goal.title : "Goal",
    targetAmount: clampAmount(Number(goal?.targetAmount) || 0),
    currentAmount: clampAmount(Number(goal?.currentAmount) || 0),
    icon: typeof goal?.icon === "string" ? goal.icon : "trophy",
    color: typeof goal?.color === "string" ? goal.color : "#10B981",
  };
}

function normalizeCustomCalendarCategory(category: any): CustomCalendarCategory | null {
  const label =
    typeof category?.label === "string" && category.label.trim()
      ? category.label.trim().slice(0, 28)
      : "";
  const color =
    typeof category?.color === "string" && /^#?[0-9a-fA-F]{6}$/.test(category.color)
      ? `#${category.color.replace("#", "")}`
      : "";
  if (!label || !color) return null;

  const id =
    typeof category?.id === "string" && category.id.trim()
      ? category.id
      : createCategoryId(label);

  return {
    id,
    label,
    color,
    colorLight: lightenColor(color),
  };
}

function normalizeCalendarEventType(type: any): CalendarEventType {
  if (typeof type !== "string" || !type.trim()) {
    return "family";
  }
  return type.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_");
}

function normalizeCalendarEvent(event: any): CalendarEvent {
  const amountValue = event?.amount === undefined || event?.amount === null
    ? undefined
    : clampAmount(Math.abs(Number(event.amount) || 0));

  return {
    id: typeof event?.id === "string" ? event.id : generateId(),
    title: typeof event?.title === "string" ? event.title : "Untitled",
    date: typeof event?.date === "string" ? event.date : new Date().toISOString(),
    time: typeof event?.time === "string" ? event.time : undefined,
    endTime: typeof event?.endTime === "string" ? event.endTime : undefined,
    allDay: Boolean(event?.allDay) || (!event?.time && !event?.endTime),
    recurrence:
      event?.recurrence === "daily" ||
      event?.recurrence === "weekly" ||
      event?.recurrence === "monthly"
        ? event.recurrence
        : "none",
    type: normalizeCalendarEventType(event?.type),
    amount: amountValue && amountValue > 0 ? amountValue : undefined,
    color:
      typeof event?.color === "string" && /^#?[0-9a-fA-F]{6}$/.test(event.color)
        ? `#${event.color.replace("#", "")}`
        : CALENDAR_CATEGORIES.family.color,
    note:
      typeof event?.note === "string"
        ? event.note
        : typeof event?.notes === "string"
          ? event.notes
          : undefined,
  };
}

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: "",
  weeklyActivity: [false, false, false, false, false, false, false],
  weekStartDate: getWeekStartDate(),
};

const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  reminderTime: "09:00",
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [savingsEntries, setSavingsEntries] = useState<SavingsEntry[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [appliedTips, setAppliedTips] = useState<string[]>([]);
  const [streakData, setStreakDataState] = useState<StreakData>(defaultStreakData);
  const [isPremium, setIsPremiumState] = useState(false);
  const [notificationSettings, setNotificationSettingsState] = useState<NotificationSettings>(defaultNotificationSettings);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [customCalendarCategories, setCustomCalendarCategories] = useState<CustomCalendarCategory[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const checkAndUpdateStreak = (data: Partial<StreakData>): StreakData => {
    const today = getTodayDate();
    const currentWeekStart = getWeekStartDate();

    const normalizedWeekly = sanitizeWeeklyActivity(data.weeklyActivity);
    const weekChanged = data.weekStartDate !== currentWeekStart;

    const daysSinceLastActive = getDateDifferenceInDays(
      typeof data.lastActiveDate === "string" ? data.lastActiveDate : "",
      today
    );

    return {
      currentStreak: daysSinceLastActive > 1 ? 0 : Number(data.currentStreak) || 0,
      longestStreak: Number(data.longestStreak) || 0,
      lastActiveDate: typeof data.lastActiveDate === "string" ? data.lastActiveDate : "",
      weeklyActivity: weekChanged ? [false, false, false, false, false, false, false] : normalizedWeekly,
      weekStartDate: currentWeekStart,
    };
  };

  const loadAllData = async () => {
    try {
      const [
        profileData,
        entriesData,
        lessonsData,
        tipsData,
        streakDataStr,
        premiumData,
        premiumResetMarker,
        notifData,
        eventsData,
        customCategoriesData,
        goalsData,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.SAVINGS_ENTRIES),
        AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS),
        AsyncStorage.getItem(STORAGE_KEYS.APPLIED_TIPS),
        AsyncStorage.getItem(STORAGE_KEYS.STREAK_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS),
        AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_RESET_MARKER),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS),
        AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_CUSTOM_CATEGORIES),
        AsyncStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS),
      ]);

      if (profileData) {
        const parsedProfile = JSON.parse(profileData);
        if (parsedProfile && typeof parsedProfile === "object") {
          setUserProfileState(parsedProfile);
        }
      }

      if (entriesData) {
        const parsedEntries = JSON.parse(entriesData);
        if (Array.isArray(parsedEntries)) {
          setSavingsEntries(ensureUniqueIds(parsedEntries.map(normalizeSavingsEntry)));
        }
      }

      if (lessonsData) {
        const parsedLessons = JSON.parse(lessonsData);
        if (Array.isArray(parsedLessons)) {
          setCompletedLessons(parsedLessons.filter((id) => typeof id === "string"));
        }
      }

      if (tipsData) {
        const parsedTips = JSON.parse(tipsData);
        if (Array.isArray(parsedTips)) {
          setAppliedTips(parsedTips.filter((id) => typeof id === "string"));
        }
      }

      if (streakDataStr) {
        const parsedStreak = JSON.parse(streakDataStr);
        const updatedStreak = checkAndUpdateStreak(parsedStreak);
        setStreakDataState(updatedStreak);
      }

      const shouldResetPremiumOnce = !premiumResetMarker;
      if (shouldResetPremiumOnce) {
        setIsPremiumState(false);
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.PREMIUM_STATUS, JSON.stringify(false)],
          [STORAGE_KEYS.PREMIUM_RESET_MARKER, "true"],
        ]);
      } else if (premiumData) {
        setIsPremiumState(Boolean(JSON.parse(premiumData)));
      } else {
        setIsPremiumState(false);
      }

      if (notifData) {
        const parsedNotif = JSON.parse(notifData);
        if (parsedNotif && typeof parsedNotif === "object") {
          setNotificationSettingsState({
            enabled: Boolean(parsedNotif.enabled),
            reminderTime:
              typeof parsedNotif.reminderTime === "string"
                ? parsedNotif.reminderTime
                : defaultNotificationSettings.reminderTime,
          });
        }
      }

      if (eventsData) {
        const parsedEvents = JSON.parse(eventsData);
        if (Array.isArray(parsedEvents)) {
          setCalendarEvents(ensureUniqueIds(parsedEvents.map(normalizeCalendarEvent)));
        }
      }

      if (customCategoriesData) {
        const parsedCategories = JSON.parse(customCategoriesData);
        if (Array.isArray(parsedCategories)) {
          const normalized = parsedCategories
            .map(normalizeCustomCalendarCategory)
            .filter((item): item is CustomCalendarCategory => item !== null);
          const seenIds = new Set<string>();
          const seenLabels = new Set<string>();
          const unique = normalized.reduce<CustomCalendarCategory[]>((acc, item) => {
            const labelKey = item.label.toLowerCase();
            if (seenLabels.has(labelKey)) return acc;

            let nextId = item.id;
            while (seenIds.has(nextId)) {
              nextId = createCategoryId(item.label);
            }

            seenIds.add(nextId);
            seenLabels.add(labelKey);
            acc.push(nextId === item.id ? item : { ...item, id: nextId });
            return acc;
          }, []);

          setCustomCalendarCategories(unique);
        }
      }

      if (goalsData) {
        const parsedGoals = JSON.parse(goalsData);
        if (Array.isArray(parsedGoals)) {
          setSavingsGoals(ensureUniqueIds(parsedGoals.map(normalizeSavingsGoal)));
        }
      }
    } catch (error) {
      console.error("Error loading app data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // User Profile
  const setUserProfile = async (profile: UserProfile) => {
    const normalizedProfile: UserProfile = {
      ...profile,
      monthlyIncome:
        profile.monthlyIncome === undefined
          ? undefined
          : clampAmount(Number(profile.monthlyIncome) || 0),
    };
    const syncedNotificationSettings: NotificationSettings = {
      enabled: Boolean(normalizedProfile.notificationsEnabled),
      reminderTime:
        typeof normalizedProfile.reminderTime === "string" &&
        normalizedProfile.reminderTime.trim()
          ? normalizedProfile.reminderTime
          : defaultNotificationSettings.reminderTime,
    };
    setUserProfileState(normalizedProfile);
    setNotificationSettingsState(syncedNotificationSettings);
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(normalizedProfile)
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.NOTIFICATION_SETTINGS,
      JSON.stringify(syncedNotificationSettings)
    );
  };

  // Savings Entries
  const addSavingsEntry = async (entry: Omit<SavingsEntry, "id">) => {
    const newEntry = normalizeSavingsEntry({ ...entry, id: generateId() });
    if (newEntry.amount <= 0) return;

    const updated = [newEntry, ...savingsEntries];
    setSavingsEntries(updated);
    await AsyncStorage.setItem(
      STORAGE_KEYS.SAVINGS_ENTRIES,
      JSON.stringify(updated)
    );
    await recordActivity();
  };

  const updateSavingsEntry = async (entry: SavingsEntry) => {
    const normalized = normalizeSavingsEntry(entry);
    if (normalized.amount <= 0) return;

    const updated = savingsEntries.map((currentEntry) =>
      currentEntry.id === normalized.id ? normalized : currentEntry
    );
    setSavingsEntries(updated);
    await AsyncStorage.setItem(
      STORAGE_KEYS.SAVINGS_ENTRIES,
      JSON.stringify(updated)
    );
  };

  const deleteSavingsEntry = async (id: string) => {
    const updated = savingsEntries.filter((entry) => entry.id !== id);
    setSavingsEntries(updated);
    await AsyncStorage.setItem(
      STORAGE_KEYS.SAVINGS_ENTRIES,
      JSON.stringify(updated)
    );
  };

  const getTotalIncome = useCallback(() => {
    return savingsEntries
      .filter((entry) => entry.type === "income")
      .reduce((sum, entry) => sum + entry.amount, 0);
  }, [savingsEntries]);

  const getTotalExpenses = useCallback(() => {
    return savingsEntries
      .filter((entry) => entry.type === "expense")
      .reduce((sum, entry) => sum + entry.amount, 0);
  }, [savingsEntries]);

  const getTotalSavings = useCallback(() => {
    return getTotalIncome() - getTotalExpenses();
  }, [getTotalIncome, getTotalExpenses]);

  const getMonthlySavings = useCallback(() => {
    const now = new Date();
    const monthlyEntries = savingsEntries.filter((entry) => {
      const date = new Date(entry.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    return monthlyEntries.reduce((sum, entry) => {
      return entry.type === "income" ? sum + entry.amount : sum - entry.amount;
    }, 0);
  }, [savingsEntries]);

  const getWeeklySavings = useCallback(() => {
    const now = new Date();
    const startOfWeek = parseDateOnly(getWeekStartDate(now));

    const weeklyEntries = savingsEntries.filter((entry) => {
      const date = new Date(entry.date);
      date.setHours(0, 0, 0, 0);
      return date >= startOfWeek;
    });

    return weeklyEntries.reduce((sum, entry) => {
      return entry.type === "income" ? sum + entry.amount : sum - entry.amount;
    }, 0);
  }, [savingsEntries]);

  const getUpcomingCostEvents = useCallback(() => {
    const todayDate = parseDateOnly(getTodayDate());

    return calendarEvents
      .filter((event) => {
        if (!event.amount || event.amount <= 0) return false;
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= todayDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [calendarEvents]);

  const getReservedExpenses = useCallback(() => {
    return getUpcomingCostEvents().reduce((sum, event) => sum + (event.amount || 0), 0);
  }, [getUpcomingCostEvents]);

  const getAvailableAfterReserved = useCallback(() => {
    return getTotalSavings() - getReservedExpenses();
  }, [getTotalSavings, getReservedExpenses]);

  const addCustomCalendarCategory = async (category: { label: string; color: string }) => {
    const normalized = normalizeCustomCalendarCategory(category);
    if (!normalized) return null;
    const normalizedLabel = normalized.label.toLowerCase();

    if (
      Object.values(CALENDAR_CATEGORIES).some(
        (item) => item.label.toLowerCase() === normalizedLabel
      )
    ) {
      return null;
    }

    if (Object.prototype.hasOwnProperty.call(CALENDAR_CATEGORIES, normalized.id)) {
      return null;
    }

    if (
      customCalendarCategories.some(
        (item) =>
          item.id === normalized.id ||
          item.label.toLowerCase() === normalizedLabel
      )
    ) {
      return null;
    }

    const updated = [...customCalendarCategories, normalized];
    setCustomCalendarCategories(updated);
    await AsyncStorage.setItem(
      STORAGE_KEYS.CALENDAR_CUSTOM_CATEGORIES,
      JSON.stringify(updated)
    );
    return normalized;
  };

  // Calendar Events
  const addCalendarEvent = async (event: Omit<CalendarEvent, "id">) => {
    const normalized = normalizeCalendarEvent({ ...event, id: generateId() });
    const updated = [...calendarEvents, normalized];
    setCalendarEvents(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(updated));
    await recordActivity();
  };

  const updateCalendarEvent = async (event: CalendarEvent) => {
    const normalized = normalizeCalendarEvent(event);
    const updated = calendarEvents.map((currentEvent) =>
      currentEvent.id === normalized.id ? normalized : currentEvent
    );
    setCalendarEvents(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(updated));
  };

  const deleteCalendarEvent = async (id: string) => {
    const updated = calendarEvents.filter((event) => event.id !== id);
    setCalendarEvents(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(updated));
  };

  // Savings Goals
  const addSavingsGoal = async (goal: Omit<SavingsGoal, "id">) => {
    const newGoal: SavingsGoal = normalizeSavingsGoal({ ...goal, id: generateId() });
    const updated = [...savingsGoals, newGoal];
    setSavingsGoals(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(updated));
  };

  const updateSavingsGoal = async (goal: SavingsGoal) => {
    const normalized = normalizeSavingsGoal(goal);
    const updated = savingsGoals.map((currentGoal) =>
      currentGoal.id === normalized.id ? normalized : currentGoal
    );
    setSavingsGoals(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(updated));
  };

  const deleteSavingsGoal = async (id: string) => {
    const updated = savingsGoals.filter((goal) => goal.id !== id);
    setSavingsGoals(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(updated));
  };

  // Lessons
  const markLessonComplete = async (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      const updated = [...completedLessons, lessonId];
      setCompletedLessons(updated);
      await AsyncStorage.setItem(
        STORAGE_KEYS.COMPLETED_LESSONS,
        JSON.stringify(updated)
      );
      await recordActivity();
    }
  };

  const isLessonCompleted = useCallback(
    (lessonId: string) => completedLessons.includes(lessonId),
    [completedLessons]
  );

  // Tips
  const markTipApplied = async (tipId: string) => {
    if (!appliedTips.includes(tipId)) {
      const updated = [...appliedTips, tipId];
      setAppliedTips(updated);
      await AsyncStorage.setItem(
        STORAGE_KEYS.APPLIED_TIPS,
        JSON.stringify(updated)
      );
      await recordActivity();
    }
  };

  const isTipApplied = useCallback(
    (tipId: string) => appliedTips.includes(tipId),
    [appliedTips]
  );

  // Streak
  const recordActivity = async () => {
    const today = getTodayDate();
    const currentWeekStart = getWeekStartDate();
    const dayIndex = getDayIndex();

    const baseWeekly =
      streakData.weekStartDate === currentWeekStart
        ? sanitizeWeeklyActivity(streakData.weeklyActivity)
        : [false, false, false, false, false, false, false];

    const updatedWeekly = [...baseWeekly];
    updatedWeekly[dayIndex] = true;

    let nextStreak = streakData.currentStreak;
    let longestStreak = streakData.longestStreak;

    if (streakData.lastActiveDate !== today) {
      const diff = getDateDifferenceInDays(streakData.lastActiveDate, today);
      nextStreak = diff === 1 ? streakData.currentStreak + 1 : 1;
      longestStreak = Math.max(nextStreak, streakData.longestStreak);
    }

    const newStreakData: StreakData = {
      currentStreak: nextStreak,
      longestStreak,
      lastActiveDate: today,
      weeklyActivity: updatedWeekly,
      weekStartDate: currentWeekStart,
    };

    setStreakDataState(newStreakData);
    await AsyncStorage.setItem(
      STORAGE_KEYS.STREAK_DATA,
      JSON.stringify(newStreakData)
    );
  };

  // Premium
  const setPremium = async (status: boolean) => {
    setIsPremiumState(status);
    await AsyncStorage.setItem(
      STORAGE_KEYS.PREMIUM_STATUS,
      JSON.stringify(status)
    );
  };

  // Notification Settings
  const setNotificationSettings = async (settings: NotificationSettings) => {
    setNotificationSettingsState(settings);
    await AsyncStorage.setItem(
      STORAGE_KEYS.NOTIFICATION_SETTINGS,
      JSON.stringify(settings)
    );
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        savingsEntries,
        addSavingsEntry,
        updateSavingsEntry,
        deleteSavingsEntry,
        getTotalSavings,
        getTotalIncome,
        getTotalExpenses,
        getMonthlySavings,
        getWeeklySavings,
        getReservedExpenses,
        getAvailableAfterReserved,
        getUpcomingCostEvents,
        completedLessons,
        markLessonComplete,
        isLessonCompleted,
        appliedTips,
        markTipApplied,
        isTipApplied,
        streakData,
        recordActivity,
        isPremium,
        setPremium,
        notificationSettings,
        setNotificationSettings,
        calendarEvents,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        customCalendarCategories,
        addCustomCalendarCategory,
        savingsGoals,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
