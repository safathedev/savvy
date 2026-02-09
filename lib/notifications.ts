// Notification functionality for Savvy App

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log("Notifications only work on physical devices");
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#22C55E",
    });
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

/**
 * Schedule daily tip reminder
 */
export async function scheduleDailyReminder(
  hour: number = 9,
  minute: number = 0
): Promise<string | null> {
  try {
    // Cancel existing daily reminders first
    await cancelDailyReminder();

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Good morning! ☀️",
        body: "Your daily saving tip is ready. Open Savvy to learn more!",
        data: { type: "daily_tip" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    return id;
  } catch (error) {
    console.error("Error scheduling daily reminder:", error);
    return null;
  }
}

/**
 * Schedule streak reminder (evening)
 */
export async function scheduleStreakReminder(
  streak: number,
  hour: number = 20,
  minute: number = 0
): Promise<string | null> {
  if (streak === 0) return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Don't break your ${streak} day streak! 🔥`,
        body: "Open Savvy to keep your streak going!",
        data: { type: "streak_reminder" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    return id;
  } catch (error) {
    console.error("Error scheduling streak reminder:", error);
    return null;
  }
}

/**
 * Cancel daily reminder
 */
export async function cancelDailyReminder(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.type === "daily_tip") {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier
      );
    }
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Add notification response listener
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}
