import { View, Text, Pressable } from "react-native";

import { Icon } from "../../../components/design";
import { TYPOGRAPHY } from "../../../themes/tokens";

export function StudyTimerHeader({ C, hasSubject, onBack, onHistory, styles, subject }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
        <Icon name="arrowL" size={22} color={C.text} />
      </Pressable>
      <View style={styles.subjectBadge}>
        <View style={[styles.dot, { backgroundColor: subject.color }]} />
        <Text style={[TYPOGRAPHY.captionMedium, { color: hasSubject ? subject.color : C.sec }]}>
          {hasSubject ? (subject.label || subject.name) : "Serbest Çalışma"}
        </Text>
      </View>
      <Pressable onPress={onHistory} hitSlop={12} accessibilityLabel="Geçmiş" accessibilityRole="button">
        <Icon name="clock" size={22} color={C.muted} />
      </Pressable>
    </View>
  );
}
