import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { Icon } from "../../../components/design/Icon";
import { getNextTier, getTier } from "../../../constants/league";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { withCase } from "../../../lib/turkishSuffix";

// Haftanin ozeti + lig kademesi tek kartta. Netler burada gorunmez; kiyas
// emek (soru) uzerinden.
export function LeagueBoardHeader({ data, totalUsers, title }) {
  const C = useC();
  const my = data.list.find((item) => item.you);
  const below = data.list.find((item) => item.rank === (my?.rank ?? 0) + 1);
  const lead = below ? Math.max(0, (my?.questions || 0) - (below.questions || 0)) : 0;
  const tier = getTier(data.myScore);
  const next = getNextTier(data.myScore);
  const toNext = next ? next.minXP - (data.myScore ?? 0) : null;

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>
        {title} · {data.myRank ? `${data.myRank}. SIRA` : "BU HAFTA"}
      </Text>
      <View style={s.hero}>
        <Text style={[TYPOGRAPHY.statLarge, { color: C.text }]}>{my?.questions || 0}</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>soru bu hafta</Text>
      </View>
      <Text style={[TYPOGRAPHY.caption, { color: C.text2 }]}>
        {lead ? `Bir alt sıradan ${lead} soru öndesin.` : "Sıralama haftalık çözülen soruya göre."}
      </Text>
      <View style={[s.tier, { borderTopColor: C.line }]}>
        <Icon name={tier.icon} size={16} color={tier.color} />
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text, flex: 1 }]}>{tier.name} Lig</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>
          {totalUsers} kişi{toNext != null ? ` · ${withCase(next.name, "dative")} ${toNext} puan` : ""}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: SHAPE.card, borderWidth: 1, padding: STEP.s3, gap: STEP.s1, marginBottom: STEP.s3 },
  hero: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  tier: { flexDirection: "row", alignItems: "center", gap: STEP.s1, borderTopWidth: 1, paddingTop: STEP.s2, marginTop: STEP.s1 },
});
