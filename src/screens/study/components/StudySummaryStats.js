import { View, Text } from "react-native";

import { Card, Icon, StatBlock } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Tasarım: hedef ilerleme çubuğu + bugün toplamı, gerçek Redux verisiyle.
export function StudySummaryStats({ C, todaySolved, safeGoal, goalReached, todayMinutes }) {
  const goalPct = Math.min(todaySolved / safeGoal, 1);

  return (
    <Card tone="surface" style={{ width: "100%" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>GÜNLÜK HEDEF</Text>
        <StatBlock
          value={`${todaySolved}/${safeGoal}`}
          unit="soru"
          size="value"
          color={goalReached ? C.green : C.text}
        />
      </View>

      <View style={{ height: 6, borderRadius: 1, backgroundColor: C.track, marginTop: STEP.s2, overflow: "hidden" }}>
        <View style={{ height: 6, borderRadius: 1, width: `${goalPct * 100}%`, backgroundColor: goalReached ? C.green : C.accent }} />
      </View>

      {goalReached ? (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: STEP.s1, marginTop: STEP.s2 }}>
          <Icon name="trophy" size={16} color={C.green} />
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.green }]}>Hedefini tamamladın!</Text>
        </View>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: STEP.s3,
          paddingTop: STEP.s2,
          borderTopWidth: 1,
          borderTopColor: C.line,
        }}
      >
        <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>Bugün toplam</Text>
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>{todayMinutes} dk · {todaySolved} soru</Text>
      </View>
    </Card>
  );
}
