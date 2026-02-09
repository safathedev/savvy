// AsyncStorage keys for Savvy App

export const STORAGE_KEYS = {
  USER_PROFILE: "@savvy_user_profile",
  SAVINGS_ENTRIES: "@savvy_savings_entries",
  COMPLETED_LESSONS: "@savvy_completed_lessons",
  APPLIED_TIPS: "@savvy_applied_tips",
  STREAK_DATA: "@savvy_streak_data",
  PREMIUM_STATUS: "@savvy_premium_status",
  NOTIFICATION_SETTINGS: "@savvy_notification_settings",
  THEME_MODE: "@savvy_theme_mode",
  MOOD_CHECKIN: "@savvy_mood_checkin",
  CALENDAR_EVENTS: "@savvy_calendar_events",
  SAVINGS_GOALS: "@savvy_savings_goals",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
