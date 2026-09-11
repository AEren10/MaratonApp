import { View, Text } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER } from "../../../themes/tokens";

// Tasarimda tikanabilir bir "Seviye" ekrani var ama o ayri bir gorev —
// PROFIL_STACK'te henuz yok. Satir bu yuzden salt bilgi amacli, gezinme
// hedefi UYDURULMADI.
export function LevelRow({ level, xpInLevel, xpForNext }) {
  const C = useC();
  const pct = xpForNext > 0 ? Math.min(1, xpInLevel / xpForNext) : 0;

  return (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: STEP.s2,
      marginHorizontal: GUTTER, marginTop: STEP.s3,
      paddingTop: STEP.s2 + 2, borderTopWidth: 1, borderTopColor: C.line,
    }}>
      <Text style={{ fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 2, color: C.text3 }}>
        {`SEVİYE ${level ?? "–"}`}
      </Text>
      <View style={{ flex: 1, height: 5, borderRadius: 2, backgroundColor: C.track, overflow: "hidden" }}>
        <View style={{ width: `${pct * 100}%`, height: "100%", borderRadius: 2, backgroundColor: C.accent }} />
      </View>
      <Text style={{ fontFamily: "Archivo_500", fontSize: 12, color: C.text2, fontVariant: ["tabular-nums"] }}>
        {`${xpInLevel ?? 0} / ${xpForNext ?? 0} XP`}
      </Text>
    </View>
  );
}
