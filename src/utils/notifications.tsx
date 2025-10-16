// src/utils/notifications.tsx
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Notification handler - new fields (SDK 54+)
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

export async function initializeNotifications(): Promise<void> {
  try {
    const cur = await Notifications.getPermissionsAsync();
    if ((cur as any).granted !== true && (cur as any).status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }
  } catch (err) {
    console.warn('initializeNotifications failed', err);
  }
}

/**
 * Schedule a one-time or repeated notification.
 * For a single date/time trigger, we accept a Date object.
 * Returns notificationId string or null on failure.
 */
export async function scheduleReminder(title: string, body: string, date: Date, repeatDaily = false): Promise<string | null> {
  try {
    const now = Date.now();
    const targetTs = date.getTime();
    // if target is in past, schedule a small delay in future (1s)
    const triggerDate = targetTs <= now ? new Date(now + 1000) : date;

    let trigger: any;
    if (repeatDaily) {
      trigger = {
        hour: date.getHours(),
        minute: date.getMinutes(),
        repeats: true,
      };
    } else {
      // Use new trigger format for SDK 54+
      trigger = {
        type: 'date',
        date: triggerDate,
      };
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger,
    });
    return id ?? null;
  } catch (err) {
    console.warn('scheduleReminder failed', err);
    return null;
  }
}

export async function cancelReminder(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.warn('cancelReminder failed', err);
  }
}
