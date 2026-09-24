import React, { useState, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER } from "../../../themes/tokens";
import { useRouteActivity } from "../../../hooks/useRouteActivity";
import { RouteSvgChart } from "./RouteSvgChart";
import * as H from "../../../lib/haptics";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = SCREEN_W - GUTTER * 2;
const MODES = [
  { key: "year", label: "YIL" },
  { key: "month", label: "AY" },
  { key: "week", label: "HAFTA" },
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

  return (
    <View style={{ marginHorizontal: GUTTER, marginTop: STEP.s3 + STEP.s1 + 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: STEP.s1 }}>
        <Text style={{ fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 1.5, color: C.text2 }}>
          {currentInfo.title}
        </Text>
        <View style={{ flexDirection: "row", backgroundColor: C.surface, borderRadius: 8, padding: 2, borderWidth: 1, borderColor: C.line }}>
          {MODES.map((m, i) => {
            const active = i === activeIdx;
            return (
              <Pressable
                key={m.key}
                onPress={() => handleSelectMode(i)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`${m.label} rotası`}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  backgroundColor: active ? C.elev : "transparent",
                }}
              >
                <Text style={{ fontFamily: "Archivo_600", fontSize: 10.5, color: active ? C.text : C.text3 }}>
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={{ fontFamily: "Archivo_500", fontSize: 12, color: C.text, marginBottom: STEP.s2 }}>
        {currentInfo.rightText}
      </Text>

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

      <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: STEP.s2 }}>
        {MODES.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === activeIdx ? 16 : 5,
              height: 5,
              borderRadius: 2.5,
              backgroundColor: i === activeIdx ? C.accent : C.track,
            }}
          />
        ))}
      </View>
    </View>
  );
}
