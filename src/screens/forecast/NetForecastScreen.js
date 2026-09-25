import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated from "react-native-reanimated";
import { useC } from "../../contexts/ThemeContext";
import { Icon, Card, Button, Skeleton } from "../../components/design";
import { EmptyState } from "../../components/design/EmptyState";
import { SCREENS } from "../../constants/screens";
import { GUTTER, STEP, TYPOGRAPHY, SHAPE } from "../../themes/tokens";
import { useScenarioView } from "../../hooks/useScenarioView";
import { ScenarioCard } from "./components/ScenarioCard";
import { Press } from "../../components/design/Press";

// AKIŞ 2 · Senaryolar — Rota Detay'daki "Senaryoları aç" satırının hedefi.
// Üç tempo senaryosu aynı hedef netini farklı haftalık yükle çiziyor.
export default function NetForecastScreen() {
  const navigation = useNavigation();
  const C = useC();
  const {
    forecast, scenarios, selected, selectedScenario,
    selectScenario, applyTempo, applying, canAccess, loading,
  } = useScenarioView();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s2 }}>
        <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" accessibilityHint="Önceki ekrana döner" style={{ minWidth: 44, minHeight: 44, justifyContent: "center" }}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Press>
        <Text style={{ ...TYPOGRAPHY.label, color: C.text3, marginLeft: STEP.s1 }}>SENARYOLAR</Text>
      </View>

      {!forecast || !scenarios?.length ? (
        loading ? (
          <View style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s3, gap: STEP.s2 }}>
            <Skeleton width="100%" height={72} radius={SHAPE.card} />
            <Skeleton width="100%" height={72} radius={SHAPE.card} />
            <Skeleton width="100%" height={72} radius={SHAPE.card} />
          </View>
        ) : (
          <EmptyState
            eyebrow="SENARYOLAR"
            title="Senaryolar için veriye ihtiyacın var"
            body="En az 3 aynı tip deneme ve bir rota gerekiyor. Önce deneme gir, rota oluşsun."
            primary="Deneme Gir"
            onPrimary={() => navigation.navigate(SCREENS.TRIAL_ENTRY)}
            style={{ paddingHorizontal: GUTTER }}
          />
        )
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: STEP.s4 }} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ marginTop: STEP.s2 }}>
            <Text style={{ ...TYPOGRAPHY.heading, color: C.text, maxWidth: 300 }}>Aynı hedef, üç tempo.</Text>
            <Text style={{ ...TYPOGRAPHY.body, color: C.text3, marginTop: STEP.s2, maxWidth: 306 }}>
              Hedef net değişmiyor. Değişen tek şey haftalık yük ve bandın nereye oturduğu.
            </Text>
          </Animated.View>

          <View style={{ marginTop: STEP.s3, gap: STEP.s1 }}>
            {scenarios.map((item, i) => (
              <Animated.View key={item.id}>
                <ScenarioCard
                  item={item}
                  selected={selected === item.multiplier}
                  locked={!canAccess}
                  onPress={() => selectScenario(item.multiplier)}
                />
              </Animated.View>
            ))}
          </View>

          <Card tone="surface" radius="panel" style={{ marginTop: STEP.s3 }}>
            <Text style={{ ...TYPOGRAPHY.caption, color: C.text2 }}>
              Bandın kalınlığı üç senaryoda da aynı: son 5 denemenin sapması. Tempo değişince
              hattın eğimi değişiyor, güven aralığı değişmiyor.
            </Text>
          </Card>

          <View style={{ marginTop: STEP.s4, gap: STEP.s2 }}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={applying}
              disabled={!selectedScenario}
              onPress={applyTempo}
              accessibilityLabel="Bu tempoyu uygula"
              accessibilityHint="Seçili senaryonun günlük soru hedefini uygular"
            >
              Bu tempoyu uygula
            </Button>
            <Button variant="ghost" size="md" fullWidth onPress={() => navigation.goBack()}>
              Şimdilik bakıyorum
            </Button>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
