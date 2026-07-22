import type { StorageType } from "@/types/note";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_TYPE_KEY = "@notes_storage_type";

export async function getStorageType(): Promise<StorageType> {
  const value = await AsyncStorage.getItem(STORAGE_TYPE_KEY);
  if (value === "sqlite" || value === "files") {
    return value;
  }
  return "sqlite"; // default
}

export async function setStorageType(type: StorageType): Promise<void> {
  await AsyncStorage.setItem(STORAGE_TYPE_KEY, type);
}
