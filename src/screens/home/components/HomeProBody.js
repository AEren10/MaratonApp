import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { HomeTodayStops } from "./HomeTodayStops";
import { HomeMomentumRow } from "./HomeMomentumRow";
import { HomeLinkRow } from "./HomeLinkRow";
import { HomeNotebookCard } from "./HomeNotebookCard";
import { HomeGroupCard } from "./HomeGroupCard";
import { useMyGroups } from "../../../hooks/useMyGroups";
import { Press } from "../../../components/design/Press";

// Ana Sayfa (Pro) govdesi: bugunun duraklari, calisma grubu karti, dikkat ceken iki ders,
// konu borcu + haftalik rapor satirlari, Defter karti.
export function HomeProBody({ stops, momentum, debtHours, dueCount = 0, go }) {
  const C = useC();
  const groupsData = useMyGroups();
  // Tekrar bekleyen varsa Defter karti yukari, duraklarin hemen altina cikar:
  // o da bugunun isi. Bekleyen yoksa sayfanin sonunda sakin bir giris olarak
  // kalir ve dikkati bolmez.
  const notebook = (
    <HomeNotebookCard dueCount={dueCount} onPress={go.notebook} onReview={go.review} />
  );

  return (
    <View>
      <HomeTodayStops stops={stops} onStartTask={go.startTask} onViewPlan={go.plan} />

      {dueCount > 0 ? <View style={s.due}>{notebook}</View> : null}

      {/* Grup karti bugunun isi DEGIL, sosyal bir davet. Durak -> tekrar
          komsulugunu bolmemesi icin ikisinden sonra gelir. */}
      <HomeGroupCard groupsData={groupsData} onPress={go.groups} />

      {momentum.length ? (
        <View style={s.attention}>
          <View style={s.head}>
            <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>DİKKAT ÇEKEN İKİ DERS</Text>
            <View style={[s.rule, { backgroundColor: C.line }]} />
            <Press haptic="none" onPress={() => { H.tap(); go.analysis(); }} accessibilityRole="button"
              accessibilityLabel="Analiz" style={s.link}>
              <Text style={[TYPOGRAPHY.label, s.linkText, { color: C.text2 }]}>Analiz</Text>
              <Icon name="chevR" size={11} color={C.text5} />
            </Press>
          </View>
          {momentum.map((m) => <HomeMomentumRow key={m.key} subject={m} onPress={go.subjectDetail} />)}
        </View>
      ) : null}

      <View style={s.links}>
        <HomeLinkRow label="Konu borcu" value={debtHours > 0 ? `${debtHours} sa` : null} onPress={go.debt} />
        <HomeLinkRow label="Bu haftanın raporu" onPress={go.weekReport} />
      </View>

      <View style={s.notebook}>{dueCount > 0 ? null : notebook}</View>
    </View>
  );
}

const s = StyleSheet.create({
  due: { paddingTop: STEP.s3 },
  attention: { paddingTop: STEP.s5 - 8 },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + 2, paddingBottom: STEP.s1 - 2 },
  rule: { flex: 1, height: 1 },
  link: { flexDirection: "row", alignItems: "center", gap: STEP.s1 - 1, minHeight: CONTROL.tapMin },
  linkText: { letterSpacing: 0, textTransform: "none" },
  links: { paddingTop: STEP.s3 + 6 },
  notebook: { paddingBottom: STEP.s4 + 2 },
});
