import { View } from "react-native";
import { Card, StatBlock } from "../../../components/design";
import { STEP } from "../../../themes/tokens";

export function TopicStatsRow({ C, solved, durationLabel, notebookCount }) {
  return (
    <View style={{ flexDirection: "row", gap: STEP.s2, marginTop: STEP.s3 }}>
      <Card tone="surface" radius="card" style={{ flex: 1, paddingVertical: STEP.s2, paddingHorizontal: STEP.s2 }}>
        <StatBlock label="ÇÖZÜLEN" value={solved} size="value" color={C.text} />
      </Card>
      <Card tone="surface" radius="card" style={{ flex: 1, paddingVertical: STEP.s2, paddingHorizontal: STEP.s2 }}>
        <StatBlock label="SÜRE" value={durationLabel} size="value" color={C.text} />
      </Card>
      <Card tone="surface" radius="card" style={{ flex: 1, paddingVertical: STEP.s2, paddingHorizontal: STEP.s2 }}>
        <StatBlock label="DEFTER" value={notebookCount} size="value" color={C.text} />
      </Card>
    </View>
  );
}
