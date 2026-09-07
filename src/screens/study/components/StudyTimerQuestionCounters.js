import { View, Text, Pressable } from "react-native";

import { TYPOGRAPHY } from "../../../themes/tokens";

function Stepper({ C, tone, value, onAdd, onRemove, styles }) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onRemove} hitSlop={8} style={styles.stepBtn}>
        <Text style={[TYPOGRAPHY.subheading, { color: C.muted }]}>-</Text>
      </Pressable>
      <Text style={[TYPOGRAPHY.statSmall, { color: C.text, minWidth: 40, textAlign: "center" }]}>
        {value}
      </Text>
      <Pressable onPress={onAdd} hitSlop={8} style={styles.stepBtn}>
        <Text style={[TYPOGRAPHY.subheading, { color: tone }]}>+</Text>
      </Pressable>
    </View>
  );
}

export function StudyTimerQuestionCounters({
  C,
  correctCount,
  phaseColor,
  questions,
  styles,
  onAddCorrect,
  onAddQuestion,
  onRemoveCorrect,
  onRemoveQuestion,
}) {
  return (
    <>
      <View style={styles.questionRow}>
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.sec }]}>Çözülen soru</Text>
        <Stepper
          C={C}
          tone={phaseColor}
          value={questions}
          onAdd={onAddQuestion}
          onRemove={onRemoveQuestion}
          styles={styles}
        />
      </View>
      {questions > 0 && (
        <View style={styles.questionRow}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.sec }]}>Doğru sayısı</Text>
          <Stepper
            C={C}
            tone={C.green}
            value={correctCount}
            onAdd={onAddCorrect}
            onRemove={onRemoveCorrect}
            styles={styles}
          />
        </View>
      )}
    </>
  );
}
