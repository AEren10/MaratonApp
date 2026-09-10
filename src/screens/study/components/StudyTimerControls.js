import { View, Text, Pressable } from "react-native";

import { Button } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";

// Tasarım: birincil "Duraklat/Başlat" (outline), altında ince metin linkleri.
export function StudyTimerControls({
  C,
  hasSubject,
  isPomodoro,
  running,
  onFinish,
  onSkip,
  onToggle,
}) {
  return (
    <View style={{ width: "100%", paddingHorizontal: GUTTER, marginTop: STEP.s4 }}>
      <Button
        onPress={onToggle}
        disabled={!hasSubject}
        variant="outline"
        size="lg"
        fullWidth
        accessibilityLabel={running ? "Duraklat" : "Başlat"}
      >
        {running ? "Duraklat" : "Başlat"}
      </Button>

      <Pressable
        onPress={onFinish}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Durağı bitir"
        style={{ height: CONTROL.buttonTertiary, alignItems: "center", justifyContent: "center", marginTop: STEP.s1 }}
      >
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text3 }]}>Durağı bitir</Text>
      </Pressable>

      {isPomodoro && (
        <Pressable
          onPress={onSkip}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Fazı atla"
          style={{ height: CONTROL.buttonTertiary, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={[TYPOGRAPHY.caption, { color: C.text4 }]}>Fazı atla</Text>
        </Pressable>
      )}
    </View>
  );
}
