import { useEffect } from "react";
import { Modal, Pressable, Text, View, StyleSheet, useWindowDimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { SectionLabel } from "../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useQuickAddActions } from "../../hooks/useQuickAddActions";
import { QuickAddNowCard } from "./components/QuickAddNowCard";
import { QuickAddRow } from "./components/QuickAddRow";
import { Press } from "../../components/design/Press";

const DISMISS_DISTANCE = 90;

// Acilis ve kapanis TEK ilerleme degerinden: zemin kararmasi ile panelin
// kaymasi ayni egride, ayni surede. Eskiden Modal kendi "fade"ini yapiyor,
// panel ayri bir yayla sabit 500px'ten kalkiyordu -- panel 500'den uzun
// oldugu icin ilk karede yarisi gorunuyor, sonra zipliyordu. Egri iOS sheet
// egrisi; azaltilmis harekette yalniz kisa bir gecis.
const OPEN_EASE = Easing.bezier(0.32, 0.72, 0, 1);
const CLOSE_EASE = Easing.bezier(0.4, 0, 1, 1);

export default function QuickAddSheet({ visible, onClose, onAction }) {
  const C = useC();
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();
  const { nextAction, startScreen, startParams } = useQuickAddActions(visible);
  const progress = useSharedValue(0);
  const drag = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    drag.set(0);
    progress.set(0);
    progress.set(withTiming(1, { duration: reduced ? 160 : 420, easing: OPEN_EASE }));
  }, [visible, reduced, progress, drag]);

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.get()) * height + drag.get() }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: progress.get() * Math.max(0, 1 - drag.get() / height),
  }));

  // Kapanis animasyonu BITINCE panel kapanir ve (varsa) secilen sayfa acilir.
  // iOS'ta RN Modal kapanirken yeni modal ekran sunulamayabiliyor: panel
  // kapandiktan sonra kisa bir nefes.
  const finish = (screen, params) => {
    onClose();
    if (screen) setTimeout(() => onAction(screen, params), 80);
  };
  const closeThen = (screen, params) => {
    "worklet";
    progress.set(withTiming(0, { duration: reduced ? 140 : 260, easing: CLOSE_EASE }, (finished) => {
      if (finished) scheduleOnRN(finish, screen, params);
    }));
  };
  const close = () => { "worklet"; closeThen(null, undefined); };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      "worklet";
      drag.set(Math.max(0, e.translationY));
    })
    .onEnd((e) => {
      "worklet";
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > 700) close();
      else drag.set(withTiming(0, { duration: 220, easing: OPEN_EASE }));
    });

  const go = (screen, params) => closeThen(screen, params);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: C.scrim }, scrimStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Sayfa dışına dokun, kapat" />
        </Animated.View>
        <Animated.View
          style={[styles.sheet, { backgroundColor: C.bg, borderColor: C.edgeStrong }, sheetAnimStyle]}
        >
          <GestureDetector gesture={pan}>
            <View style={styles.handleZone}>
              <View style={[styles.handle, { backgroundColor: C.edgeStrong }]} />
            </View>
          </GestureDetector>

          <View style={styles.headerRow}>
            <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Ne yapmak istiyorsun?</Text>
            <Press haptic="none" onPress={close} hitSlop={10} accessibilityRole="button" accessibilityLabel="Kapat">
              <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>Kapat</Text>
            </Press>
          </View>

          <View style={styles.section}>
            <SectionLabel>ŞİMDİ ÇALIŞ</SectionLabel>
            <QuickAddNowCard C={C} nextAction={nextAction} onStart={() => go(startScreen, startParams)} />
          </View>

          <View style={styles.section}>
            {/* Calismaya baslamak (ust) ile yapilmis olani kaydetmek (alt) ayri:
                ikisi "kaydet" altinda karisiyordu. */}
            <SectionLabel>YAPTIĞINI KAYDET</SectionLabel>
            <View style={{ gap: STEP.s1 }}>
              <QuickAddRow C={C} title="Geçmiş çalışma" subtitle="Sayaçsız yaptığın çalışmayı gir"
                icon="bookOpen" iconColor={C.up}
                onPress={() => go(SCREENS.ADD_STUDY)} />
              <QuickAddRow C={C} title="Deneme gir" subtitle="Fotoğraftan veya elle"
                icon="target" iconColor={C.accent}
                onPress={() => go(SCREENS.TRIAL_ENTRY)} />
              <QuickAddRow C={C} title="Yanlış ekle" subtitle="Deftere soru kaydet"
                icon="notebook" iconColor={C.warn}
                onPress={() => go(SCREENS.ADD_WRONG)} />
            </View>
          </View>

          <View style={styles.section}>
            <SectionLabel>PLANA EKLE</SectionLabel>
            <QuickAddRow C={C} title="Durak ekle" subtitle="Programa · gün ve süre seçerek"
              icon="calendar" iconColor={C.blue}
              onPress={() => go(SCREENS.ADD_TASK)} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: SHAPE.sheet, borderTopRightRadius: SHAPE.sheet,
    borderWidth: 1, borderBottomWidth: 0,
    paddingHorizontal: STEP.s3, paddingBottom: STEP.s4,
  },
  handleZone: { alignItems: "center", paddingVertical: STEP.s1 },
  handle: { width: 40, height: 4, borderRadius: 2 },
  headerRow: {
    flexDirection: "row", alignItems: "baseline", justifyContent: "space-between",
    paddingBottom: STEP.s1, minHeight: CONTROL.tapMin / 2,
  },
  section: { marginTop: STEP.s3 },
});
