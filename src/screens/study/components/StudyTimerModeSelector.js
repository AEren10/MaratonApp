import { View, Text, Pressable } from "react-native";

import { TYPOGRAPHY, STEP, SHAPE, GUTTER } from "../../../themes/tokens";

// Tasarım: süre seçenekleri tek sıra, büyük sayı + küçük etiket (dk/serbest).
function segmentContent(mode) {
  if (mode.key === "FREE") return { n: "∞", rest: "SERBEST" };
  return { n: String(mode.focus), rest: "DK" };
}

export function StudyTimerModeSelector({ C, modeKey, modes, onChange }) {
  return (
    <View style={{ paddingHorizontal: GUTTER, marginTop: STEP.s2 }}>
      <View
        style={{
          flexDirection: "row",
          gap: 2,
          padding: 4,
          borderRadius: SHAPE.cardTight,
          backgroundColor: C.void,
          borderWidth: 1,
          borderColor: C.line,
        }}
      >
        {modes.map((mode) => {
          const active = mode.key === modeKey;
          const { n, rest } = segmentContent(mode);
          return (
            <Pressable
              key={mode.key}
              onPress={() => onChange(mode.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${n} ${rest.toLowerCase()} modu`}
              style={{
                flex: 1,
                minHeight: CONTROL_HEIGHT,
                borderRadius: SHAPE.iconBox,
                backgroundColor: active ? mode.color + "22" : "transparent",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                paddingVertical: STEP.s1,
              }}
            >
              <Text
                style={[
                  TYPOGRAPHY.topicName,
                  { color: active ? mode.color : C.text3, fontSize: 18, lineHeight: 20 },
                ]}
                allowFontScaling={false}
              >
                {n}
              </Text>
              <Text style={[TYPOGRAPHY.micro, { color: active ? mode.color : C.text4 }]}>
                {rest}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[TYPOGRAPHY.caption, { color: C.text3, textAlign: "center", marginTop: STEP.s1 }]}>
        {modes.find((mode) => mode.key === modeKey)?.desc}
      </Text>
    </View>
  );
}

const CONTROL_HEIGHT = 44;
