import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import * as H from "../../../../lib/haptics";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../../themes/tokens";
import { Press } from "../../../../components/design/Press";

// Gunun Ozeti · "Hikâyende paylaş": kartin kucuk onizlemesi + paylasim kartina gecis.
export function SummaryShareRow({ value, onPress }) {
  const C = useC();

  return (
    <View style={styles.wrap}>
      <Press
        haptic="tap"
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel="Hikâyende paylaş"
        onPress={() => {
          H.tap();
          onPress?.();
        }}
        style={[styles.row, { backgroundColor: C.surface, borderColor: C.line }]}
      >
        {/* Küçük Önizleme Kartı */}
        <View style={[styles.thumb, { backgroundColor: C.void, borderColor: C.elev }]}>
          <View style={[styles.thumbBar, { backgroundColor: C.accent }]} />
          <Text style={[TYPOGRAPHY.tableValue, styles.thumbVal, { color: C.text }]} numberOfLines={1}>
            {value}
          </Text>
          <View style={[styles.thumbDot, { backgroundColor: C.accentBright }]} />
        </View>

        <View style={styles.flex}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Hikâyende paylaş</Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s1 / 4 }]}>
            Günün çalışmasını Instagram veya hikayende göster
          </Text>
        </View>

        <View style={[styles.shareBadge, { backgroundColor: C.void, borderColor: C.elev }]}>
          <Icon name="share" size={14} color={C.accentBright} />
        </View>
      </Press>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s3, paddingHorizontal: GUTTER },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    padding: STEP.s2,
    borderRadius: SHAPE.sheet,
    borderWidth: 1,
  },
  thumb: {
    width: 46,
    height: 70,
    borderRadius: SHAPE.chip + 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: STEP.s1,
    paddingHorizontal: STEP.s1 / 2,
  },
  thumbBar: {
    width: 16,
    height: 3,
    borderRadius: SHAPE.chip / 2,
  },
  thumbVal: {
    letterSpacing: -0.2,
  },
  thumbDot: {
    width: 6,
    height: 6,
    borderRadius: SHAPE.chip / 2,
  },
  flex: { flex: 1 },
  shareBadge: {
    width: 32,
    height: 32,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
