import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { RouteDetailChart } from "./RouteDetailChart";
import { RouteEmptyChart } from "../../../components/charts/RouteEmptyChart";

export function RouteNetIntro({ C, view, chartReady, targetNet, examDateTag, declared }) {
  return (
    <Animated.View>
      <View style={s.introHeader}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>NET ORTALAMASI</Text>
        {view.caption ? (
          <Text style={[TYPOGRAPHY.caption, s.caption, { color: C.text3 }]}>{view.caption}</Text>
        ) : null}
      </View>
      <View style={s.chart}>
        {chartReady && view.chart ? (
          <RouteDetailChart chart={view.chart} target={targetNet} examDateTag={examDateTag} />
        ) : (
          <RouteEmptyChart examDateTag={examDateTag} declared={declared} />
        )}
      </View>

      {!chartReady && declared?.summary ? (
        <Text style={[TYPOGRAPHY.meta, s.declaredSummary, { color: C.text3 }]}>
          {declared.summary}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  introHeader: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 6 },
  caption: { marginTop: STEP.s1 / 2 },
  chart: { marginTop: 12 },
  declaredSummary: { paddingHorizontal: GUTTER, marginTop: STEP.s2 },
});
