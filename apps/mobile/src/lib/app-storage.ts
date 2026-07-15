import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const memoryStorage = new Map<string, string>();

function getBrowserStorage(): Storage | undefined {
  if (Platform.OS !== "web" || typeof window === "undefined") return undefined;

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

const webStorage = {
  async getItem(key: string): Promise<string | null> {
    return getBrowserStorage()?.getItem(key) ?? memoryStorage.get(key) ?? null;
  },
  async setItem(key: string, value: string): Promise<void> {
    const storage = getBrowserStorage();
    if (storage) storage.setItem(key, value);
    else memoryStorage.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    getBrowserStorage()?.removeItem(key);
    memoryStorage.delete(key);
  },
};

export const appStorage = Platform.OS === "web" ? webStorage : AsyncStorage;
