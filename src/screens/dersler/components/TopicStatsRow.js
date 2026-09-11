import { View } from "react-native";
import { Card, StatBlock } from "../../../components/design";
import { STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Uc notr istatistik karti — ders rengi degil, govde metin rengi kullanilir:
// bunlar bir "ders" degil bir sayac (cozulen soru / sure / defter).
export function TopicStatsRow({ solved, durationLabel, notebookCount }) {
  const C = useC();
  return (
    <View style={{ flexDirection: "row", gap: STEP.s2, marginTop: STEP.s3 }}>
      <Card tone="surface" radius="card" style={{ flex: 1 }}>
        <StatBlock label="ÇÖZÜLEN" value={solved} size="value" color={C.text} />
      </Card>
      <Card tone="surface" radius="card" style={{ flex: 1 }}>
        <StatBlock label="SÜRE" value={durationLabel} size="value" color={C.text} />
      </Card>
      <Card tone="surface" radius="card" style={{ flex: 1 }}>
        <StatBlock label="DEFTER" value={notebookCount} size="value" color={C.text} />
      </Card>
    </View>
  );
}
