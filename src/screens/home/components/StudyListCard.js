import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import * as H from "../../../lib/haptics";

export function StudyListCard({ progress, onNavigate, onCreate }) {
  const C = useC();
  const hasTasks = progress.total > 0;
  const allDone = hasTasks && progress.done >= progress.total;
  const pct = hasTasks ? Math.round((progress.done / progress.total) * 100) : 0;

  if (!hasTasks) {
    return (
      <Pressable onPress={() => { H.tap(); onCreate(); }} style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={s.row}>
          <View style={[s.iconBox, { backgroundColor: C.accent + "14" }]}>
            <Icon name="layers" size={20} color={C.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.title, { color: C.text }]}>Çalışma listeni oluştur</Text>
            <Text style={[s.sub, { color: C.sec }]}>Bugün için kendi hedeflerini belirle</Text>
          </View>
          <Icon name="arrowR" size={16} color={C.muted} />
        </View>
      </Pressable>
    );
  }

  const accent = allDone ? C.green : C.accent;

  return (
    <Pressable onPress={() => { H.tap(); onNavigate(); }} style={[s.card, { backgroundColor: accent + "0F", borderColor: accent + "30" }]}>
      <View style={s.row}>
        <View style={[s.iconBox, { backgroundColor: accent + "20" }]}>
          <Icon name={allDone ? "check" : "layers"} size={20} color={accent} />
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={s.headRow}>
            <Text style={[s.tag, { color: accent }]}>ÇALIŞMA LİSTEN</Text>
            <Text style={[s.stat, { color: C.text }]}>{progress.done}/{progress.total}</Text>
          </View>
          <View style={[s.barBg, { backgroundColor: accent + "20" }]}>
            <View style={[s.barFill, { width: `${pct}%`, backgroundColor: accent }]} />
          </View>
          <Text style={[s.sub, { color: C.sec }]}>
            {allDone ? "Tebrikler, tüm görevlerini tamamladın!" : `${progress.remaining} görev kaldı`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: RADIUS.xxl, borderWidth: 1, padding: SPACING.lg },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tag: { ...TYPOGRAPHY.label },
  stat: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 16 },
  title: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  sub: { ...TYPOGRAPHY.caption },
  barBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3 },
});
