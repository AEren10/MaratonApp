import { useEffect } from "react";
import { Modal, Pressable, Text, View, StyleSheet } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle, useSharedValue, withTiming, withSpring,
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

export default function QuickAddSheet({ visible, onClose, onAction }) {
  const C = useC();
  const { nextAction, startScreen, startParams } = useQuickAddActions(visible);
  const translateY = useSharedValue(500);
  const sheetAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  useEffect(() => {
    if (visible) {
      translateY.value = 500;
      translateY.value = withSpring(0, { damping: 18, stiffness: 280 });
    }
  }, [visible]);

  // Kapanis animasyonu BITINCE panel kapanir ve (varsa) secilen sayfa acilir.
  // Eskiden sayfa ayri bir 220 ms zamanlayicisiyla aciliyordu ve kapanisla
  // yarisiyordu; Modal hala acikken yeni ekran gelebiliyordu.
  // iOS'ta RN Modal kapanirken yeni modal ekran sunulamayabiliyor: panel
  // kapandiktan sonra kisa bir nefes.
  const finish = (screen, params) => {
    onClose();
    if (screen) setTimeout(() => onAction(screen, params), 80);
  };
  const closeThen = (screen, params) => {
    "worklet";
    translateY.value = withTiming(500, { duration: 220 }, (finished) => {
      if (finished) scheduleOnRN(finish, screen, params);
    });
  };
  const close = () => {
    "worklet";
    closeThen(null, undefined);
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      "worklet";
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      "worklet";
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > 700) {
        close();
      } else {
        translateY.value = withSpring(0, { damping: 18, stiffness: 280 });
      }
    });

  const go = (screen, params) => closeThen(screen, params);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Sayfa dışına dokun, kapat">
        <Animated.View
          style={[styles.sheet, { backgroundColor: C.bg, borderColor: C.border }, sheetAnimStyle]}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={StyleSheet.absoluteFill} />
          <GestureDetector gesture={pan}>
            <View style={styles.handleZone}>
              <View style={[styles.handle, { backgroundColor: C.border }]} />
            </View>
          </GestureDetector>

          <View style={styles.headerRow}>
            <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Ne kaydediyorsun?</Text>
            <Press haptic="none" onPress={close} hitSlop={10} accessibilityRole="button" accessibilityLabel="Kapat">
              <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>Kapat</Text>
            </Press>
          </View>

          <View style={styles.section}>
            <SectionLabel>ŞİMDİ</SectionLabel>
            <QuickAddNowCard C={C} nextAction={nextAction} onStart={() => go(startScreen, startParams)} />
          </View>

          <View style={styles.section}>
            <SectionLabel>KAYDET</SectionLabel>
            <View style={{ gap: STEP.s1 }}>
              <QuickAddRow C={C} title="Çalışma kaydet" subtitle="Yaptığın çalışmayı gir · sayaç açmadan"
                icon="bookOpen"
                onPress={() => go(SCREENS.ADD_STUDY)} />
              <QuickAddRow C={C} title="Deneme gir" subtitle="Fotoğraftan veya elle"
                icon="target"
                onPress={() => go(SCREENS.TRIAL_ENTRY)} />
              <QuickAddRow C={C} title="Yanlış ekle" subtitle="Deftere soru kaydet"
                icon="notebook"
                onPress={() => go(SCREENS.ADD_WRONG)} />
            </View>
          </View>

          <View style={styles.section}>
            <SectionLabel>PLANA EKLE</SectionLabel>
            <QuickAddRow C={C} title="Durak ekle" subtitle="Programa · gün ve süre seçerek"
              icon="calendar"
              onPress={() => go(SCREENS.ADD_TASK)} />
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(6,4,4,0.74)", justifyContent: "flex-end" },
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
