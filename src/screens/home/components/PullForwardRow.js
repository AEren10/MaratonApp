import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { useStopMoves } from "../../../hooks/useStopMoves";
import { todayTR } from "../../../lib/dateUtils";
import { CONTROL, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

// Haftanin duraklari bitti: gelecek haftanin ilk duragini bugune al.
// Tasima haritasina bugunun tarihi yazilir; rota o duragi bu haftaya aktarir
// ve ana sayfa, Program ve Rota ayni anda gunceller.
export function PullForwardRow({ stop }) {
  const C = useC();
  const { moveStop, loaded } = useStopMoves();
  const [busy, setBusy] = useState(false);
  if (!stop) return null;

  const pull = async () => {
    if (busy || !loaded) return;
    setBusy(true);
    const ok = await moveStop(stop.logicalStopKey, todayTR());
    if (ok) H.success(); else H.warn();
    setBusy(false);
  };

  const label = [stop.subjectLabel || stop.subject, stop.topic].filter(Boolean).join(" · ");
  return (
    <Press
      haptic="none"
      onPress={pull}
      disabled={busy || !loaded}
      accessibilityRole="button"
      accessibilityLabel={`Gelecek haftadan öne çek: ${label}`}
      style={[s.row, { borderColor: C.line, opacity: busy ? 0.6 : 1 }]}
    >
      <Icon name="plus" size={14} color={C.accentBright} />
      <View style={s.body}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Gelecek haftadan öne çek</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]} numberOfLines={1}>{label}</Text>
      </View>
      <Icon name="chevR" size={14} color={C.text3} />
    </Press>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2, minHeight: CONTROL.tapMin + STEP.s1,
    marginTop: STEP.s2, paddingVertical: STEP.s1, borderTopWidth: 1, borderBottomWidth: 1,
  },
  body: { flex: 1 },
});
