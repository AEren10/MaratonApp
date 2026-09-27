import React, { useState, useRef, useCallback } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER } from "../../../themes/tokens";
import { useRouteActivity } from "../../../hooks/useRouteActivity";
import { RouteSvgChart } from "./RouteSvgChart";
import SegmentTabs from "../../../components/common/SegmentTabs";
import * as H from "../../../lib/haptics";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = SCREEN_W - GUTTER * 2;
const MODES = [
  { key: "year", label: "Yıl" },
  { key: "month", label: "Ay" },
  { key: "week", label: "Hafta" },
];

export function YearRouteChart() {
  const C = useC();
  const { data } = useRouteActivity();
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef(null);

  const handleSelectMode = useCallback((idx) => {
    H.select();
    setActiveIdx(idx);
    scrollRef.current?.scrollTo({ x: idx * CHART_W, animated: true });
  }, []);

  const handleScrollEnd = useCallback((e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CHART_W);
    if (idx >= 0 && idx < MODES.length && idx !== activeIdx) {
      H.select();
      setActiveIdx(idx);
    }
  }, [activeIdx]);

  const activeMode = MODES[activeIdx].key;
  const currentInfo = data?.[activeMode] || {
    title: "YILIN ROTASI",
    rightText: "",
    points: [],
    currentIndex: 0,
  };
  const hasActivity = MODES.some((m) =>
    (data?.[m.key]?.points || []).some((point) => (point.count || 0) > 0 || (point.level || 0) > 0),
  );

  if (!hasActivity) {
    return (
      <View style={{ marginHorizontal: GUTTER, marginTop: STEP.s3 + STEP.s1 + 4 }}>
        <Text style={{ fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 1.6, color: C.text2, marginBottom: STEP.s2 }}>
          YILIN ROTASI
        </Text>
        <View style={{ borderWidth: 1, borderColor: C.border, backgroundColor: C.surface, borderRadius: 20, padding: STEP.s3 }}>
          <Text style={{ fontFamily: "Bricolage_400", fontSize: 16, lineHeight: 22, color: C.text }}>
            Rota günlüğün ilk kayıtla başlayacak.
          </Text>
          <Text style={{ fontFamily: "Archivo_400", fontSize: 13, lineHeight: 20, color: C.text2, marginTop: STEP.s1 }}>
            Çalışma yaptığın günler yıl, ay ve hafta görünümünde gerçek iz olarak dolacak.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginHorizontal: GUTTER, marginTop: STEP.s3 + STEP.s1 + 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: STEP.s2 }}>
        <Text style={{ fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 1.6, color: C.text2 }}>
          {currentInfo.title}
        </Text>
        {currentInfo.rightText ? (
          <Text style={{ fontFamily: "Archivo_500", fontSize: 11.5, color: C.text3 }}>
            {currentInfo.rightText}
          </Text>
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        style={{ width: CHART_W }}
      >
        {MODES.map((m) => {
          const item = data?.[m.key];
          return (
            <View key={m.key} style={{ width: CHART_W }}>
              <RouteSvgChart points={item?.points || []} currentIndex={item?.currentIndex || 0} />
            </View>
          );
        })}
      </ScrollView>

      <View style={{ marginTop: STEP.s2 + 2 }}>
        <SegmentTabs
          options={MODES}
          value={activeMode}
          onChange={(key) => {
            const idx = MODES.findIndex((m) => m.key === key);
            if (idx >= 0) handleSelectMode(idx);
          }}
        />
      </View>
    </View>
  );
}
