import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Icon, Stat } from "../../../components/design";
import { C, TYPOGRAPHY, SPACING } from "../../../themes/tokens";

function StaticRing({ size = 120, stroke = 10, value = 0, color, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(Math.max(value, 0), 1));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.border} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <View style={{ alignItems: "center", justifyContent: "center" }}>{children}</View>
    </View>
  );
}

export function PlanHeader({ done, total, soru, hours }) {
  const pct = total > 0 ? done / total : 0;
  const showMotiv = pct > 0.5;

  return (
    <View style={{ alignItems: "center", paddingVertical: SPACING.xxl }}>
      <StaticRing
        size={120}
        stroke={10}
        value={pct}
        color={pct >= 1 ? C.green : C.amber}
      >
        <Stat size={36} color={C.text}>
          {done}/{total}
        </Stat>
      </StaticRing>

      <Text
        style={{
          ...TYPOGRAPHY.bodySemiBold,
          color: C.sec,
          marginTop: SPACING.md,
        }}
      >
        {done}/{total} tamamlandi
      </Text>

      <View style={styles.statsRow}>
        <StatPill icon="target" label={`${soru} soru`} />
        <View style={styles.dot} />
        <StatPill icon="clock" label={hours} />
      </View>

      {showMotiv && (
        <View style={styles.motivRow}>
          <Icon name="flame" size={16} color={C.amber} />
          <Text style={{ ...TYPOGRAPHY.caption, color: C.amber, marginLeft: 6 }}>
            Yarisini bitirdin, devam et!
          </Text>
        </View>
      )}
    </View>
  );
}

function StatPill({ icon, label }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Icon name={icon} size={14} color={C.muted} />
      <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.muted }}>
        {label}
      </Text>
    </View>
  );
}

const styles = {
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.muted,
  },
  motivRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.lg,
    backgroundColor: C.amber + "14",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 999,
  },
};
