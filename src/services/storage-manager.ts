import type { Note, StorageType } from "@/types/note";
import * as fileStorage from "./file-storage";
import * as sqliteStorage from "./sqlite-storage";
import { getStorageType } from "./storage-config";

function getStorage(type: StorageType) {
  return type === "sqlite" ? sqliteStorage : fileStorage;
}

export async function getAllNotes(type?: StorageType): Promise<Note[]> {
  const storageType = type ?? (await getStorageType());
  return getStorage(storageType).getAllNotes();
}

export async function getNoteById(
  id: string,
  type?: StorageType,
): Promise<Note | null> {
  const storageType = type ?? (await getStorageType());
  return getStorage(storageType).getNoteById(id);
}

export async function createNote(
  note: Note,
  type?: StorageType,
): Promise<void> {
  const storageType = type ?? (await getStorageType());
  return getStorage(storageType).createNote(note);
}

export async function updateNote(
  note: Note,
  type?: StorageType,
): Promise<void> {
  const storageType = type ?? (await getStorageType());
  return getStorage(storageType).updateNote(note);
}

export async function deleteNote(
  id: string,
  type?: StorageType,
): Promise<void> {
  const storageType = type ?? (await getStorageType());
  return getStorage(storageType).deleteNote(id);
}

export async function searchNotes(
  query: string,
  type?: StorageType,
): Promise<Note[]> {
  const storageType = type ?? (await getStorageType());
  return getStorage(storageType).searchNotes(query);
}

/**
 * Sync data from source storage to destination storage.
 * Reads all notes from source, clears destination, and imports.
 */
export async function syncStorages(
  sourceType: StorageType,
  destType: StorageType,
): Promise<void> {
  const source = getStorage(sourceType);
  const dest = getStorage(destType);

  const allNotes = await source.getAllNotes();
  await dest.clearAllNotes();
  await dest.importNotes(allNotes);
}
