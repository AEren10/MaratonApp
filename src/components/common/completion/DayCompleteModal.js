import { memo } from "react";
import { View, StyleSheet } from "react-native";
import { CompletionShell } from "./CompletionShell";
import { CompletionStats } from "./CompletionStats";
import { CompletionNodeLine } from "./CompletionNodeLine";
import { GUTTER } from "../../../themes/tokens";
import { formatNumber, formatMinutes, formatDayMonth } from "../../../lib/format";

// "Gun Tamamlandi" (AKIS 16). Tetikleyici: bugunun plan kartindaki TUM
// maddeler isaretlendi (TodayPlanCard -> onAllDone -> useCompletionMoments).
// Tasarimdaki "YARIN SIRADA" bloku YOK: yarinin plani ancak yarin
// uretiliyor, arkasinda veri olmayan alan cizilmez.
export const DayCompleteModal = memo(function DayCompleteModal({
  visible,
  stopCount = 0,
  solvedToday = 0,
  minutesToday = 0,
  stopLabels = [],
  onClose,
  onSummary,
  onShare,
}) {
  if (!visible || stopCount < 1) return null;

  const dayLabel = formatDayMonth(new Date(), "").toLocaleUpperCase("tr-TR");
  const count = formatNumber(stopCount);

  return (
    <CompletionShell
      visible
      onClose={onClose}
      eyebrow={dayLabel ? `${dayLabel} · GÜN KAPANDI` : "GÜN KAPANDI"}
      title={`Bugünün ${count} durağı da tamam.`}
      body="Rota bugün planlandığı kadar ilerledi. Yarının durakları sabah açılır."
      primaryLabel="Günün özetine bak"
      onPrimary={onSummary}
      secondaryLabel={onShare ? "Kartı paylaş" : null}
      onSecondary={onShare}
    >
      <View style={s.pad}>
        <CompletionStats
          items={[
            { label: "ÇÖZÜLEN", value: solvedToday > 0 ? formatNumber(solvedToday) : null },
            { label: "SÜRE", value: minutesToday > 0 ? formatMinutes(minutesToday) : null },
            { label: "DURAK", value: `${count}/${count}` },
          ]}
        />
      </View>
      <CompletionNodeLine count={stopCount} labels={stopLabels} />
    </CompletionShell>
  );
});

const s = StyleSheet.create({
  pad: { paddingHorizontal: GUTTER },
});
