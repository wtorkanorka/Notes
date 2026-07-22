import type { Note } from "@/types/note";
import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("notes.db");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }
  return db;
}

export async function getAllNotes(): Promise<Note[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<Note>(
    "SELECT * FROM notes ORDER BY updated_at DESC",
  );
  return rows;
}

export async function getNoteById(id: string): Promise<Note | null> {
  const database = await getDb();
  const row = await database.getFirstAsync<Note>(
    "SELECT * FROM notes WHERE id = ?",
    id,
  );
  return row ?? null;
}

export async function createNote(note: Note): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    "INSERT INTO notes (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    note.id,
    note.title,
    note.content,
    note.created_at,
    note.updated_at,
  );
}

export async function updateNote(note: Note): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    "UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?",
    note.title,
    note.content,
    note.updated_at,
    note.id,
  );
}

export async function deleteNote(id: string): Promise<void> {
  const database = await getDb();
  await database.runAsync("DELETE FROM notes WHERE id = ?", id);
}

export async function searchNotes(query: string): Promise<Note[]> {
  const allNotes = await getAllNotes();
  const lowerQuery = query.toLowerCase();
  return allNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery),
  );
}

export async function getAllNoteIds(): Promise<string[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<{ id: string }>(
    "SELECT id FROM notes",
  );
  return rows.map((r) => r.id);
}

export async function importNotes(notes: Note[]): Promise<void> {
  const database = await getDb();
  for (const note of notes) {
    await database.runAsync(
      "INSERT OR REPLACE INTO notes (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      note.id,
      note.title,
      note.content,
      note.created_at,
      note.updated_at,
    );
  }
}

export async function clearAllNotes(): Promise<void> {
  const database = await getDb();
  await database.execAsync("DELETE FROM notes");
}
