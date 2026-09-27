import { Modal, Pressable, Text, View, StyleSheet } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle, useSharedValue, withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { QuickAddRow } from "./components/QuickAddRow";
import { Press } from "../../components/design/Press";

const DISMISS_DISTANCE = 90;

export default function QuickAddSheet({ visible, onClose, onAction }) {
  const C = useC();
  const translateY = useSharedValue(0);
  const sheetAnimStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  const close = () => { "worklet"; translateY.value = 0; scheduleOnRN(onClose); };

  const pan = Gesture.Pan()
    .onUpdate((e) => { if (e.translationY > 0) translateY.value = e.translationY; })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > 800) close();
      else translateY.value = withTiming(0);
    });

  const go = (screen, params) => {
    onClose();
    setTimeout(() => onAction(screen, params), 100);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Sayfa dışına dokun, kapat">
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
            <Press haptic="none" onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Kapat">
              <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>Kapat</Text>
            </Press>
          </View>

          {/* Tek niyet: kayit. "Simdi · Basla" karti kalkti -- siradaki duraga
              baslamak Ana sayfanin isi; burada "ne kaydediyorsun" sorusuyla
              yarisiyordu. Dort eylem tek duz liste, bolum basligi yok. */}
          <View style={[styles.section, { gap: STEP.s1 }]}>
            <QuickAddRow C={C} title="Çalışma kaydet" subtitle="Yaptığın çalışmayı gir · sayaç açmadan"
              icon="bookOpen"
              onPress={() => go(SCREENS.ADD_STUDY)} />
            <QuickAddRow C={C} title="Deneme gir" subtitle="Fotoğraftan veya elle"
              icon="target"
              onPress={() => go(SCREENS.TRIAL_ENTRY)} />
            <QuickAddRow C={C} title="Yanlış ekle" subtitle="Deftere soru kaydet"
              icon="notebook"
              onPress={() => go(SCREENS.ADD_WRONG)} />
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
