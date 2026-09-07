import { View, Text, Pressable } from "react-native";

import * as H from "../../../lib/haptics";

const MOODS = [
  { key: "good", emoji: "😄", label: "İyi" },
  { key: "okay", emoji: "😐", label: "Orta" },
  { key: "bad", emoji: "😞", label: "Kötü" },
];

export function TrialEntryMoodSelector({ C, styles, value, onChange }) {
  return (
    <View style={styles.moodWrap}>
      <Text style={styles.moodTitle}>Nasıl hissettin? (opsiyonel)</Text>
      <View style={styles.moodRow}>
        {MOODS.map((mood) => {
          const active = value === mood.key;
          return (
            <Pressable
              key={mood.key}
              accessibilityRole="radio"
              accessibilityLabel={`Ruh hali: ${mood.label}`}
              accessibilityState={{ selected: active }}
              onPress={() => {
                H.select();
                onChange(active ? null : mood.key);
              }}
              style={[styles.moodBtn, active && styles.moodBtnActive]}
            >
              <Text style={{ fontSize: 24 }}>{mood.emoji}</Text>
              <Text style={[styles.moodLabel, active && { color: C.accent }]}>{mood.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
