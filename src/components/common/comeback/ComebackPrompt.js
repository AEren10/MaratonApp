import { View, Text, StyleSheet } from "react-native";
import { CompletionShell } from "../completion/CompletionShell";
import { ComebackRouteArt } from "./ComebackRouteArt";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { formatNumber } from "../../../lib/format";

// Donus duragi tasarimda sabit tanimli: 20 dk = 10 dk tekrar + 10 soru.
const RETURN_STOP_MINUTES = 20;
const STEPS = [
  { text: "10 dakika konu tekrarı", tone: "accent" },
  { text: "10 soru", tone: "accent" },
  { text: "Tamamla ve rotaya geri dön", tone: "up" },
];

function StopRow({ text, tone }) {
  const C = useC();
  return (
    <View style={s.stepRow}>
      <View style={[s.dot, { backgroundColor: tone === "up" ? C.up : C.accent }]} />
      <Text style={[TYPOGRAPHY.captionMedium, { flex: 1, color: C.text2 }]}>{text}</Text>
    </View>
  );
}

// "Geri Donus" (AKIS 14) — uzun aradan sonra ilk acilis.
// Esik useRetention ile ayni: daysAway >= 2. Telafi dili YOK.
// pendingStops: rotanin bu haftasinda COMPLETED olmayan durak sayisi.
export function ComebackPrompt({ pendingStops, onStart, onPickStop, onClose }) {
  const C = useC();
  const gapLabel = pendingStops > 0
    ? `BEKLEYEN ${formatNumber(pendingStops)} DURAK`
    : null;

  return (
    <CompletionShell
      visible
      onClose={onClose}
      eyebrow="ROTAN YERİNDE"
      eyebrowMuted
      title="Rota seni bekliyor."
      body="Bugünü telafi etmeye çalışma. Sadece küçük bir durakla yeniden ritim yakala."
      primaryLabel={`${RETURN_STOP_MINUTES} dakikayla dön`}
      onPrimary={onStart}
      secondaryLabel={onPickStop ? "Başka bir durak seç" : null}
      onSecondary={onPickStop}
    >
      <ComebackRouteArt stage="prompt" gapLabel={gapLabel} />

      <View style={s.pad}>
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <View style={s.cardHead}>
            <Text style={[TYPOGRAPHY.label, { color: C.accentBright, flex: 1 }]}>DÖNÜŞ DURAĞI</Text>
            <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]} allowFontScaling={false}>
              {formatNumber(RETURN_STOP_MINUTES)}
            </Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>dk</Text>
          </View>
          <View style={s.steps}>
            {STEPS.map((step) => (
              <StopRow key={step.text} text={step.text} tone={step.tone} />
            ))}
          </View>
        </View>
      </View>
    </CompletionShell>
  );
}

const s = StyleSheet.create({
  pad: { paddingHorizontal: GUTTER },
  card: { padding: STEP.s3, borderRadius: SHAPE.sheet, borderWidth: 1 },
  cardHead: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  steps: { gap: STEP.s2, marginTop: STEP.s3 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  dot: { width: 6, height: 6 },
});
