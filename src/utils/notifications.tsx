// src/utils/notifications.ts
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Initialize notification permissions and Android channel.
 * Call once from app start (e.g. AppProvider effect).
 */
export async function initNotifications() {
  try {
    if (!Device.isDevice) {
      console.warn("Notifications: running on simulator — some features may not work.");
      // still continue, will request permission but many features require a real device
    }

    const existing = await Notifications.getPermissionsAsync();
    let finalStatus = existing.status;

    if (finalStatus !== "granted") {
      const asked = await Notifications.requestPermissionsAsync();
      finalStatus = asked.status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notifications permission not granted.");
      return;
    }

    // New handler properties: show banner/list etc.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // On Android create a channel with sound/importance
    if (Platform.OS === "android") {
      try {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          sound: "default",
        });
      } catch (e) {
        // Some SDK/version combos may not support custom sound name; ignore non-fatal error
        console.warn("Could not set Android notification channel:", e);
      }
    }
  } catch (err) {
    console.warn("initNotifications error:", err);
  }
}

/**
 * Schedule a reminder.
 * - dateTimeISO: ISO string for the time (local)
 * - repeat: 'none' | 'daily' | 'weekly'
 *
 * Returns the scheduled notification id (string) or null on failure.
 */
export async function scheduleReminder(
  title: string,
  body: string,
  dateTimeISO: string,
  repeat: "none" | "daily" | "weekly" = "none"
): Promise<string | null> {
  try {
    const triggerDate = new Date(dateTimeISO);
    if (isNaN(triggerDate.getTime())) {
      console.warn("scheduleReminder: invalid date:", dateTimeISO);
      return null;
    }

    // Build trigger. TypeScript defs for expo-notifications are strict, so cast to any where necessary.
    let trigger: Notifications.NotificationTriggerInput;

    if (repeat === "none") {
      // passing a Date is acceptable at runtime; cast to NotificationTriggerInput to placate TS
      trigger = (triggerDate as unknown) as Notifications.NotificationTriggerInput;
    } else if (repeat === "daily") {
      // Calendar trigger repeating every day at hour/minute
      trigger = ({
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
        repeats: true,
      } as unknown) as Notifications.NotificationTriggerInput;
    } else {
      // weekly: ask for weekday + hour/minute. Note: weekday numbering can differ by platform;
      // we attempt a reasonable mapping: JS getDay(): 0 (Sun) .. 6 (Sat). CalendarTriggerInput weekday expects 1-7 (Sun-Sat) on iOS/Android commonly
      const jsDay = triggerDate.getDay(); // 0..6
      const weekday = ((jsDay + 1) % 7) + 1; // maps 0..6 -> 1..7 (best-effort)
      trigger = ({
        weekday,
        hour: triggerDate.getHours(),
        minute: triggerDate.getMinutes(),
        repeats: true,
      } as unknown) as Notifications.NotificationTriggerInput;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        // request default sound; platform behavior will use channel on Android
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger,
    });

    return id ?? null;
  } catch (err) {
    console.warn("scheduleReminder error:", err);
    return null;
  }
}

/**
 * Cancel a scheduled notification by id
 */
export async function cancelNotification(notificationId?: string | null) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.warn("cancelNotification error:", err);
  }
}
