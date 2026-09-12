import React, { useCallback, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { Button } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { useProPreviewData } from "../../hooks/useProPreviewData";
import { PRO_PREVIEW } from "../../constants/proPitch";
import { SCREENS } from "../../constants/screens";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE, CONTROL } from "../../themes/tokens";
import * as H from "../../lib/haptics";
import { ProPreviewHave } from "./components/ProPreviewHave";
import { ProLockedRow } from "./components/ProLockedRow";

// Tasarim: "Pro Onizleme". Kilitli bir ozellige ILK dokunusta bu cikar,
// odeme ekrani degil: ustte kullanicinin kendi ucretsiz verisi, altinda
// kilitli alan. Birincil buton baglama ozel paywall'a goturur.
const GHOST_WIDTHS = [42, 30, 36, 48];

export default function ProPreviewScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const s = useMemo(() => makeStyles(C), [C]);
  const { rows } = useProPreviewData();

  const source = route.params?.source;
  const dismiss = useCallback(() => { H.tap(); navigation.goBack(); }, [navigation]);
  const openPaywall = useCallback(() => {
    H.select();
    navigation.replace(SCREENS.PAYWALL, { source: source || "pro_preview" });
  }, [navigation, source]);

  return (
    <View style={s.root}>
      <Animated.View entering={FadeIn.duration(520)} style={styles.fill}>
        <Pressable
          style={[styles.fill, { backgroundColor: C.scrim }]}
          onPress={dismiss}
          accessibilityRole="button"
          accessibilityLabel={PRO_PREVIEW.secondary}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(620)}
        style={[s.sheet, { paddingBottom: insets.bottom + STEP.s3 }]}
      >
        <View style={[s.grabber, { backgroundColor: C.elev }]} />
        <Text style={[TYPOGRAPHY.subheading, s.title, { color: C.text }]}>{PRO_PREVIEW.title}</Text>

        <View style={s.block}>
          <ProPreviewHave rows={rows} />
        </View>

        <View style={s.block}>
          <View style={s.labelRow}>
            <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>
              {PRO_PREVIEW.unlockLabel}
            </Text>
            <View style={[s.hairline, { backgroundColor: C.line }]} />
          </View>
          {PRO_PREVIEW.locked.map((label, i) => (
            <ProLockedRow key={label} label={label} width={GHOST_WIDTHS[i] || 40} />
          ))}
        </View>

        <Text style={[TYPOGRAPHY.meta, s.body, { color: C.text3 }]}>{PRO_PREVIEW.body}</Text>

        <Button onPress={openPaywall} size="lg" fullWidth style={s.cta}>
          {PRO_PREVIEW.primary}
        </Button>
        <Pressable onPress={dismiss} style={s.secondary} accessibilityRole="button">
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>{PRO_PREVIEW.secondary}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({ fill: { ...StyleSheet.absoluteFillObject } });

function makeStyles(C) {
  return StyleSheet.create({
    root: { flex: 1, justifyContent: "flex-end" },
    sheet: {
      backgroundColor: C.bg,
      borderTopWidth: 1,
      borderTopColor: C.elev,
      borderTopLeftRadius: SHAPE.sheet,
      borderTopRightRadius: SHAPE.sheet,
      paddingHorizontal: GUTTER,
      paddingTop: STEP.s2,
    },
    grabber: { width: 38, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: STEP.s3 },
    title: { maxWidth: 280 },
    block: { marginTop: STEP.s3 },
    labelRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
    hairline: { flex: 1, height: 1 },
    body: { marginTop: STEP.s1 * 2, lineHeight: 20 },
    cta: { marginTop: STEP.s3 },
    secondary: {
      height: CONTROL.tapMin,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
  });
}
