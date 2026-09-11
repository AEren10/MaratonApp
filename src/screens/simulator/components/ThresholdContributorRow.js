import { View, Text } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { LockedValue } from "../../../components/design/LockedValue";

export function ThresholdContributorRow({ item, locked }) {
  const C = useC();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: STEP.s2,
        padding: STEP.s2,
        borderRadius: SHAPE.panel,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.elev,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text }} numberOfLines={1}>{item.topic}</Text>
        <Text style={{ ...TYPOGRAPHY.meta, color: C.text3, marginTop: 4 }} numberOfLines={1}>{item.subjectLabel}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <LockedValue value={`+${item.netGain.toFixed(2)}`} locked={locked} variant="captionMedium" showLock={locked} style={{ color: C.green }} />
        <Text style={{ ...TYPOGRAPHY.micro, color: C.text3, marginTop: 3 }}>net katkı</Text>
      </View>
    </View>
  );
}
