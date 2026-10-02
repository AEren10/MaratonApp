import { StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "../design/BottomSheet";
import { Press } from "../design/Press";
import { StoryShareBlock } from "../share/StoryShareBlock";
import { useC } from "../../contexts/ThemeContext";
import { STORY_MOMENT } from "../../domain/share/storySticker";
import { SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";

// SERI DONUM NOKTASI (7/14/30/60/100/365). Eskiden XP rozeti, kivilcim
// patlamasi ve "Harika!" vardi; tasarim kurali: konfeti ve rozet yok.
// Artik buyuk sayi + tek cumle + paylasim (seri Story karti one gelir).
const LINES = {
  7: "Bir hafta, her gün. Ritim oturdu.",
  14: "İki hafta aralıksız. Bu artık bir alışkanlık.",
  30: "Bir ay. Çoğu kişi buraya gelmeden bırakır.",
  60: "İki ay, her gün. Sınav günü bu ritmi hatırlayacak.",
  100: "Yüz gün. Bunu sen yaptın.",
  365: "Bir yıl, her gün.",
};

export default function StreakMilestoneModal({ visible, milestone, onDismiss }) {
  const C = useC();
  if (!milestone) return null;
  return (
    <BottomSheet visible={visible} onClose={onDismiss} style={s.sheet}>
      <View style={s.pad}>
        <Text style={[TYPOGRAPHY.label, { color: C.flame }]}>SERİ</Text>
        <View style={s.hero}>
          <Text style={[TYPOGRAPHY.statHero, { color: C.text }]}>{milestone.day}</Text>
          <Text style={[TYPOGRAPHY.statSideUnit, s.unit, { color: C.text2 }]}>gün üst üste</Text>
        </View>
        <Text style={[TYPOGRAPHY.body, { color: C.text2 }]}>{LINES[milestone.day] || "Her gün, aralıksız."}</Text>
      </View>
      <StoryShareBlock moment={STORY_MOMENT.STREAK} />
      <Press haptic="none" onPress={onDismiss} accessibilityRole="button" style={s.close}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text2 }]}>Kapat</Text>
      </Press>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  sheet: { borderRadius: SHAPE.sheet, overflow: "hidden" },
  pad: { padding: STEP.s3, paddingBottom: STEP.s2, gap: STEP.s1 },
  hero: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s1 },
  unit: { paddingBottom: STEP.s2 },
  close: { minHeight: 48, alignItems: "center", justifyContent: "center" },
});
