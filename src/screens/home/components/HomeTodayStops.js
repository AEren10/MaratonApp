import { useState, useCallback, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { Layout } from "react-native-reanimated";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { EMPTY_COPY } from "../../../constants/stateCopy";
import * as H from "../../../lib/haptics";
import { HomeStopRow } from "./HomeStopRow";
import { HomeStopToast } from "./HomeStopToast";

const PREVIEW = 3;

// "BUGÜNÜN DURAKLARI": ilerleme bolutleri + ilk uc durak + "Programın tamamı".
// Liste en fazla uc satir oldugu icin FlatList yerine map (kaydirma yok).
export function HomeTodayStops({ stops, onStartTask, onViewPlan }) {
  const C = useC();
  const { items, doneCount, nextId, toggle } = stops;
  const preview = items.slice(0, PREVIEW);
  const more = Math.max(0, items.length - PREVIEW);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);

  const handleChecked = useCallback(() => {
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  }, []);

  return (
    <View style={s.wrap}>
      <HomeStopToast visible={toastVisible} />

      <View style={s.head}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BUGÜNÜN DURAKLARI</Text>
        <View style={s.segs}>
          {items.map((_, i) => (
            <View
              key={i}
              style={[
                s.seg,
                { backgroundColor: i < doneCount ? C.up : C.track },
              ]}
            />
          ))}
        </View>
        {items.length ? (
          <Text style={[TYPOGRAPHY.label, s.count, { color: C.text }]}>{`${doneCount}/${items.length}`}</Text>
        ) : null}
      </View>

      {preview.length ? (
        <View style={s.list}>
          {preview.map((item) => (
            <Animated.View key={item.id} layout={Layout.springify().damping(16)}>
              <HomeStopRow
                item={item}
                isNext={item.id === nextId}
                onToggle={toggle}
                onStart={onStartTask}
                onChecked={handleChecked}
              />
            </Animated.View>
          ))}
        </View>
      ) : (
        <Text style={[TYPOGRAPHY.body, { color: C.text3 }]}>{EMPTY_COPY.calendarEmptyDay.title}</Text>
      )}

      <Pressable
        onPress={() => { H.tap(); onViewPlan?.(); }}
        accessibilityRole="button"
        accessibilityLabel="Programın tamamı"
        style={({ pressed }) => [s.all, { backgroundColor: pressed ? C.elev : C.surface, borderColor: C.border }]}
      >
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Programın tamamı</Text>
        <View style={s.flex} />
        {more > 0 ? (
          <Text style={[TYPOGRAPHY.metaSemiBold, s.tab, { color: C.text3 }]}>{`+${more} durak`}</Text>
        ) : null}
        <Icon name="chevR" size={13} color={C.text3} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingTop: STEP.s4 + 8, position: "relative" },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingBottom: STEP.s2 + 2 },
  segs: { flex: 1, flexDirection: "row", gap: STEP.s1 / 2 },
  seg: { flex: 1, height: 4, borderRadius: SHAPE.chip / 6 },
  count: { letterSpacing: 0, fontVariant: ["tabular-nums"] },
  list: { gap: STEP.s1 },
  all: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2, height: STEP.s5 - 2, marginTop: STEP.s1 + 2,
    paddingHorizontal: STEP.s3 - 2, borderRadius: SHAPE.cardTight - 2, borderWidth: 1,
  },
  flex: { flex: 1 },
  tab: { fontVariant: ["tabular-nums"] },
});
