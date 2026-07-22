import { EmptyState } from "@/components/empty-state";
import { FAB } from "@/components/fab";
import { NoteCard } from "@/components/note-card";
import { SearchBar } from "@/components/search-bar";
import { SettingsModal } from "@/components/settings-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import * as storage from "@/services/storage-manager";
import type { Note } from "@/types/note";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsVisible, setSettingsVisible] = useState(false);

  const loadNotes = useCallback(async () => {
    try {
      const allNotes = await storage.getAllNotes();
      setNotes(allNotes);
      if (searchQuery) {
        const results = await storage.searchNotes(searchQuery);
        setFilteredNotes(results);
      } else {
        setFilteredNotes(allNotes);
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  }, [searchQuery]);

  // Reload notes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes]),
  );

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setFilteredNotes(notes);
        return;
      }
      try {
        const results = await storage.searchNotes(query);
        setFilteredNotes(results);
      } catch (error) {
        console.error("Search failed:", error);
      }
    },
    [notes],
  );

  const handleDeleteNote = useCallback(async (id: string) => {
    try {
      await storage.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setFilteredNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  }, []);

  const handleNotePress = useCallback(
    (note: Note) => {
      router.push({ pathname: "/create", params: { id: note.id } });
    },
    [router],
  );

  const handleCreate = useCallback(() => {
    router.push({ pathname: "/create" });
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: Note }) => (
      <NoteCard
        note={item}
        onPress={handleNotePress}
        onDelete={handleDeleteNote}
      />
    ),
    [handleNotePress, handleDeleteNote],
  );

  const keyExtractor = useCallback((item: Note) => item.id, []);

  const displayNotes = searchQuery ? filteredNotes : notes;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">Notes</ThemedText>
        <TouchableOpacity
          onPress={() => setSettingsVisible(true)}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <SearchBar onSearch={handleSearch} />

      {/* Notes list */}
      {displayNotes.length === 0 ? (
        <EmptyState
          icon={searchQuery ? "search-outline" : "document-text-outline"}
          title={searchQuery ? "No results found" : "No notes yet"}
          subtitle={
            searchQuery
              ? "Try a different search term"
              : "Tap + to create your first note"
          }
        />
      ) : (
        <FlatList
          data={displayNotes}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <FAB onPress={handleCreate} />

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 8,
  },
  settingsButton: {
    padding: 8,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 100,
  },
});
