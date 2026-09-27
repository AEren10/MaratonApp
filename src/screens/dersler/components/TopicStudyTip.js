import { View, Text } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { alpha } from "../../../themes/palette";

// Tasarimda yer almiyor ama mevcut, gercek veriye dayali oneri karti —
// kaldirmak yerine korunuyor.
function getStudyTip(mastery, q, studyCount) {
  if (q === 0) return { icon: "play", text: "Bu konuda henüz soru çözmedin. İlk adımı at!", colorKey: "accent" };
  if (mastery < 0.4) return { icon: "alert", text: "Bu konu zayıf alanın. Tekrar çalışıp soru çözmeye odaklan.", colorKey: "warn" };
  if (mastery < 0.7) return { icon: "target", text: "Orta seviyedesin. Düzenli tekrar ile ustalaş.", colorKey: "text3" };
  if (studyCount < 3) return { icon: "refresh", text: "Başarı oranın iyi ama daha fazla tekrar gerekli.", colorKey: "text3" };
  return { icon: "star", text: "Bu konuda güçlüsün! Arada tekrar ederek seviyeni koru.", colorKey: "text2" };
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
        backgroundColor: alpha(tipColor, 8),
        borderRadius: SHAPE.cardTight,
        padding: STEP.s3,
        marginTop: STEP.s3,
        borderWidth: 1,
        borderColor: alpha(tipColor, 20),
      }}
    >
      <Icon name={tip.icon} size={18} color={tipColor} sw={1.5} />
      <Text style={[TYPOGRAPHY.caption, { color: C.text, flex: 1 }]}>{tip.text}</Text>
    </View>
  );
}
