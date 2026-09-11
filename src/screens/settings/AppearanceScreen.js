import { useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, Card } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useTheme, useC } from "../../contexts/ThemeContext";
import { SettingsGroup } from "./components/SettingsGroup";
import { ThemeOptionRow } from "./components/ThemeOptionRow";

// Tasarim sirasi: Koyu (varsayilan) · Acik · Sistem.
const OPTIONS = [
  { key: "dark", label: "Koyu" },
  { key: "light", label: "Açık" },
  { key: "system", label: "Sistem", hint: "Cihazımın temasını kullan" },
];

export default function AppearanceScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { pref, setPref, accentKey, setAccent, accentPresets } = useTheme();
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Görünüm</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SettingsGroup>
          {OPTIONS.map((opt, i) => (
            <ThemeOptionRow
              key={opt.key}
              C={C}
              first={i === 0}
              label={opt.label}
              hint={opt.hint}
              active={pref === opt.key}
              onPress={() => setPref(opt.key)}
            />
          ))}
        </SettingsGroup>

        <Text style={[TYPOGRAPHY.meta, styles.note, { color: C.text3 }]}>
          Koyu tema varsayılan. Rota hattı ve ders renkleri iki temada da aynı;
          değişen yalnız zemin ve metin.
        </Text>

        {/* Tasarimda olmayan ama gercek islev: palet uc tohumdan turetildigi
            icin vurgu rengi degistirilebiliyor (bkz. colorMix.js). */}
        <SettingsGroup title="VURGU RENGİ">
          <View style={styles.swatchRow}>
            {accentPresets.map((preset) => {
              const swatch = pref === "light" ? preset.light : preset.dark;
              const active = accentKey === preset.key;
              return (
                <Pressable
                  key={preset.key}
                  onPress={() => setAccent(active ? null : preset.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={preset.name}
                  style={[
                    styles.swatch,
                    { backgroundColor: swatch, borderColor: active ? C.text : "transparent" },
                  ]}
                >
                  {active ? <Icon name="check" size={15} color={C.accentInk} sw={2.6} /> : null}
                </Pressable>
              );
            })}
          </View>
        </SettingsGroup>

        <Card tone="surface" radius="panel" style={styles.info}>
          <Text style={[TYPOGRAPHY.meta, { color: C.text2, lineHeight: 21 }]}>
            Vurgu rengini değiştirdiğinde tüm palet yeniden hesaplanır — kartlar,
            grafikler ve ısı haritası dahil.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
  },
  scroll: { paddingBottom: 60 },
  note: { marginHorizontal: GUTTER, marginTop: STEP.s2, lineHeight: 21 },
  swatchRow: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s2, padding: STEP.s3 },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: SHAPE.iconBox,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { marginHorizontal: GUTTER, marginTop: STEP.s4 },
});
