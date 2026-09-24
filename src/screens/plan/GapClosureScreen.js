import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";

import { Button, EmptyState } from "../../components/design";
import { EyebrowHeader } from "../../components/common/EyebrowHeader";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { useC } from "../../contexts/ThemeContext";
import { useGapClosure } from "../../hooks/useGapClosure";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import GapOptionRow from "./components/GapOptionRow";
import { GapResultCard } from "./components/GapResultCard";


function GapClosureInner() {
  const C = useC();
  const g = useGapClosure();

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <EyebrowHeader label="BOŞLUĞU KAPAT" onBack={g.close} />
      {!g.hasGap ? (
        <EmptyState title="Planınla aynı yerdesin." style={s.empty} />
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View>
            <Text style={[TYPOGRAPHY.heading, s.headline, { color: C.text }]}>{g.copy.headline}</Text>
            <Text style={[TYPOGRAPHY.body, s.lede, { color: C.text3 }]}>{g.copy.lede}</Text>
          </Animated.View>
          <Animated.View style={s.options}>
            {g.copy.options.map((o) => (
              <GapOptionRow key={o.key} option={o} selected={g.choice === o.key} onSelect={g.setChoice} />
            ))}
          </Animated.View>
          <GapResultCard result={g.result} body={g.copy.resultBody} />
          <View style={[s.note, { backgroundColor: C.surface, borderColor: C.elev }]}>
            <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>
              Üç yolun hiçbiri geçmiş kaydı değiştirmiyor. Plan vs Gerçek ekranındaki çizgi olduğu gibi kalır.
            </Text>
          </View>
          <View style={s.actions}>
            <Button variant="primary" size="lg" fullWidth loading={g.applying} onPress={g.apply}>
              Planı uygula
            </Button>
            <Button variant="ghost" size="md" fullWidth onPress={g.close}>
              Şimdilik kalsın
            </Button>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default function GapClosureScreen() {
  return (
    <ScreenErrorBoundary>
      <GapClosureInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  empty: { flex: 1, paddingHorizontal: GUTTER, justifyContent: "center" },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 - 2, paddingBottom: STEP.s4 },
  headline: { maxWidth: 300 },
  lede: { marginTop: STEP.s2 + 2, maxWidth: 306 },
  options: { marginTop: STEP.s5, gap: STEP.s1 },
  note: { marginTop: STEP.s4 - 8, paddingVertical: STEP.s3 - 2, paddingHorizontal: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1 },
  actions: { marginTop: STEP.s4 - 8, gap: STEP.s1 },
});
