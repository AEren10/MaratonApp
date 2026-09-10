import { View, Text, Pressable } from "react-native";

import { Card, Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, GUTTER, CONTROL } from "../../../themes/tokens";

function StepBtn({ C, icon, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={icon === "plus" ? "Ekle" : "Çıkar"}
      style={{
        width: CONTROL.buttonTertiary,
        height: CONTROL.buttonTertiary,
        borderRadius: SHAPE.iconBox,
        borderWidth: 1,
        borderColor: C.border,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Icon name={icon} size={14} color={C.text2} sw={2} />
    </Pressable>
  );
}

function Row({ C, label, value, tone, onAdd, onRemove, addDisabled }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s3 }}>
      <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2, flex: 1 }]}>{label}</Text>
      <StepBtn C={C} icon="minus" onPress={onRemove} disabled={value <= 0} />
      <Text style={[TYPOGRAPHY.statMedium, { color: C.text, minWidth: 40, textAlign: "center" }]} allowFontScaling={false}>
        {value}
      </Text>
      <StepBtn C={C} icon="plus" onPress={onAdd} disabled={addDisabled} />
    </View>
  );
}

export function StudyTimerQuestionCounters({
  C,
  correctCount,
  questions,
  onAddCorrect,
  onAddQuestion,
  onRemoveCorrect,
  onRemoveQuestion,
}) {
  return (
    <View style={{ width: "100%", paddingHorizontal: GUTTER, marginTop: STEP.s3, gap: STEP.s2 }}>
      <Card tone="void">
        <Row C={C} label="Çözülen soru" value={questions} onAdd={onAddQuestion} onRemove={onRemoveQuestion} />
      </Card>
      {questions > 0 && (
        <Card tone="void">
          <Row
            C={C}
            label="Doğru sayısı"
            value={correctCount}
            onAdd={onAddCorrect}
            onRemove={onRemoveCorrect}
            addDisabled={correctCount >= questions}
          />
        </Card>
      )}
    </View>
  );
}
