import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { useAlert } from "../../../contexts/AlertContext";
import { getMastery } from "../../../lib/mastery";

// Tasarimda yer almiyor ama mevcut, gercek veriye dayali bir ozellik —
// kaldirmak yerine korunuyor (dogruluk orani + soru sayisi hakimiyeti).
export function TopicMasteryRing({ q, acc, color }) {
  const C = useC();
  const showAlert = useAlert();
  const mastery = (acc || 0) / 100;
  const masteryLevel = getMastery({ q: q || 0, acc: acc || 0 });
  const badgeColor = C[masteryLevel.colorKey];

  return (
    <View style={s.wrap}>
      <View style={{ width: 120, height: 120, alignItems: "center", justifyContent: "center" }}>
        <Svg width={120} height={120} style={{ position: "absolute" }}>
          <Circle cx={60} cy={60} r={50} stroke={color + "1A"} strokeWidth={9} fill="none" />
          <Circle
            cx={60}
            cy={60}
            r={50}
            stroke={color}
            strokeWidth={9}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 50}
            strokeDashoffset={2 * Math.PI * 50 * (1 - mastery)}
            transform="rotate(-90 60 60)"
          />
        </Svg>
        <Text style={[TYPOGRAPHY.statMedium, { color: (q || 0) === 0 ? C.muted : C.text }]}>
          {(q || 0) === 0 ? "—" : `%${acc || 0}`}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={[TYPOGRAPHY.caption, { color: C.text2 }]}>
          {(q || 0) === 0 ? "Soru çözdükçe hakimiyetin oluşacak" : "Hakimiyet"}
        </Text>
        {(q || 0) > 0 && (
          <Pressable
            hitSlop={10}
            onPress={() =>
              showAlert(
                "Hakimiyet Nedir?",
                "Hakimiyet, bu konudaki doğru cevap oranını ve çözülen soru sayısını birlikte değerlendirir.\n\n• %80+ → Uzman\n• %60-79 → İyi\n• %40-59 → Orta\n• %40 altı → Zayıf\n\nDaha çok soru çözdükçe hakimiyet seviyeni yukarı taşırsın."
              )
            }
          >
            <Icon name="info" size={15} color={C.muted} />
          </Pressable>
        )}
      </View>
      <View style={[s.badge, { backgroundColor: badgeColor + "1A" }]}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: badgeColor }} />
        <Text style={[TYPOGRAPHY.captionMedium, { color: badgeColor }]}>{masteryLevel.label}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", marginTop: STEP.s4 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: STEP.s1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
});
