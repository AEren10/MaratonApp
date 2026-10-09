import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { alpha } from "../../../themes/colorMix";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export const ReferralStatsCard = memo(function ReferralStatsCard({ count = 0, C }) {
  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      <View style={styles.top}>
        <View style={[styles.iconBox, { backgroundColor: alpha(C.accent, 10), borderColor: alpha(C.accent, 20) }]}>
          <Icon name="users" size={20} color={C.accentBright} />
        </View>
        <View style={styles.statInfo}>
          <View style={styles.numRow}>
            <Text style={[styles.statNum, { color: C.text }]}>{count}</Text>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>
              {count === 1 ? "Arkadaş Katıldı" : "Arkadaş Katıldı"}
            </Text>
          </View>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>
            {count > 0 ? "Birlikte çalışma ritminiz aktif" : "Henüz davet edilen arkadaşın yok"}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: C.line }]} />

      <Text style={[TYPOGRAPHY.caption, { color: C.text2 }]}>
        {count > 0
          ? "Arkadaşlarınla çalışma serilerini ve denemelerini karşılıklı takip ederek motivasyonunu diri tut."
          : "Sınıfındaki veya kütüphanedeki arkadaşını davet et; denemelerde ve günlük hedeflerde birbirinize destek olun."}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: SHAPE.panel,
    borderWidth: 1,
    padding: STEP.s2,
    gap: STEP.s2,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statInfo: {
    flex: 1,
  },
  numRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  statNum: {
    fontFamily: "Bricolage_400",
    fontSize: 26,
    fontVariant: ["tabular-nums"],
  },
  divider: {
    height: 1,
    width: "100%",
  },
});
