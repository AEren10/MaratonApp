import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { HomeTodayStops } from "./HomeTodayStops";
import { HomeMomentumRow } from "./HomeMomentumRow";
import { HomeLinkRow } from "./HomeLinkRow";
import { HomeNotebookCard } from "./HomeNotebookCard";

// Ana Sayfa (Pro) govdesi: bugunun duraklari, dikkat ceken iki ders,
// konu borcu + haftalik rapor satirlari, Defter karti.
export function HomeProBody({ stops, momentum, debtHours, go }) {
  const C = useC();
  return (
    <View>
      <HomeTodayStops stops={stops} onStartTask={go.startTask} onViewPlan={go.plan} />

      {momentum.length ? (
        <View style={s.attention}>
          <View style={s.head}>
            <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>DİKKAT ÇEKEN İKİ DERS</Text>
            <View style={[s.rule, { backgroundColor: C.line }]} />
            <Pressable onPress={() => { H.tap(); go.analysis(); }} accessibilityRole="button"
              accessibilityLabel="Analiz" style={s.link}>
              <Text style={[TYPOGRAPHY.label, s.linkText, { color: C.text2 }]}>Analiz</Text>
              <Icon name="chevR" size={11} color={C.text5} />
            </Pressable>
          </View>
          {momentum.map((m) => <HomeMomentumRow key={m.key} subject={m} />)}
        </View>
      ) : null}

      <View style={s.links}>
        <HomeLinkRow label="Konu borcu" value={debtHours > 0 ? `${debtHours} sa` : null} onPress={go.debt} />
        <HomeLinkRow label="Bu haftanın raporu" onPress={go.weekReport} />
      </View>

      <View style={s.notebook}>
        <HomeNotebookCard onPress={go.notebook} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  attention: { paddingTop: STEP.s5 - 8 },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + 2, paddingBottom: STEP.s1 - 2 },
  rule: { flex: 1, height: 1 },
  link: { flexDirection: "row", alignItems: "center", gap: STEP.s1 - 1, minHeight: CONTROL.tapMin },
  linkText: { letterSpacing: 0, textTransform: "none" },
  links: { paddingTop: STEP.s3 + 6 },
  notebook: { paddingBottom: STEP.s4 + 2 },
});
