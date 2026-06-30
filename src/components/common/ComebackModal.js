import { memo } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Icon, Button } from "../design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";

const MESSAGES = [
  { min: 2, max: 3, emoji: "👋", title: "Hoş Geldin!", sub: "Seni özledik! Hadi kaldığın yerden devam et." },
  { min: 4, max: 6, emoji: "💪", title: "Geri Döndün!", sub: "Birkaç gündür yoktun ama sorun değil, şimdi başlıyoruz!" },
  { min: 7, max: 13, emoji: "🔥", title: "Bir Hafta Oldu!", sub: "Ama bugün yeni bir başlangıç. Hedefine odaklan!" },
  { min: 14, max: 999, emoji: "🚀", title: "Uzun Zamandır Buralarda Değildin!", sub: "Önemli olan geri dönmen. Bonus XP seninle!" },
];

function pickMessage(daysAway) {
  return MESSAGES.find((m) => daysAway >= m.min && daysAway <= m.max) || MESSAGES[0];
}

export const ComebackModal = memo(function ComebackModal({ visible, daysAway, xpBonus, onDismiss }) {
  const C = useC();
  if (!visible || !daysAway) return null;
  const msg = pickMessage(daysAway);

  const handleClaim = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDismiss();
  };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={s.overlay}>
        <Animated.View entering={FadeIn.duration(300)} style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Animated.Text entering={ZoomIn.delay(200).springify()} style={s.emoji}>
            {msg.emoji}
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(300)} style={[s.title, { color: C.text }]}>
            {msg.title}
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(400)} style={[s.sub, { color: C.sec }]}>
            {msg.sub}
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(500)} style={[s.bonusRow, { backgroundColor: C.accent + "14", borderColor: C.accent + "30" }]}>
            <Icon name="zap" size={20} color={C.accent} />
            <Text style={[s.bonusText, { color: C.accent }]}>+{xpBonus} XP Bonus</Text>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(550)} style={[s.daysLabel, { color: C.muted }]}>
            {daysAway} gündür gelmemiştin
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(650)} style={{ width: "100%" }}>
            <Button onPress={handleClaim} icon="zap" fullWidth>Bonusu Al & Başla</Button>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
});

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center", justifyContent: "center", padding: 28,
  },
  card: {
    width: "100%", borderRadius: 28, padding: 32,
    alignItems: "center", borderWidth: 1,
  },
  emoji: { fontSize: 56, marginBottom: 8 },
  title: { ...TYPOGRAPHY.heading, fontSize: 26, textAlign: "center", marginTop: 4 },
  sub: { ...TYPOGRAPHY.bodyMedium, textAlign: "center", marginTop: 8, lineHeight: 22 },
  bonusRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: RADIUS.pill, borderWidth: 1, marginTop: 24,
  },
  bonusText: { ...TYPOGRAPHY.statSmall, fontSize: 18 },
  daysLabel: { ...TYPOGRAPHY.caption, marginTop: 12 },
});
