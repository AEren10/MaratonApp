import { memo } from "react";
import { View, StyleSheet } from "react-native";
import { CompletionShell } from "./CompletionShell";
import { CompletionStats } from "./CompletionStats";
import { RouteArcLine } from "./RouteArcLine";
import { GUTTER } from "../../../themes/tokens";
import { formatNumber, formatMinutes } from "../../../lib/format";

function buildBody(daysLeft) {
  if (daysLeft != null && daysLeft >= 0) {
    return `Sınava ${formatNumber(daysLeft)} gün kaldı ve müfredatta kapatılmamış konu yok.`;
  }
  return "Müfredatta kapatılmamış konu yok.";
}

// "Rota Tamamlandi" (AKIS 16). Tetikleyici: route.totals.pending === 0 ve
// totals.topics > 0 (domain/route/completionMoments).
// Cikarilanlar: "359 gun" (rota baslangic tarihi tutulmuyor), "214 durak"
// (tamamlanan durak toplami yalniz son revizyonda var), eksen netleri
// (deneme listesi son 30 kayitla sinirli; "ilk deneme" guvenilir degil).
// "Sinav gunu planina bak" icin kayitli ekran yok; hedef verilmezse cizilmez.
export const RouteCompleteModal = memo(function RouteCompleteModal({
  visible,
  totalQuestions = 0,
  totalMinutes = 0,
  daysLeft = null,
  onClose,
  onExamDayPlan,
  onYearRoute,
}) {
  if (!visible) return null;

  return (
    <CompletionShell
      visible
      onClose={onClose}
      eyebrow="ROTA · SON DURAK"
      title="Rotanın tamamını yürüdün."
      body={buildBody(daysLeft)}
      primaryLabel={onExamDayPlan ? "Sınav günü planına bak" : null}
      onPrimary={onExamDayPlan}
      secondaryLabel={onYearRoute ? "Yılın rotasını gör" : null}
      onSecondary={onYearRoute}
    >
      <RouteArcLine />
      <View style={s.pad}>
        <CompletionStats
          items={[
            { label: "SORU", value: totalQuestions > 0 ? formatNumber(totalQuestions) : null },
            { label: "SÜRE", value: totalMinutes > 0 ? formatMinutes(totalMinutes) : null },
          ]}
        />
      </View>
    </CompletionShell>
  );
});

const s = StyleSheet.create({
  pad: { paddingHorizontal: GUTTER },
});
