import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { HomeLinkRow } from "./HomeLinkRow";

const RecentRow = React.memo(function RecentRow({ row }) {
  const C = useC();
  const sid = useSubjectIdentity(row.subject);
  return (
    <View style={[s.row, { borderTopColor: C.line }]} accessible accessibilityLabel={`${row.title}, ${row.meta}`}>
      <View style={[s.bar, { backgroundColor: sid?.solid || C.text3 }]} />
      <View style={s.flex}>
        <Text numberOfLines={1} style={[TYPOGRAPHY.topicName, { color: C.text }]}>{row.title}</Text>
        {row.meta ? <Text numberOfLines={1} style={[TYPOGRAPHY.micro, s.meta, { color: C.text3 }]}>{row.meta}</Text> : null}
      </View>
    </View>
  );
});

// Ücretsiz Ana Sayfa govdesi: "SON ÇALIŞMALARIN" (bu haftanin gercek
// kayitlari) + tek notr cikis "Rotanı gör" -> Pro Önizleme.
export function HomeFreeBody({ recent, onSeeRoute }) {
  const C = useC();
  return (
    <View>
      {recent.length ? (
        <View style={s.section}>
          <View style={s.head}>
            <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>SON ÇALIŞMALARIN</Text>
            <View style={[s.rule, { backgroundColor: C.line }]} />
            <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>bu hafta</Text>
          </View>
          {recent.map((row) => <RecentRow key={row.key} row={row} />)}
        </View>
      ) : null}
      <View style={s.links}>
        <HomeLinkRow label="Rotanı gör" onPress={onSeeRoute} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: { paddingTop: STEP.s4 - 2 },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + 2, paddingBottom: STEP.s1 - 2 },
  rule: { flex: 1, height: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2, paddingVertical: STEP.s2 + 3, borderTopWidth: 1 },
  bar: { width: 3, alignSelf: "stretch", minHeight: STEP.s4, borderRadius: SHAPE.chip / 3 },
  flex: { flex: 1, minWidth: 0 },
  meta: { marginTop: STEP.s1 / 2 },
  links: { paddingTop: STEP.s3 + 6, paddingBottom: STEP.s4 },
});
