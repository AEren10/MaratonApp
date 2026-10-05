import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../design";
import { Press } from "../design/Press";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { STEP, TYPOGRAPHY } from "../../themes/tokens";
import * as H from "../../lib/haptics";

// Rota yetismiyorsa durust tek satir (domain/route/feasibility). Kirmizi
// degil: kotu haber bagirmaz (warn). Dokununca gunluk hedef duzenlenir.
export const RouteFeasibilityNote = memo(function RouteFeasibilityNote({ note, style }) {
  const C = useC();
  const navigation = useNavigation();
  if (!note) return null;
  return (
    <Press
      haptic="none"
      accessibilityRole="button"
      accessibilityLabel={`${note.title}. ${note.detail} Günlük hedefi güncelle`}
      onPress={() => { H.tap(); navigation.navigate(SCREENS.GOALS); }}
      style={[s.row, { borderColor: C.line }, style]}
    >
      <View style={[s.dot, { backgroundColor: C.warn }]} />
      <View style={s.body}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{note.title}</Text>
        <Text style={[TYPOGRAPHY.meta, s.detail, { color: C.text2 }]}>{note.detail}</Text>
        <Text style={[TYPOGRAPHY.metaSemiBold, s.action, { color: C.text }]}>Günlük hedefi güncelle</Text>
      </View>
      <Icon name="chevR" size={16} color={C.text3} />
    </Press>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2,
    paddingVertical: STEP.s2 + 2, borderTopWidth: 1, borderBottomWidth: 1, minHeight: 44,
  },
  dot: { width: 8, height: 8, borderRadius: 4, alignSelf: "flex-start", marginTop: 7 },
  body: { flex: 1 },
  detail: { marginTop: 2 },
  action: { marginTop: STEP.s1 },
});
