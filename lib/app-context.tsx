// Global App State Context for Savvy App

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
import { generateId, getDayIndex, getTodayDate, isSameDay } from "./utils";

// Types
export interface UserProfile {
  name: string;
  goal: "save" | "invest" | "both";
  currency: CurrencyCode;
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
  reminderTime: string; // HH:MM format
}

export interface SavingsEntry {
  id: string;
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
  lastActiveDate: string; // ISO date string
  weeklyActivity: boolean[]; // 7 days, Mon-Sun
}

interface NotificationSettings {
  enabled: boolean;
  reminderTime: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO string
  time?: string; // HH:mm format
  endTime?: string; // HH:mm format
  recurrence?: "none" | "daily" | "weekly" | "monthly";
  type: "payment" | "reminder" | "milestone" | "other" | "shopping" | "activity";
  amount?: number;
  color: string;
  note?: string;
}

interface AppState {
  // User Profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => Promise<void>;

  // Savings Tracker
  savingsEntries: SavingsEntry[];
  addSavingsEntry: (entry: Omit<SavingsEntry, "id">) => Promise<void>;
  deleteSavingsEntry: (id: string) => Promise<void>;
  getTotalSavings: () => number;
  getMonthlySavings: () => number;
  getWeeklySavings: () => number;

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

  // Loading
  isLoading: boolean;
}

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: "",
  weeklyActivity: [false, false, false, false, false, false, false],
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
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [
        profileData,
        entriesData,
        lessonsData,
        tipsData,
        streakDataStr,
        premiumData,
        notifData,
        eventsData,
        goalsData,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.SAVINGS_ENTRIES),
        AsyncStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS),
        AsyncStorage.getItem(STORAGE_KEYS.APPLIED_TIPS),
        AsyncStorage.getItem(STORAGE_KEYS.STREAK_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS),
        AsyncStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS),
      ]);

      if (profileData) setUserProfileState(JSON.parse(profileData));
      if (entriesData) setSavingsEntries(JSON.parse(entriesData));
      if (lessonsData) setCompletedLessons(JSON.parse(lessonsData));
      if (tipsData) setAppliedTips(JSON.parse(tipsData));
      if (streakDataStr) {
        const parsed = JSON.parse(streakDataStr);
        // Check if streak should be reset
        const updatedStreak = checkAndUpdateStreak(parsed);
        setStreakDataState(updatedStreak);
      }
      if (premiumData) setIsPremiumState(JSON.parse(premiumData));
      if (notifData) setNotificationSettingsState(JSON.parse(notifData));
      if (eventsData) setCalendarEvents(JSON.parse(eventsData));
      if (goalsData) setSavingsGoals(JSON.parse(goalsData));
    } catch (error) {
      console.error("Error loading app data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calendar Events
  const addCalendarEvent = async (event: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = { ...event, id: generateId() };
    const updated = [...calendarEvents, newEvent];
    setCalendarEvents(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(updated));
    await recordActivity();
  };

  const updateCalendarEvent = async (event: CalendarEvent) => {
    const updated = calendarEvents.map(e => e.id === event.id ? event : e);
    setCalendarEvents(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(updated));
  };

  const deleteCalendarEvent = async (id: string) => {
    const updated = calendarEvents.filter(e => e.id !== id);
    setCalendarEvents(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(updated));
  };

  // Savings Goals
  const addSavingsGoal = async (goal: Omit<SavingsGoal, "id">) => {
    const newGoal: SavingsGoal = { ...goal, id: generateId() };
    const updated = [...savingsGoals, newGoal];
    setSavingsGoals(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(updated));
  };

  const updateSavingsGoal = async (goal: SavingsGoal) => {
    const updated = savingsGoals.map(g => g.id === goal.id ? goal : g);
    setSavingsGoals(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(updated));
  };

  const deleteSavingsGoal = async (id: string) => {
    const updated = savingsGoals.filter(g => g.id !== id);
    setSavingsGoals(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(updated));
  };


  // Check and update streak based on last active date
  const checkAndUpdateStreak = (data: StreakData): StreakData => {
    if (!data.lastActiveDate) return data;

    const lastActive = new Date(data.lastActiveDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // If last active was before yesterday, reset streak
    if (lastActive < yesterday && !isSameDay(lastActive, yesterday)) {
      return {
        ...data,
        currentStreak: 0,
        weeklyActivity: [false, false, false, false, false, false, false],
      };
    }

    return data;
  };

  // User Profile
  const setUserProfile = async (profile: UserProfile) => {
    setUserProfileState(profile);
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(profile)
    );
  };

  // Savings Entries
  const addSavingsEntry = async (entry: Omit<SavingsEntry, "id">) => {
    const newEntry: SavingsEntry = { ...entry, id: generateId() };
    const updated = [newEntry, ...savingsEntries];
    setSavingsEntries(updated);
    await AsyncStorage.setItem(
      STORAGE_KEYS.SAVINGS_ENTRIES,
      JSON.stringify(updated)
    );
    await recordActivity();
  };

  const deleteSavingsEntry = async (id: string) => {
    const updated = savingsEntries.filter((e) => e.id !== id);
    setSavingsEntries(updated);
    await AsyncStorage.setItem(
      STORAGE_KEYS.SAVINGS_ENTRIES,
      JSON.stringify(updated)
    );
  };

  const getTotalSavings = useCallback(() => {
    return savingsEntries.reduce((sum, e) => sum + e.amount, 0);
  }, [savingsEntries]);

  const getMonthlySavings = useCallback(() => {
    const now = new Date();
    return savingsEntries
      .filter((e) => {
        const d = new Date(e.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [savingsEntries]);

  const getWeeklySavings = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    // Get Monday of current week
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    return savingsEntries
      .filter((e) => {
        const d = new Date(e.date);
        return d >= startOfWeek;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [savingsEntries]);

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
    const dayIndex = getDayIndex();

    let newStreakData: StreakData;

    if (streakData.lastActiveDate === today) {
      // Already recorded today, just update weekly activity
      const newWeeklyActivity = [...streakData.weeklyActivity];
      newWeeklyActivity[dayIndex] = true;
      newStreakData = { ...streakData, weeklyActivity: newWeeklyActivity };
    } else {
      // New day activity
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasActiveYesterday = isSameDay(
        streakData.lastActiveDate,
        yesterday.toISOString()
      );

      const newStreak = wasActiveYesterday
        ? streakData.currentStreak + 1
        : 1;
      const newLongestStreak = Math.max(newStreak, streakData.longestStreak);

      const newWeeklyActivity = [...streakData.weeklyActivity];
      newWeeklyActivity[dayIndex] = true;

      newStreakData = {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: today,
        weeklyActivity: newWeeklyActivity,
      };
    }

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
        deleteSavingsEntry,
        getTotalSavings,
        getMonthlySavings,
        getWeeklySavings,
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
