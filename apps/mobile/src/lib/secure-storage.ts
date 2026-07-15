import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const CHUNK_SIZE = 1800;
const META_SUFFIX = "__meta";
const memoryStorage = new Map<string, string>();

const chunkKey = (key: string, index: number) => `${key}__chunk_${index}`;

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

async function readChunkCount(key: string): Promise<number> {
  const raw = await SecureStore.getItemAsync(`${key}${META_SUFFIX}`);
  const count = Number(raw ?? 0);
  return Number.isInteger(count) && count > 0 ? count : 0;
}

async function clearChunks(key: string, count?: number): Promise<void> {
  const chunkCount = count ?? await readChunkCount(key);
  await Promise.all([
    SecureStore.deleteItemAsync(`${key}${META_SUFFIX}`),
    ...Array.from({ length: chunkCount }, (_, index) => SecureStore.deleteItemAsync(chunkKey(key, index))),
  ]);
}

const nativeStorage = {
  async getItem(key: string): Promise<string | null> {
    const count = await readChunkCount(key);
    if (!count) return SecureStore.getItemAsync(key);

    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(chunkKey(key, index))),
    );
    if (chunks.some((value) => value === null)) return null;
    return chunks.join("");
  },
  async setItem(key: string, value: string): Promise<void> {
    const previousCount = await readChunkCount(key);
    await clearChunks(key, previousCount);
    await SecureStore.deleteItemAsync(key);

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "gs")) ?? [];
    await Promise.all(chunks.map((chunk, index) => SecureStore.setItemAsync(chunkKey(key, index), chunk)));
    await SecureStore.setItemAsync(`${key}${META_SUFFIX}`, String(chunks.length));
  },
  async removeItem(key: string): Promise<void> {
    await clearChunks(key);
    await SecureStore.deleteItemAsync(key);
  },
};

export const secureStorage = Platform.OS === "web" ? webStorage : nativeStorage;
