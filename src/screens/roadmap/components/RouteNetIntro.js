import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { RouteDetailChart } from "./RouteDetailChart";
import { RouteEmptyChart } from "../../../components/charts/RouteEmptyChart";
import { RouteTrialModal } from "./RouteTrialModal";

export function RouteNetIntro({
  C,
  view,
  chartReady,
  targetNet,
  examDateTag,
  declared,
  onOpenTrialDetail,
}) {
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const stopsCount = view?.chart?.stops?.length ?? 0;
  const isCompact = !chartReady || stopsCount <= 1;
  const chartHeight = isCompact ? 180 : 250;

  const handleSelectStop = useCallback((stop, index) => {
    setSelectedStop(stop);
    setSelectedIndex(index);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedStop(null);
    setSelectedIndex(null);
  }, []);

  return (
    <Animated.View>
      <View style={s.introHeader}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>NET ORTALAMASI</Text>
        <View style={s.captionRow}>
          {view?.caption ? (
            <Text style={[TYPOGRAPHY.caption, s.caption, { color: C.text3 }]}>
              {view.caption}
            </Text>
          ) : null}
          {chartReady && stopsCount > 0 ? (
            <Text style={[TYPOGRAPHY.caption, s.caption, { color: C.text3 }]}>
              {" · "}
              <Text style={{ color: C.accentBright }}>Detay için noktalara dokun</Text>
            </Text>
          ) : null}
        </View>
      </View>
      <View style={s.chart}>
        {chartReady && view?.chart ? (
          <RouteDetailChart
            chart={view.chart}
            target={targetNet}
            examDateTag={examDateTag}
            height={chartHeight}
            onSelectStop={handleSelectStop}
            selectedIndex={selectedIndex}
          />
        ) : (
          <RouteEmptyChart examDateTag={examDateTag} declared={declared} height={chartHeight} />
        )}
      </View>

      <RouteTrialModal
        visible={Boolean(selectedStop)}
        stop={selectedStop}
        onClose={handleCloseModal}
        onNavigateDetail={onOpenTrialDetail}
      />

      {!chartReady && declared?.summary ? (
        <Text style={[TYPOGRAPHY.meta, s.declaredSummary, { color: C.text3 }]}>
          {declared.summary}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  introHeader: {
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s3 + 6,
  },
  captionRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: STEP.s1 / 2,
  },
  caption: {},
  chart: {
    marginTop: STEP.s2,
  },
  declaredSummary: {
    paddingHorizontal: GUTTER,
    marginTop: STEP.s3,
    marginBottom: STEP.s1,
  },
});
