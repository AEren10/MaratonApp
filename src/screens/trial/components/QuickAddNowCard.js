import { Text, View, StyleSheet } from "react-native";

import { Button } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

// ŞİMDİ satırı: rotanın sıradaki durağı, ya da (rota/durak yoksa) serbest
// çalışma başlatma daveti — tasarım notu: "Bugün durak yoksa ŞİMDİ satırı
// 'Serbest çalışma başlat' olur."
export function QuickAddNowCard({ C, nextAction, onStart }) {
  const title = nextAction ? nextAction.title : "Serbest çalışma başlat";
  const subtitle = nextAction
    ? `Bugünün sıradaki durağı${nextAction.minutes ? ` · ${nextAction.minutes} dk` : ""}`
    : "Rotan bugün için durak önermiyor";

  return (
    <View style={[styles.card, { backgroundColor: C.brandTint, borderColor: C.accent }]}>
      <View style={[styles.dot, { backgroundColor: C.accent }]} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[TYPOGRAPHY.topicName, { color: C.text }]} numberOfLines={2}>{title}</Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 5 }]}>{subtitle}</Text>
      </View>
      <Button size="md" onPress={onStart} accessibilityLabel={`Başla: ${title}`}>
        Başla
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2,
    padding: STEP.s2 + 1, borderRadius: SHAPE.card, borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 1 },
});
