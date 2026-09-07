import { View, Text, Pressable } from "react-native";

import { Icon } from "../../../components/design";
import { TYPOGRAPHY } from "../../../themes/tokens";
import { formatTimerDuration } from "../../../domain/study/studyTimerModel";

export function StudyTimerControls({
  C,
  hasSubject,
  isPomodoro,
  phaseColor,
  running,
  styles,
  totalFocusSeconds,
  onSkip,
  onToggle,
}) {
  return (
    <View style={styles.controls}>
      {isPomodoro && (
        <Pressable onPress={onSkip} accessibilityLabel="Fazı Atla" accessibilityRole="button" style={styles.sideBtn}>
          <Icon name="chevR" size={20} color={C.muted} />
        </Pressable>
      )}
      <Pressable
        onPress={hasSubject ? onToggle : undefined}
        accessibilityLabel={running ? "Duraklat" : "Başlat"}
        accessibilityRole="button"
        style={[styles.mainBtn, { backgroundColor: hasSubject ? phaseColor : C.border }]}
      >
        <Icon name={running ? "pause" : "play"} size={28} color={hasSubject ? C.bg : C.muted} />
      </Pressable>
      {isPomodoro && (
        <View style={styles.sideBtn}>
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.muted }}>
            {formatTimerDuration(totalFocusSeconds)}
          </Text>
        </View>
      )}
    </View>
  );
}
