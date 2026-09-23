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
  const badgeBg = running && subject?.color ? subject.color + "18" : C.surface;
  const badgeBorder = running && subject?.color ? subject.color + "30" : C.line;

  const label = running && hasSubject
    ? `${subject.label} · ${topicSubtitle}`
    : isPomodoro
      ? `${mode?.focus || 25} dk odak · ${mode?.break || 5} dk mola`
      : (hasSubject ? topicSubtitle : "ders seçilmedi");

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text
        style={[
          TYPOGRAPHY.heroNumber,
          { color: C.text, fontSize: 66, lineHeight: 70, letterSpacing: -2.5 },
        ]}
        allowFontScaling={false}
      >
        {formatTimerDuration(displaySeconds ?? elapsed)}
      </Text>
      <View
        style={{
          marginTop: 10,
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 999,
          backgroundColor: badgeBg,
          borderWidth: 1,
          borderColor: badgeBorder,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          maxWidth: 240,
        }}
      >
        <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: badgeColor }} />
        <Text
          style={[TYPOGRAPHY.captionMedium, { color: badgeColor, fontSize: 12 }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}
