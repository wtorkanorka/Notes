export type StorageType = "sqlite" | "files";

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string; // ISO8601
  updated_at: string; // ISO8601
}
