import React from "react";
import { View, StyleSheet } from "react-native";

import { STEP } from "../../../themes/tokens";
import { HomeTodayStops } from "./HomeTodayStops";
import { HomeNotebookCard } from "./HomeNotebookCard";
import { HomeDiscoverTip } from "./HomeDiscoverTip";

// Ana Sayfa (Pro) govdesi: bugunun duraklari ve -- yalniz tekrar bekleyen
// varsa -- Defter. Ana sayfa "simdi ne yapayim" sorusuna cevap verir;
// "dikkat ceken iki ders" Analiz'deki ders trendinin tekrariydi, grup karti
// Profil'deki Gruplarim'in tekrariydi, ikisi de kaldirildi.
export const HomeProBody = React.memo(function HomeProBody({ stops, dueCount = 0, go, discoverEligible = false }) {
  return (
    <View style={s.wrap}>
      <HomeTodayStops stops={stops} onStartTask={go.startTask} onViewPlan={go.plan} />
      {dueCount > 0 ? (
        <View style={s.due}>
          <HomeNotebookCard dueCount={dueCount} onPress={go.notebook} onReview={go.review} />
        </View>
      ) : null}
      <HomeDiscoverTip eligible={discoverEligible} />
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { paddingBottom: STEP.s4 + 2 },
  due: { paddingTop: STEP.s3 },
});
