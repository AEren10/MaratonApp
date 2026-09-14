import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../contexts/ThemeContext";
import { ERROR_COPY } from "../../constants/stateCopy";
import { SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";

const COPY = ERROR_COPY.offline;

export function offlineStripBody(pending) {
  return pending > 0 ? `${pending} kayıt bağlantı gelince yüklenecek` : COPY.bannerBody;
}

// "Çevrimdışı Kuyruk" ust seridi: sari kenarli yuzey, kare isaret,
// "Çevrimdışısın" + kuyruktaki kayit sayisi. Golge yok.
export function OfflineStrip({ pending, style }) {
  const C = useC();
  return (
    <View style={[s.container, { backgroundColor: C.surface, borderColor: C.warn }, style]}>
      <View style={[s.mark, { backgroundColor: C.warn }]} />
      <View style={s.flex}>
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text }]}>{COPY.bannerTitle}</Text>
        <Text numberOfLines={2} style={[TYPOGRAPHY.micro, s.body, { color: C.text3 }]}>
          {offlineStripBody(pending)}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2 + 1,
    paddingVertical: STEP.s2 + 3,
    paddingHorizontal: STEP.s3 - 2,
    borderRadius: SHAPE.card,
    borderWidth: 1,
  },
  mark: { width: 9, height: 9, borderRadius: SHAPE.chip / 6 },
  flex: { flex: 1, minWidth: 0 },
  body: { marginTop: STEP.s1 / 2 - 1 },
});
