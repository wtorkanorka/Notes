import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import * as storage from "@/services/storage-manager";
import type { Note } from "@/types/note";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateNoteScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing note if editing
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      storage.getNoteById(id).then((note) => {
        if (note) {
          setTitle(note.title);
          setContent(note.content);
        }
      });
    }
  }, [id]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required.");
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();

      if (isEditing && id) {
        // Update existing note
        const updatedNote: Note = {
          id,
          title: title.trim(),
          content: content.trim(),
          created_at: "", // will be fetched from DB to preserve original
          updated_at: now,
        };
        // Fetch original to preserve created_at
        const original = await storage.getNoteById(id);
        if (original) {
          updatedNote.created_at = original.created_at;
        } else {
          updatedNote.created_at = now;
        }
        await storage.updateNote(updatedNote);
      } else {
        // Create new note
        const newNote: Note = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: title.trim(),
          content: content.trim(),
          created_at: now,
          updated_at: now,
        };
        await storage.createNote(newNote);
      }

      router.back();
    } catch (error) {
      console.error("Failed to save note:", error);
      Alert.alert("Error", "Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [id, isEditing, title, content, router]);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>

        <ThemedText type="default" style={styles.headerTitle}>
          {isEditing ? "Edit Note" : "New Note"}
        </ThemedText>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={styles.saveButton}
        >
          <Ionicons
            name={saving ? "hourglass-outline" : "checkmark"}
            size={24}
            color={saving ? theme.textSecondary : "#34C759"}
          />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <KeyboardAvoidingView
        style={styles.form}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <TextInput
          style={[styles.titleInput, { color: theme.text }]}
          placeholder="Title"
          placeholderTextColor={theme.textSecondary}
          value={title}
          onChangeText={setTitle}
          autoFocus={!isEditing}
          returnKeyType="next"
        />

        <View style={styles.divider} />

        <TextInput
          style={[styles.contentInput, { color: theme.text }]}
          placeholder="Start writing..."
          placeholderTextColor={theme.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontWeight: "600",
  },
  saveButton: {
    padding: 8,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: "600",
    lineHeight: 34,
    paddingVertical: 8,
    marginBottom: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ccc",
    marginBottom: 16,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    paddingVertical: 8,
  },
});
