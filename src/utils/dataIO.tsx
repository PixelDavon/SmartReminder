// src/utils/dataIO.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy'; // fallback if File/Paths unavailable
import * as Sharing from 'expo-sharing';

const STORAGE_KEY = 'smartReminder:v1';

export async function exportDataToJSON(): Promise<string | null> {
  try {
    const raw =
      (await AsyncStorage.getItem(STORAGE_KEY)) ??
      JSON.stringify({ tasks: [], goals: [], reminders: [] }, null, 2);
    const filename = `smartreminder-backup-${Date.now()}.json`;

    // Primary attempt: modern File/Paths API
    try {
      const dir = (Paths as any).document ?? (Paths as any).cache;
      if (!dir) throw new Error('Paths.document/cache not available');
      const file = new File(dir, filename);

      // Attempt to create if available (may throw if exists) — ignore creation errors
      try {
        if (typeof (file as any).create === 'function') {
          (file as any).create?.();
        }
      } catch {
        // ignore
      }

      // Write the file (file.write may return void or Promise)
      if (typeof (file as any).write === 'function') {
        const maybe = (file as any).write(raw);
        // Instead of `instanceof Promise`, use a "thenable" check which is TS-safe
        if (maybe && typeof (maybe as any).then === 'function') {
          await maybe;
        }
      } else if (typeof (file as any).write === 'undefined' && typeof (file as any).text === 'function') {
        // unlikely, but try alternative write APIs
        await (file as any).write(raw);
      } else {
        throw new Error('File.write not available');
      }

      const uri = (file as any).uri ?? (file as any).path ?? null;
      if (!uri) throw new Error('No file URI from File API');

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
      return uri;
    } catch (err) {
      // fallback to legacy API (deprecated but available)
      const fileUri = `${FileSystemLegacy.documentDirectory ?? ''}${filename}`;
      await FileSystemLegacy.writeAsStringAsync(fileUri, raw, {
        encoding: FileSystemLegacy.EncodingType.UTF8,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
      return fileUri;
    }
  } catch (err) {
    console.warn('exportDataToJSON failed:', err);
    return null;
  }
}

export async function importDataFromJSON(jsonText: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON');
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return true;
  } catch (err) {
    console.warn('importDataFromJSON failed:', err);
    return false;
  }
}
