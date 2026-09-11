import React from "react";
import { View, Text } from "react-native";
import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { formatMinutes } from "../../../lib/format";

// Tasarimin "BU HAFTA" kartı — hero metrik olarak "durak" yerine "aktif
// gün" kullanıyor: uygulamada haftalık plan geçmişe dönük "durak" sayısı
// üretmiyor, ama aktif gün / soru / dakika study_logs'tan gerçek.
export function WeekProgressCard({ rangeLabel, activeDaysCount, totalMinutes, totalQuestions }) {
  const C = useC();
  const pct = Math.min(1, activeDaysCount / 7);

  return (
    <Card tone="surface" radius="card" style={{ marginTop: STEP.s2 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: STEP.s1 }}>
        <Text style={{ ...TYPOGRAPHY.label, color: C.sec }}>BU HAFTA</Text>
        <View style={{ flex: 1 }} />
        <Text style={{ ...TYPOGRAPHY.meta, color: C.muted }}>{rangeLabel}</Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: STEP.s1, marginTop: STEP.s2 }}>
        <Text style={{ ...TYPOGRAPHY.statLarge, color: C.text }}>{activeDaysCount}</Text>
        <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.muted, paddingBottom: 7 }}>
          {"/ 7 gün çalışıldı"}
        </Text>
      </View>

      <View style={{ height: 5, marginTop: STEP.s2, borderRadius: SHAPE.chip / 2, backgroundColor: C.track, overflow: "hidden" }}>
        <View style={{ height: 5, borderRadius: SHAPE.chip / 2, backgroundColor: C.accent, width: `${Math.round(pct * 100)}%` }} />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: STEP.s1 }}>
        <Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>{`${formatMinutes(totalMinutes)} çalışıldı`}</Text>
        <Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>{`${totalQuestions} soru çözüldü`}</Text>
      </View>
    </Card>
  );
}
