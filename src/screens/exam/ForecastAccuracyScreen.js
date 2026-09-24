import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";

import { Button, EmptyState, ErrorState, Skeleton } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useForecastAccuracy } from "../../hooks/useForecastAccuracy";
import { ExamScreenHeader } from "./components/ExamScreenHeader";
import { ForecastAccuracyChart } from "./components/ForecastAccuracyChart";
import { ForecastStatTrio } from "./components/ForecastStatTrio";
import { ExamRecapCard } from "./components/ExamRecapCard";
import { ForecastMissReasonCard } from "./components/ForecastMissReasonCard";

// Tasarim AKIS 14 · "Tahmin Doğruluğu" ve hali "Tahmin Şaştı". Bant disinda
// kalinca: eyebrow sakin tona doner, sebep karti acilir (sebep gercekse),
// paylas butonu birincil olmaktan cikip sessiz cerceveye doner.
// "Sırada ne var" satiri CIZILMIYOR: o ekran (kapsam #4) henuz yok.

export default function ForecastAccuracyScreen() {
  const C = useC();
  const f = useForecastAccuracy();
  const v = f.view;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <ExamScreenHeader onBack={f.back} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {f.status === "loading" ? (
          <View>
            <Skeleton height={14} width={120} />
            <Skeleton height={68} style={s.block} />
            <Skeleton height={168} radius={SHAPE.panel} style={s.block} />
          </View>
        ) : null}

        {f.status === "error" ? <ErrorState preset="server" onPrimary={f.retry} /> : null}

        {f.status === "empty" ? <EmptyState preset="examResultMissing" onPrimary={f.enterResult} /> : null}

        {f.status === "ready" && v ? (
          <>
            <Animated.View>
              <Text style={[TYPOGRAPHY.label, s.eyebrow, { color: v.emphasized ? C.accentBright : C.text3 }]}>
                {v.eyebrow}
              </Text>
              <Text style={[TYPOGRAPHY.heading, s.title, { color: C.text }]}>{v.title}</Text>
              {v.body ? <Text style={[TYPOGRAPHY.body, s.body, { color: C.text2 }]}>{v.body}</Text> : null}
            </Animated.View>

            {f.chart ? (
              <Animated.View style={s.block}>
                <ForecastAccuracyChart chart={f.chart} view={v} />
              </Animated.View>
            ) : null}

            {v.showMissReason ? (
              <Animated.View style={s.blockTight}>
                <ForecastMissReasonCard />
              </Animated.View>
            ) : null}

            <Animated.View style={s.blockTight}>
              <ForecastStatTrio view={v} />
            </Animated.View>

            {f.recap ? (
              <Animated.View style={s.blockTight}>
                <ExamRecapCard recap={f.recap} />
              </Animated.View>
            ) : null}

            <Animated.View style={s.cta}>
              <Button size="lg" fullWidth variant={v.emphasized ? "primary" : "outline"} onPress={f.share}>
                Yılın rotasını paylaş
              </Button>
            </Animated.View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s4 + 6 },
  eyebrow: { letterSpacing: 2.8 },
  title: { marginTop: STEP.s2 + 2, maxWidth: 300 },
  body: { marginTop: STEP.s2 + 2, maxWidth: 302 },
  block: { marginTop: STEP.s3 + 4 },
  blockTight: { marginTop: STEP.s3 + 2 },
  cta: { marginTop: STEP.s3 + 6 },
});
