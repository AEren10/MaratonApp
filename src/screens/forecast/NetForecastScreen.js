import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useC } from "../../contexts/ThemeContext";
import { Icon, Card, Button } from "../../components/design";
import { EmptyState } from "../../components/design/EmptyState";
import { GUTTER, STEP, TYPOGRAPHY, SHAPE } from "../../themes/tokens";
import { useScenarioView } from "../../hooks/useScenarioView";
import { ScenarioCard } from "./components/ScenarioCard";

// AKIŞ 2 · Senaryolar — Rota Detay'daki "Senaryoları aç" satırının hedefi.
// Üç tempo senaryosu aynı hedef netini farklı haftalık yükle çiziyor.
export default function NetForecastScreen() {
  const navigation = useNavigation();
  const C = useC();
  const {
    forecast, scenarios, selected, selectedScenario,
    selectScenario, applyTempo, applying, canAccess,
  } = useScenarioView();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s2 }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" accessibilityHint="Önceki ekrana döner" style={{ minWidth: 44, minHeight: 44, justifyContent: "center" }}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={{ ...TYPOGRAPHY.label, color: C.text3, marginLeft: STEP.s1 }}>SENARYOLAR</Text>
      </View>

      {!forecast || !scenarios?.length ? (
        <EmptyState
          eyebrow="SENARYOLAR"
          title="Senaryolar için veriye ihtiyacın var"
          body="En az 3 aynı tip deneme ve bir rota gerekiyor. Önce deneme gir, rota oluşsun."
          style={{ paddingHorizontal: GUTTER }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: STEP.s4 }} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(420)} style={{ marginTop: STEP.s2 }}>
            <Text style={{ ...TYPOGRAPHY.heading, color: C.text, maxWidth: 300 }}>Aynı hedef, üç tempo.</Text>
            <Text style={{ ...TYPOGRAPHY.body, color: C.text3, marginTop: STEP.s2, maxWidth: 306 }}>
              Hedef net değişmiyor. Değişen tek şey haftalık yük ve bandın nereye oturduğu.
            </Text>
          </Animated.View>

          <View style={{ marginTop: STEP.s3, gap: STEP.s1 }}>
            {scenarios.map((item, i) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(80 + i * 60).duration(420)}>
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
