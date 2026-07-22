import { useTheme } from "@/hooks/use-theme";
import type { Note } from "@/types/note";
import { Ionicons } from "@expo/vector-icons";
import { Alert, LayoutAnimation, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface NoteCardProps {
  note: Note;
  onPress: (note: Note) => void;
  onDelete: (id: string) => void;
}

const SWIPE_THRESHOLD = -80;

export function NoteCard({ note, onPress, onDelete }: NoteCardProps) {
  const theme = useTheme();
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(150);
  const itemOpacity = useSharedValue(1);
  const isDeleted = useSharedValue(false);

  const handleDelete = () => {
    Alert.alert(
      "Delete Note",
      `Are you sure you want to delete "${note.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            translateX.value = withSpring(0);
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            "worklet";
            isDeleted.value = true;
            itemHeight.value = withTiming(0, { duration: 300 });
            itemOpacity.value = withTiming(0, { duration: 200 });
            runOnJS(LayoutAnimation.configureNext)(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            runOnJS(onDelete)(note.id);
          },
        },
      ],
    );
  };

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(onPress)(note);
  });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (e.translationX < SWIPE_THRESHOLD && !isDeleted.value) {
        translateX.value = withSpring(-100);
        runOnJS(handleDelete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const composedGesture = Gesture.Simultaneous(tapGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteBackgroundStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < 0 ? withSpring(1) : 0,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    height: itemHeight.value,
    opacity: itemOpacity.value,
    overflow: "hidden",
  }));

  const formattedDate = new Date(note.updated_at).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Animated.View style={cardAnimatedStyle}>
      <ThemedView style={styles.swipeContainer}>
        {/* Red delete background */}
        <Animated.View
          style={[
            styles.deleteBackground,
            deleteBackgroundStyle,
            { backgroundColor: "#FF3B30" },
          ]}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </Animated.View>

        {/* Card content */}
        <GestureDetector gesture={composedGesture}>
          <Animated.View
            style={[
              styles.card,
              animatedStyle,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <ThemedView style={styles.cardContent} type="backgroundElement">
              <ThemedText type="default" style={styles.title} numberOfLines={1}>
                {note.title}
              </ThemedText>
              {note.content ? (
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  numberOfLines={2}
                  style={styles.content}
                >
                  {note.content}
                </ThemedText>
              ) : null}
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.date}
              >
                {formattedDate}
              </ThemedText>
            </ThemedView>
          </Animated.View>
        </GestureDetector>
      </ThemedView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    position: "relative",
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  deleteBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 24,
    borderRadius: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    // minHeight: 130,
  },
  cardContent: {
    gap: 4,
  },
  title: {
    fontWeight: "600",
  },
  content: {
    lineHeight: 20,
  },
  date: {
    marginTop: 4,
  },
});
