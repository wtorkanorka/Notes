import type { Note } from "@/types/note";
import { Directory, File, Paths } from "expo-file-system";

const notesDir = new Directory(Paths.document, "notes");
const indexFile = new File(notesDir, "index.json");

async function ensureDir(): Promise<void> {
  if (!notesDir.exists) {
    notesDir.create();
  }
}

async function getIndex(): Promise<string[]> {
  try {
    if (!indexFile.exists) return [];
    const content = await indexFile.text();
    const data = JSON.parse(content);
    if (Array.isArray(data)) return data;
    return [];
  } catch {
    return [];
  }
}

async function setIndex(ids: string[]): Promise<void> {
  await ensureDir();
  await indexFile.write(JSON.stringify(ids));
}

function noteFile(id: string): File {
  return new File(notesDir, `${id}.json`);
}

export async function getAllNotes(): Promise<Note[]> {
  const ids = await getIndex();
  const notes: Note[] = [];
  for (const id of ids) {
    try {
      const file = noteFile(id);
      if (!file.exists) continue;
      const content = await file.text();
      notes.push(JSON.parse(content));
    } catch {
      // file might be missing, skip
    }
  }
  notes.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
  return notes;
}

export async function getNoteById(id: string): Promise<Note | null> {
  try {
    const file = noteFile(id);
    if (!file.exists) return null;
    const content = await file.text();
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function createNote(note: Note): Promise<void> {
  await ensureDir();
  const file = noteFile(note.id);
  await file.write(JSON.stringify(note));
  const ids = await getIndex();
  if (!ids.includes(note.id)) {
    ids.push(note.id);
    await setIndex(ids);
  }
}

export async function updateNote(note: Note): Promise<void> {
  await ensureDir();
  const file = noteFile(note.id);
  await file.write(JSON.stringify(note));
}

export async function deleteNote(id: string): Promise<void> {
  try {
    const file = noteFile(id);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // ignore
  }
  const ids = await getIndex();
  const filtered = ids.filter((i) => i !== id);
  await setIndex(filtered);
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
  return getIndex();
}

export async function importNotes(notes: Note[]): Promise<void> {
  await ensureDir();
  const ids: string[] = [];
  for (const note of notes) {
    const file = noteFile(note.id);
    await file.write(JSON.stringify(note));
    ids.push(note.id);
  }
  await setIndex(ids);
}

export async function clearAllNotes(): Promise<void> {
  const ids = await getIndex();
  for (const id of ids) {
    try {
      const file = noteFile(id);
      if (file.exists) {
        file.delete();
      }
    } catch {
      // ignore
    }
  }
  await setIndex([]);
}
