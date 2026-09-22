import { View, Text } from "react-native";
import { TYPOGRAPHY } from "../../../themes/tokens";
import { formatTimerDuration } from "../../../domain/study/studyTimerModel";

export function TimerCenterDisplay({
  C,
  displaySeconds,
  elapsed,
  hasSubject,
  isPomodoro,
  mode,
  running,
  subject,
  topicSubtitle,
}) {
  const badgeColor = running && subject?.color ? subject.color : C.text3;
  const badgeBg = running && subject?.color ? subject.color + "18" : "transparent";

  const label = running && hasSubject
    ? `${subject.label} · ${topicSubtitle}`
    : isPomodoro
      ? `${mode?.focus || 25} dk odak · ${mode?.break || 5} dk mola`
      : (hasSubject ? topicSubtitle : "ders seçilmedi");

  return (
    <>
      <Text
        style={[
          TYPOGRAPHY.heroNumber,
          { fontSize: 62, lineHeight: 66, letterSpacing: -2.0, color: C.text },
        ]}
        allowFontScaling={false}
      >
        {formatTimerDuration(displaySeconds ?? elapsed)}
      </Text>
      <View
        style={{
          marginTop: 8,
          paddingHorizontal: 12,
          paddingVertical: 3,
          borderRadius: 999,
          backgroundColor: badgeBg,
        }}
      >
        <Text
          style={[TYPOGRAPHY.captionMedium, { color: badgeColor, fontSize: 12.5 }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </>
  );
}
