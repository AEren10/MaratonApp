import { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

import { useRouteConfirm } from "../../hooks/useRouteConfirm";
import { RouteConfirmLayout } from "./components/RouteConfirmLayout";
import { RouteNumbersCard } from "./components/RouteNumbersCard";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../themes/tokens";

const OPTIONS = [
  { id: "week", label: "1 hafta" },
  { id: "month", label: "1 ay" },
  { id: "indefinite", label: "Belirsiz" },
];

export default function RoutePauseScreen() {
  const d = useRouteConfirm();
  const C = useC();
  const [duration, setDuration] = useState("month");

  return (
    <RouteConfirmLayout
      title="Rotayı dondurmak bırakmak değil."
      body="Rotan olduğu gibi kalır. Bildirimler durur, seri sayacı donar, hiçbir şey silinmez."
      primaryLabel="Rotayı dondur"
      onPrimary={() => d.confirmPause({ duration })}
      loading={d.pausing}
      cancelLabel="Vazgeç, devam ediyorum"
      onCancel={d.goBack}
    >
      <RouteNumbersCard label="DONDURULAN" loading={d.statsLoading} stats={d.frozenStats} />
      
      <View style={s.segmentWrap}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3, marginBottom: STEP.s2 }]}>NE KADAR</Text>
        <View style={s.segmentRow}>
          {OPTIONS.map((opt) => {
            const isSelected = duration === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setDuration(opt.id)}
                style={[
                  s.segmentItem,
                  { backgroundColor: C.surface, borderColor: isSelected ? C.accent : C.border },
                  isSelected && { backgroundColor: C.brandTint },
                ]}
              >
                <Text style={[TYPOGRAPHY.bodyMedium, { color: isSelected ? C.text : C.text3 }]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </RouteConfirmLayout>
  );
}

const s = StyleSheet.create({
  segmentWrap: { marginTop: STEP.s3 },
  segmentRow: { flexDirection: "row", gap: STEP.s1 },
  segmentItem: {
    flex: 1,
    height: 48,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
