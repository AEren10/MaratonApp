import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function PersonalBests({ bests }) {
  const C = useC();
  if (!bests || !bests.subjects?.length) return null;

  return (
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.tableHead, { color: C.text2, marginBottom: STEP.s2 }]}>
        KİŞİSEL REKORLAR
      </Text>

      {bests.overall && (
        <View style={[s.heroBest, { backgroundColor: C.surface, borderColor: C.line }]}>
          <View style={s.heroLeft}>
            <View style={[s.iconBox, { backgroundColor: C.void }]}>
              <Icon name="star" size={16} color={C.accentBright} />
            </View>
            <View>
              <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>Tüm Zamanların En İyisi</Text>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{bests.overall.date}</Text>
            </View>
          </View>
          <Text style={[TYPOGRAPHY.statSmall, s.num, { color: C.accentBright }]}>
            {String(bests.overall.bestNet).replace(".", ",")}
          </Text>
        </View>
      )}

      <View style={s.list}>
        {bests.subjects.map((sRow, i) => (
          <View
            key={sRow.key}
            style={[
              s.row,
              { borderBottomColor: C.line, borderBottomWidth: i === bests.subjects.length - 1 ? 0 : 1 },
            ]}
          >
            <Text style={[TYPOGRAPHY.tableName, s.subjectName, { color: C.text }]} numberOfLines={1}>
              {sRow.name}
            </Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginRight: STEP.s2 }]}>
              {sRow.date}
            </Text>
            <Text style={[TYPOGRAPHY.bodySemiBold, s.num, { color: C.text }]}>
              {String(sRow.bestNet).replace(".", ",")} net
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginTop: STEP.s4,
  },
  heroBest: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: STEP.s2 + 2,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    marginBottom: STEP.s2,
  },
  heroLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: SHAPE.chip,
    alignItems: "center",
    justifyContent: "center",
  },
  num: {
    fontVariant: ["tabular-nums"],
  },
  list: {
    marginTop: STEP.s1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: STEP.s2 + 1,
    gap: STEP.s1,
  },
  subjectName: {
    flex: 1,
  },
});
