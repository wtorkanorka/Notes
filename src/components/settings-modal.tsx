import { useTheme } from "@/hooks/use-theme";
import { getStorageType, setStorageType } from "@/services/storage-config";
import { syncStorages } from "@/services/storage-manager";
import type { StorageType } from "@/types/note";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const theme = useTheme();
  const [currentType, setCurrentType] = useState<StorageType>("sqlite");
  const [loading, setLoading] = useState(false);

  // Load current storage type when modal opens
  useState(() => {
    getStorageType().then(setCurrentType);
  });

  const handleSwitch = async (newType: StorageType) => {
    if (newType === currentType) return;

    setLoading(true);
    try {
      await syncStorages(currentType, newType);
      await setStorageType(newType);
      setCurrentType(newType);
      Alert.alert(
        "Storage Changed",
        `Storage switched to ${
          newType === "sqlite" ? "SQLite" : "Files"
        }. Data has been synchronized.`,
      );
    } catch (error) {
      Alert.alert("Error", "Failed to switch storage type. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <ThemedView type="background" style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <ThemedText type="subtitle">Settings</ThemedText>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Storage type section */}
            <ThemedText
              type="smallBold"
              themeColor="textSecondary"
              style={styles.sectionTitle}
            >
              STORAGE TYPE
            </ThemedText>

            <ThemedView type="backgroundElement" style={styles.card}>
              {/* SQLite option */}
              <View style={styles.option}>
                <View style={styles.optionInfo}>
                  <ThemedText type="default">SQLite</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Local database (default)
                  </ThemedText>
                </View>
                <Switch
                  value={currentType === "sqlite"}
                  onValueChange={() => handleSwitch("sqlite")}
                  disabled={loading || currentType === "sqlite"}
                  trackColor={{ false: "#767577", true: theme.text }}
                  thumbColor={currentType === "sqlite" ? theme.text : "#f4f3f4"}
                />
              </View>

              <View style={styles.divider} />

              {/* Files option */}
              <View style={styles.option}>
                <View style={styles.optionInfo}>
                  <ThemedText type="default">Files</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    JSON files on device
                  </ThemedText>
                </View>
                <Switch
                  value={currentType === "files"}
                  onValueChange={() => handleSwitch("files")}
                  disabled={loading || currentType === "files"}
                  trackColor={{ false: "#767577", true: theme.text }}
                  thumbColor={currentType === "files" ? theme.text : "#f4f3f4"}
                />
              </View>
            </ThemedView>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    width: "100%",
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  closeButton: {
    padding: 4,
  },
  sectionTitle: {
    marginBottom: 8,
    letterSpacing: 1,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  optionInfo: {
    flex: 1,
    gap: 2,
    marginRight: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ccc",
    marginHorizontal: 16,
  },
});
