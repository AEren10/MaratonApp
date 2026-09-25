import { View, Text, Linking, Platform, StyleSheet } from "react-native";
import { Card } from "../../../../components/design/Card";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../../themes/tokens";
import { Press } from "../../../../components/design/Press";

// "SINAV YERİ" karti — Sınav günü planında girilen yer ve salon.
// Tasarimdaki "Kapılar 09:15'te kapanıyor" satiri CIZILMIYOR: kapi saati
// icin kaynak yok (plan ekrani yalniz cikis saatini soruyor).
function openDirections(venue) {
  const q = encodeURIComponent(venue);
  const url = Platform.OS === "ios" ? `maps:0,0?q=${q}` : `geo:0,0?q=${q}`;
  Linking.openURL(url).catch(() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => {}));
}

export function HomeHeroExamDayVenue({ venue, place }) {
  const C = useC();
  if (!venue) return null;
  return (
    <Card tone="surface" radius="sheet" style={{ borderColor: C.elev }}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>SINAV YERİ</Text>
      <Text style={[TYPOGRAPHY.topicName, s.venue, { color: C.text }]}>{venue}</Text>
      {place ? (
        <View style={s.row}>
          <Press haptic="none"
            onPress={() => openDirections(place)}
            hitSlop={8}
            accessibilityRole="link"
            accessibilityLabel="Yol tarifi"
            style={s.link}
          >
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.accentBright }]}>Yol tarifi</Text>
          </Press>
        </View>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  venue: { fontSize: 19, lineHeight: 26, marginTop: STEP.s1 + 2 },
  row: { flexDirection: "row", justifyContent: "flex-end", marginTop: STEP.s1 },
  link: { minHeight: CONTROL.tapMin, justifyContent: "center" },
});
