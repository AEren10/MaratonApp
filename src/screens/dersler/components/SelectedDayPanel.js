import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC, useTheme } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { formatMinutes } from "../../../lib/format";
import * as H from "../../../lib/haptics";

function StopRow({ log, C, solid }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s1 + 5, paddingVertical: STEP.s2, borderTopWidth: 1, borderTopColor: C.line }}>
      {log.time ? (
        <Text style={{ ...TYPOGRAPHY.metaSemiBold, width: 40, color: C.muted, fontVariant: ["tabular-nums"] }}>{log.time}</Text>
      ) : null}
      <View style={{ width: 7, height: 7, borderRadius: 1, backgroundColor: solid }} />
      <Text style={{ ...TYPOGRAPHY.body, fontSize: 13.5, color: C.muted, textDecorationLine: "line-through", flex: 1 }} numberOfLines={1}>
        {log.topic ? `${log.subjectLabel} · ${log.topic}` : log.subjectLabel}
      </Text>
      <Text style={{ fontFamily: "Archivo_700", fontSize: 11, letterSpacing: 1.2, color: C.up }}>BİTTİ</Text>
    </View>
  );
}

export function SelectedDayPanel({ selectedDay, logs }) {
  const C = useC();
  const { subject: subjectId } = useTheme();
  const navigation = useNavigation();

  const dateLabel = useMemo(() => {
    const d = new Date(selectedDay.key);
    const weekday = d.toLocaleDateString("tr-TR", { weekday: "long" }).toUpperCase();
    const rest = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" }).toUpperCase();
    return `${weekday} · ${rest}`;
  }, [selectedDay.key]);

  const totalMinutes = logs.reduce((s, l) => s + (l.minutes || 0), 0);
  const meta = logs.length > 0 ? `${logs.length} oturum · ${formatMinutes(totalMinutes)}` : null;

  return (
    <View style={{ marginTop: STEP.s3 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: STEP.s1 }}>
        <Text style={{ ...TYPOGRAPHY.label, color: C.sec }}>{dateLabel}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
        {meta ? <Text style={{ ...TYPOGRAPHY.meta, color: C.muted }}>{meta}</Text> : null}
      </View>

      {logs.length > 0 ? (
        <View style={{ marginTop: STEP.s1 }}>
          {logs.map((log) => (
            <StopRow key={log.id} log={log} C={C} solid={subjectId(log.subjectKey).solid} />
          ))}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Bu güne durak ekle"
        onPress={() => { H.tap(); navigation.navigate(SCREENS.ADD_TASK); }}
        style={{
          flexDirection: "row", alignItems: "center", gap: STEP.s1 + 3, minHeight: 44,
          marginTop: STEP.s2, paddingHorizontal: STEP.s2, borderRadius: SHAPE.cardTight,
          borderWidth: 1, borderColor: C.elev, borderStyle: "dashed",
        }}
      >
        <Icon name="plus" size={13} color={C.accent} sw={1.7} />
        <Text style={{ ...TYPOGRAPHY.bodySemiBold, fontSize: 13, color: C.accentBright, flex: 1 }}>
          {"Bu güne durak ekle"}
        </Text>
      </Pressable>
    </View>
  );
}
