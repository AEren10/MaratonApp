import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Icon } from "../design/Icon";
import { useC } from "../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import * as H from "../../lib/haptics";

const WIDTH = 224;
const ROW = CONTROL.tapMin;
const EDGE = 12;

// Dokunulan yerin yaninda acilan kucuk menu (kullanici, 4 Ekim): ekrani
// kaplayan dev butonlu uyari yerine. Dokunus noktasindan acilir, ekrana
// sigacak sekilde kaydirilir; disari dokununca kapanir.
// items: [{ label, icon, onPress, destructive }]
export function AnchoredMenu({ visible, anchor, title, items = [], onClose }) {
  const C = useC();
  const { width: W, height: Hh } = useWindowDimensions();
  const h = items.length * ROW + (title ? 36 : 0) + STEP.s1;
  const ax = anchor?.x ?? W / 2;
  const ay = anchor?.y ?? Hh / 2;
  const left = Math.min(Math.max(EDGE, ax - WIDTH / 2), W - WIDTH - EDGE);
  // Alta sigmiyorsa dokunusun ustunde acilir.
  const below = ay + 12 + h < Hh - 40;
  const top = below ? ay + 12 : Math.max(EDGE + 40, ay - 12 - h);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Menüyü kapat" />
      {visible ? (
        <Animated.View
          entering={FadeIn.duration(140)}
          accessibilityViewIsModal
          style={[s.card, { left, top, backgroundColor: C.elev, borderColor: C.line }]}
        >
          {title ? (
            <Text numberOfLines={1} style={[TYPOGRAPHY.metaSemiBold, s.title, { color: C.text3 }]}>{title}</Text>
          ) : null}
          {items.map((it, i) => (
            <Pressable
              key={it.label}
              accessibilityRole="button"
              onPress={() => { H.tap(); onClose(); it.onPress?.(); }}
              style={({ pressed }) => [s.row, i > 0 && { borderTopColor: C.line, borderTopWidth: StyleSheet.hairlineWidth },
                pressed && { backgroundColor: C.surface }]}
            >
              <Text style={[TYPOGRAPHY.bodyMedium, s.label, { color: it.destructive ? C.danger : C.text }]}>{it.label}</Text>
              {it.icon ? <Icon name={it.icon} size={17} color={it.destructive ? C.danger : C.text2} /> : null}
            </Pressable>
          ))}
        </Animated.View>
      ) : null}
    </Modal>
  );
}

const s = StyleSheet.create({
  card: { position: "absolute", width: WIDTH, borderRadius: SHAPE.panel, borderWidth: 1, overflow: "hidden", paddingBottom: STEP.s1 / 2 },
  title: { paddingHorizontal: STEP.s2 + 4, paddingTop: STEP.s2, paddingBottom: 4 },
  row: { minHeight: ROW, flexDirection: "row", alignItems: "center", paddingHorizontal: STEP.s2 + 4 },
  label: { flex: 1 },
});
