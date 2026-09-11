import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Icon, Card, EmptyState } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE, CONTROL } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useTrialCompare } from "../../hooks/useTrialCompare";
import { TrialPickerModal } from "./components/TrialPickerModal";
import { TrialCompareHero } from "./components/TrialCompareHero";
import { TrialCompareTable } from "./components/TrialCompareTable";
import { TrialComparePill } from "./components/TrialComparePill";

export default function TrialCompareScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const [pickerTarget, setPickerTarget] = useState(null);

  const {
    newer, older, setNewer, setOlder, sameTypeTrials,
    rows, canCompare, publisherMismatch, titles, hero,
  } = useTrialCompare(C, route.params || {});

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const pick = useCallback(
    (t) => (pickerTarget === "newer" ? setNewer(t) : setOlder(t)),
    [pickerTarget, setNewer, setOlder],
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.label, { color: C.text3, flex: 1 }]}>KARŞILAŞTIRMA</Text>
      </View>

      {!canCompare ? (
        <EmptyState
          title="Karşılaştırma için en az 2 deneme gerekli"
          body="İkinci denemeni girdiğinde iki sonucu ders ders yan yana koyarız."
          style={{ paddingHorizontal: GUTTER }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.pills}>
            <TrialComparePill C={C} label={titles.older} onPress={() => setPickerTarget("older")} />
            <TrialComparePill C={C} label={titles.newer} active onPress={() => setPickerTarget("newer")} />
          </View>

          <Animated.View entering={FadeInDown.duration(520)} style={{ marginTop: 30 }}>
            <TrialCompareHero C={C} {...hero} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(520)} style={{ marginTop: 28 }}>
            <TrialCompareTable
              C={C}
              rows={rows}
              olderLabel={hero.olderLabel}
              newerLabel={hero.newerLabel}
            />
          </Animated.View>

          {publisherMismatch && (
            <Card tone="surface" radius="panel" style={{ marginTop: 26 }}>
              <Text style={[TYPOGRAPHY.meta, { color: C.text2, lineHeight: 21 }]}>
                İki deneme aynı yayından değil. Zorluk farkı netlere yansır; bu yüzden
                karşılaştırma tek başına tempo göstergesi sayılmaz.
              </Text>
            </Card>
          )}

          <Pressable
            onPress={() => setPickerTarget("older")}
            accessibilityRole="button"
            accessibilityLabel="Başka deneme seç"
            style={({ pressed }) => [
              styles.footerBtn,
              { borderColor: C.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[TYPOGRAPHY.tableName, { fontFamily: "Archivo_600", color: C.text2 }]}>
              Başka deneme seç
            </Text>
          </Pressable>
        </ScrollView>
      )}

      <TrialPickerModal
        visible={pickerTarget !== null}
        trials={sameTypeTrials}
        selectedId={pickerTarget === "newer" ? newer?.id : older?.id}
        onSelect={pick}
        onClose={() => setPickerTarget(null)}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingHorizontal: GUTTER,
    height: CONTROL.tapMin,
  },
  scroll: { paddingHorizontal: GUTTER, paddingTop: 26, paddingBottom: 40 },
  pills: { flexDirection: "row", gap: STEP.s1 },
  footerBtn: {
    height: CONTROL.buttonPrimary,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },
});
