import { View, Text } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Tasarimda yer almiyor ama mevcut, gercek veriye dayali oneri karti —
// kaldirmak yerine korunuyor.
function getStudyTip(mastery, q, studyCount) {
  if (q === 0) return { icon: "play", text: "Bu konuda henüz soru çözmedin. İlk adımı at!", colorKey: "accent" };
  if (mastery < 0.4) return { icon: "alert", text: "Bu konu zayıf alanın. Tekrar çalışıp soru çözmeye odaklan.", colorKey: "warn" };
  if (mastery < 0.7) return { icon: "target", text: "Orta seviyedesin. Düzenli tekrar ile ustalaş.", colorKey: "muted" };
  if (studyCount < 3) return { icon: "refresh", text: "Başarı oranın iyi ama daha fazla tekrar gerekli.", colorKey: "muted" };
  return { icon: "star", text: "Bu konuda güçlüsün! Arada tekrar ederek seviyeni koru.", colorKey: "success" };
}

export function TopicStudyTip({ mastery, q, studyCount, color }) {
  const C = useC();
  const tip = getStudyTip(mastery, q, studyCount);
  const tipColor = C[tip.colorKey] || color;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: STEP.s2,
        backgroundColor: tipColor + "12",
        borderRadius: SHAPE.cardTight,
        padding: STEP.s3,
        marginTop: STEP.s3,
        borderWidth: 1,
        borderColor: tipColor + "30",
      }}
    >
      <Icon name={tip.icon} size={18} color={tipColor} sw={2} />
      <Text style={[TYPOGRAPHY.caption, { color: C.text, flex: 1 }]}>{tip.text}</Text>
    </View>
  );
}
