import { useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, Card } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useLevelProgress } from "../../hooks/useLevelProgress";
import { LevelHero } from "./components/LevelHero";
import { LevelPathRow } from "./components/LevelPathRow";

// Tasarim: "Seviye" (Profil > SEVIYE satiri). XP sunucu otoritesinde,
// bu ekran yalniz gosterim yapar.
const NOTE =
  "Halka emeği ölçer, rota sonucu. Neti düşen hafta bile soru ve süre XP " +
  "kazandırır — bu yüzden ikisi aynı soruya cevap vermiyor.";

export default function LevelScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { badge, heroXP, targetLabel, remainingLabel, progress, path } = useLevelProgress();

  const renderItem = useCallback(
    ({ item, index }) => (
      <LevelPathRow
        name={item.name}
        xpLabel={item.xpLabel}
        state={item.state}
        isFirst={index === 0}
        isLast={index === path.length - 1}
      />
    ),
    [path.length],
  );

  const keyExtractor = useCallback((item) => item.key, []);

  const header = (
    <>
      <Animated.View entering={FadeInDown.delay(60).duration(500)}>
        <LevelHero
          badge={badge}
          heroXP={heroXP}
          targetLabel={targetLabel}
          remainingLabel={remainingLabel}
          progress={progress}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(140).duration(500)}>
        <Card tone="surface" radius="panel" style={styles.note}>
          <Text style={[TYPOGRAPHY.meta, { color: C.text2, lineHeight: 20 }]}>{NOTE}</Text>
        </Card>
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(200).duration(500)}
        style={[TYPOGRAPHY.label, styles.sectionLabel, { color: C.text2 }]}
      >
        SEVİYE YOLU
      </Animated.Text>
    </>
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable
          onPress={navigation.goBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Geri"
          style={styles.backBtn}
        >
          <Icon name="chevL" size={16} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Seviye</Text>
      </View>

      <FlatList
        data={path}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={header}
        ListFooterComponent={
          /* Tasarim bu satiri Seviye artboardinda gosteriyor. Ekran o sirada
             yoktu, simdi var -- baglandi. Kilometre Tasi'nin baska giris
             noktasi yok, bu satir olmazsa erisilemez kalirdi. */
          <Pressable
            onPress={() => navigation.navigate(SCREENS.MILESTONE)}
            accessibilityRole="button"
            accessibilityLabel="Kilometre taşlarını gör"
            style={({ pressed }) => [styles.milestoneRow, { borderColor: C.border, opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]}>
              Kilometre taşlarını gör
            </Text>
            <Icon name="chevR" size={13} color={C.text3} />
          </Pressable>
        }
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingLeft: GUTTER - 10, paddingRight: GUTTER, paddingVertical: STEP.s1,
  },
  backBtn: {
    width: CONTROL.tapMin, height: CONTROL.tapMin,
    alignItems: "center", justifyContent: "center",
  },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: STEP.s4 },
  note: { marginTop: STEP.s3 },
  sectionLabel: { marginTop: STEP.s4, marginBottom: STEP.s2 },
  milestoneRow: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2,
    minHeight: CONTROL.tapMin, marginTop: STEP.s4,
    paddingHorizontal: STEP.s3, borderRadius: SHAPE.sheet, borderWidth: 1,
  },
});
