import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, Card, Button } from "../../components/design";
import { EmptyState } from "../../components/design/EmptyState";
import { GUTTER, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useThresholdView } from "../../hooks/useThresholdView";
import { ThresholdContributorRow } from "./components/ThresholdContributorRow";

// AKIŞ 2 · Bölüm Eşiği — Rota Detay'daki "72 net ≈ hangi bölümler?" bağlantısı.
//
// DOĞRULANMADI: mockup geçen yılın bölüm taban netlerini gösteriyor
// (örn. "Hacettepe · 65 net"). Kodda böyle bir taban-net veri kaynağı yok
// (src/data/programs.js sadece başarı sırası tutuyor). O blok bilerek
// render edilmiyor; onun yerine hedefe olan net açığı ve açığı kapatan
// gerçek konu verisi gösteriliyor.
export default function RankSimulatorScreen() {
  const navigation = useNavigation();
  const C = useC();
  const { targetNet, currentNet, daysUntilExam, gapResult, canAccess, requestAccess } = useThresholdView();

  if (targetNet == null || currentNet == null) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <Header onBack={() => navigation.goBack()} C={C} />
        <EmptyState
          eyebrow="NET EŞİĞİ"
          title="Eşik için hedef net gerekiyor"
          body="Hedef netini Hedeflerim'den belirle, en az bir deneme gir; açığı burada göreceksin."
          style={{ paddingHorizontal: GUTTER }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <Header onBack={() => navigation.goBack()} C={C} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: STEP.s4 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(420)} style={{ marginTop: STEP.s2 }}>
          <Text style={{ ...TYPOGRAPHY.heading, color: C.text, maxWidth: 300 }}>
            {targetNet} net nereye yeter?
          </Text>
          <Text style={{ ...TYPOGRAPHY.body, color: C.text3, marginTop: STEP.s2, maxWidth: 306 }}>
            {gapResult?.reached
              ? `Şu an ${currentNet.toFixed(1)} nettesin, hedefi zaten geçtin.`
              : `Şu an ${currentNet.toFixed(1)} net, hedefe ${gapResult?.gap ?? 0} net kaldı${daysUntilExam ? ` · ${daysUntilExam} gün` : ""}.`}
          </Text>
        </Animated.View>

        <Card tone="surface" radius="panel" style={{ marginTop: STEP.s3 }}>
          <Text style={{ ...TYPOGRAPHY.label, color: C.text3 }}>DOĞRULANMADI</Text>
          <Text style={{ ...TYPOGRAPHY.caption, color: C.text2, marginTop: STEP.s1 }}>
            Bölümlerin geçen yılki taban netleri bu sürümde veri kaynağı olarak yok.
            O yüzden burada bölüm listesi yerine hedefe olan gerçek net açığın var.
          </Text>
        </Card>

        {!gapResult?.reached && gapResult?.topContributors?.length > 0 ? (
          <View style={{ marginTop: STEP.s3 }}>
            <Text style={{ ...TYPOGRAPHY.label, color: C.text2, marginBottom: STEP.s2 }}>
              AÇIĞI KAPATAN KONULAR
            </Text>
            <View style={{ gap: STEP.s1 }}>
              {gapResult.topContributors.slice(0, 6).map((item, i) => (
                <Animated.View key={`${item.subject}-${item.topic}`} entering={FadeInDown.delay(60 + i * 50).duration(360)}>
                  <ThresholdContributorRow item={item} locked={!canAccess} />
                </Animated.View>
              ))}
            </View>
            {!canAccess ? (
              <Pressable onPress={requestAccess} accessibilityRole="button" accessibilityLabel="Kilidi aç" style={{ marginTop: STEP.s2, minHeight: 44, justifyContent: "center" }}>
                <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.accent, textAlign: "center" }}>Kilidi açmak için dokun</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {!gapResult?.reached && gapResult && !gapResult.reachable ? (
          <Card tone="surface" radius="panel" style={{ marginTop: STEP.s3, borderColor: C.red }}>
            <Text style={{ ...TYPOGRAPHY.caption, color: C.red }}>
              Tüm konular ustalaşılsa bile ulaşılabilir en yüksek net ~{gapResult.maxPossibleNet}.
              Hedef netini gözden geçirmek isteyebilirsin.
            </Text>
          </Card>
        ) : null}

        <Button
          variant="outline"
          size="lg"
          fullWidth
          style={{ marginTop: STEP.s4 }}
          onPress={() => navigation.navigate(SCREENS.ROADMAP)}
        >
          Rotanın tamamını gör
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ onBack, C }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s2 }}>
      <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri" accessibilityHint="Önceki ekrana döner" style={{ minWidth: 44, minHeight: 44, justifyContent: "center" }}>
        <Icon name="arrowL" size={22} color={C.text} />
      </Pressable>
      <Text style={{ ...TYPOGRAPHY.label, color: C.text3, marginLeft: STEP.s1 }}>NET EŞİĞİ</Text>
    </View>
  );
}
