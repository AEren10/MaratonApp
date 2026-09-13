import { View, StyleSheet } from "react-native";

import { Skeleton } from "../../../components/design/Skeleton";
import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP } from "../../../themes/tokens";

// "Yükleniyor" artboardi: kahraman sayi, grafik bloku, uc satir, kizil
// uc nokta. Iskelet kendi nefesini tasir (Skeleton), ek hareket yok.
export function HomeLoading() {
  const C = useC();
  return (
    <View style={s.wrap} accessibilityLabel="Yükleniyor" accessibilityRole="progressbar">
      <View style={s.block}>
        <Skeleton width="40%" height={11} radius={SHAPE.chip / 6} />
        <Skeleton width={130} height={72} radius={SHAPE.button} style={s.gap} />
        <Skeleton width="62%" height={13} radius={SHAPE.chip / 3} style={s.gap} />
      </View>
      <View style={s.block}>
        <Skeleton width="34%" height={10} radius={SHAPE.chip / 6} />
        <Skeleton width="100%" height={108} radius={SHAPE.button} style={s.gap} />
      </View>
      <View style={s.block}>
        <Skeleton width="44%" height={10} radius={SHAPE.chip / 6} />
        <View style={[s.list, s.gap]}>
          {[0, 1, 2].map((i) => <Skeleton key={i} width="100%" height={62} radius={SHAPE.button} />)}
        </View>
      </View>
      <View style={[s.block, s.dots]}>
        {[0.9, 0.55, 0.25].map((o) => (
          <View key={o} style={[s.dot, { backgroundColor: C.accent, opacity: o }]} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER },
  block: { paddingTop: STEP.s4 },
  gap: { marginTop: STEP.s3 - 2 },
  list: { gap: STEP.s2 + 2 },
  dots: { flexDirection: "row", justifyContent: "center", gap: STEP.s1 + 2 },
  dot: { width: 7, height: 7, borderRadius: SHAPE.chip / 6 },
});
