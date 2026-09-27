import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import SegmentTabs from "../../components/common/SegmentTabs";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { PROGRAM_VIEWS } from "../../navigation/openProgram";
import { GUTTER, STEP } from "../../themes/tokens";
import { RouteHeader } from "../roadmap/components/RouteHeader";
import { ProgramWeekView } from "./views/ProgramWeekView";
import { ProgramMonthView } from "./views/ProgramMonthView";
import { ProgramCurriculumView } from "./views/ProgramCurriculumView";

const VIEWS = [
  { key: PROGRAM_VIEWS.WEEK, label: "Hafta" },
  { key: PROGRAM_VIEWS.MONTH, label: "Ay" },
  { key: PROGRAM_VIEWS.CURRICULUM, label: "Müfredat" },
];
const VALID = new Set(VIEWS.map((v) => v.key));

// Program sekmesinin koku. Eskiden bu sekme Yol haritasi ile aciliyor,
// "Programim" iki ayri ekrandi ve Haftalik/Aylik/Mufredat segmentleri
// her dokunusta yeni ekran aciyordu. Artik tek ekran, tek secici.
function ProgramInner() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const requested = route.params?.view;
  const [view, setView] = useState(VALID.has(requested) ? requested : PROGRAM_VIEWS.WEEK);

  useEffect(() => {
    if (VALID.has(requested)) {
      setView(requested);
      navigation.setParams({ view: undefined });
    }
  }, [requested, navigation]);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <RouteHeader
        title="Program"
        onMore={() => navigation.navigate(SCREENS.SEARCH)}
        moreIcon="search"
        moreLabel="Konu ara"
      />
      <View style={s.seg}>
        <SegmentTabs options={VIEWS} value={view} onChange={setView} />
      </View>
      {view === PROGRAM_VIEWS.WEEK ? <ProgramWeekView /> : null}
      {view === PROGRAM_VIEWS.MONTH ? <ProgramMonthView /> : null}
      {view === PROGRAM_VIEWS.CURRICULUM ? <ProgramCurriculumView /> : null}
    </SafeAreaView>
  );
}

export default function ProgramScreen() {
  return (
    <ScreenErrorBoundary>
      <ProgramInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  seg: { paddingHorizontal: GUTTER, marginBottom: STEP.s2 },
});
