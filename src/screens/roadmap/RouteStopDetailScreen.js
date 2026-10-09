import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated from "react-native-reanimated";

import { Button } from "../../components/design";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { useRouteStopDetail } from "../../hooks/useRouteStopDetail";
import { useDepthTint } from "../../hooks/useDepthTint";
import { GUTTER, STEP } from "../../themes/tokens";
import { subjectColorOf } from "../../themes/subjectPalette";
import { RouteAccessGate } from "./components/RouteAccessGate";
import { RouteHeader } from "./components/RouteHeader";
import RouteLinkRow from "./components/RouteLinkRow";
import { RouteStatTiles } from "./components/RouteStatTiles";
import { RouteStopHero } from "./components/RouteStopHero";
import { RouteStopPlace } from "./components/RouteStopPlace";
import { RouteStopWhy } from "./components/RouteStopWhy";
import { DepthScrollView } from "../../components/design/DepthScroll";


// Tasarim AKIS 2 · "Durak Detayı": rotadaki tek durak.
// Parametre: { stopKey } (routeOverview.routeStopKey).
export default function RouteStopDetailScreen() {
  const C = useC();
  const navigation = useNavigation();
  const d = useRouteStopDetail();
  const { stop } = d;
  useDepthTint(stop?.subject);
  const color = stop ? subjectColorOf(C, stop.subject) : C.accent;
  const studied = stop && Number(stop.q) > 0;

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <RouteHeader onBack={d.goBack} onMore={stop ? d.openMore : null} moreLabel="Durak seçenekleri" />
      <RouteAccessGate
        loading={d.access.loading || (d.access.hasAccess && !d.access.error && !stop)}
        error={d.access.error}
        hasAccess={d.access.hasAccess}
        onRetry={d.access.retry}
        onPaywall={d.access.paywall}
      >
        {stop ? (
          <DepthScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            <Animated.View>
              <RouteStopHero number={d.number} stop={stop} color={color} subjectCompleted={d.subjectCompleted} part={d.part} when={d.when} />
            </Animated.View>
            <Animated.View>
              <RouteStopWhy stop={stop} color={color} />
            </Animated.View>
            <Animated.View>
              <RouteStopPlace prev={d.prev} next={d.next} />
            </Animated.View>
            <Animated.View>
              {/* Sifir bilgi tasimaz: yeni hesapta "DEFTER 0" kutusu anlamsizdi. */}
              <RouteStatTiles
                tiles={[
                  { label: "SON ÇALIŞMA", value: studied ? lastStudyLabel(stop.neglectedDays) : null },
                  { label: "ÇÖZÜLEN", value: studied ? `${Math.round(stop.q)} soru` : null },
                  { label: "DEFTERDE", value: Number(d.notebook) > 0 ? `${d.notebook} yanlış` : null },
                ]}
              />
            </Animated.View>
            <Animated.View style={s.linkSection}>
              <RouteLinkRow
                title="Konuyu aç"
                subtitle="Çalışma geçmişi, soru doğruluğu ve defter"
                onPress={() => navigation.navigate(SCREENS.TOPIC_STUDY, {
                  subjectKey: stop.subject,
                  topicName: stop.topic,
                })}
              />
            </Animated.View>
          </DepthScrollView>
        ) : null}
        {/* Sayfanin isi bu: eylem kaydirmanin sonunda kaybolmasin, hep altta. */}
        {stop && (d.canStart || d.canPostpone) ? (
          <View style={[s.footer, { backgroundColor: C.bg, borderTopColor: C.line }]}>
            {d.canPostpone ? (
              <Button variant="outline" size="lg" loading={d.postponing} onPress={d.postpone} style={s.postpone}>
                Ertele
              </Button>
            ) : null}
            {d.canStart ? (
              <View style={s.fill}>
                <Button size="lg" fullWidth onPress={d.start}>Çalışmaya başla</Button>
              </View>
            ) : null}
          </View>
        ) : null}
      </RouteAccessGate>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: STEP.s4 },
  linkSection: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  footer: {
    flexDirection: "row", gap: STEP.s1, paddingHorizontal: GUTTER, paddingVertical: STEP.s2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  postpone: { paddingHorizontal: STEP.s3 },
  fill: { flex: 1 },
});

function lastStudyLabel(days) {
  const n = Math.round(Number(days) || 0);
  return n <= 0 ? "Bugün" : n === 1 ? "Dün" : `${n} gün önce`;
}
