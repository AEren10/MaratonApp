import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GUTTER, SHAPE, SHADOW } from "../../../themes/tokens";
import { PendingSection } from "../../../components/common/PendingSection";
import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";

export function PublisherComparisonCard({ C, comparison, onPress }) {
  // Bu kart eskiden hic veri almiyordu: herkese ayni uc yayini gosteriyordu.
  // Karsilastirma en az iki farkli yayindan deneme ister.
  if (!comparison?.ready) {
    return (
      <PendingSection
        label="YAYIN KARŞILAŞTIRMASI"
        title="Karşılaştıracak yayın yok"
        note={comparison?.reason === "tek_yayin"
          ? "Tek yayından deneme girdin. Farklı bir yayından deneme girince ikisini karşılaştırırım."
          : "Deneme girerken yayını da seçersen hangi yayında daha iyi olduğunu buradan görürsün."}
      />
    );
  }

  const publishers = comparison.publishers;

  const cardContent = (
    <>
      <View style={s.cardHeader}>
        <Text style={[s.cardTitle, { color: C.accentBright }]}>YAYIN KARŞILAŞTIRMASI</Text>
        {onPress && <Icon name="chevR" size={14} color={C.text3} />}
      </View>

      <View style={s.list}>
        {publishers.map((p) => (
          <View key={p.name} style={s.row}>
            <Text style={[s.pubName, { color: C.text2 }]}>{p.name}</Text>
            <View style={[s.track, { backgroundColor: C.track }]}>
              <View style={[s.bar, { width: p.percent, backgroundColor: C.accent }]} />
            </View>
            <Text style={[s.netNum, { color: C.text }]}>{String(p.net).replace(".", ",")}</Text>
          </View>
        ))}
      </View>

      <Text style={[s.footnote, { color: C.text2 }]}>
        Zor yayınlarda net düşüşün normal — panik yapma. Rota normalize net üzerinden çizilir.
      </Text>
    </>
  );

  const isDark = C.scheme !== "light";

  return (
    <View style={s.wrap}>
      {onPress ? (
        <Press
          haptic="none"
          accessibilityRole="button"
          accessibilityLabel="Yayın Karşılaştırması Ayrıntıları"
          onPress={onPress}
          style={[
            s.card,
            { backgroundColor: C.surface, borderColor: C.line },
            !isDark && SHADOW.cardLight,
          ]}
        >
          {cardContent}
        </Press>
      ) : (
        <View
          style={[
            s.card,
            { backgroundColor: C.surface, borderColor: C.line },
            !isDark && SHADOW.cardLight,
          ]}
        >
          {cardContent}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: GUTTER,
    paddingTop: 26,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontFamily: "Archivo_600",
    fontSize: 11.5,
    letterSpacing: 2.07, // .18em
    textTransform: "uppercase",
  },
  list: {
    gap: 12,
    marginTop: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pubName: {
    width: 74,
    fontFamily: "Archivo_500",
    fontSize: 12.5,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 1,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 1,
  },
  netNum: {
    width: 34,
    textAlign: "right",
    fontFamily: "Bricolage_400",
    fontSize: 15,
    fontVariant: ["tabular-nums"],
  },
  footnote: {
    fontFamily: "Archivo_400",
    fontSize: 12.5,
    lineHeight: 20,
    marginTop: 16,
  },
});