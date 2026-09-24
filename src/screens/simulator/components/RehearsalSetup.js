import { View, Text, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { Card } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { formatRehearsalDate, sessionLabel } from "../../../domain/exam/examRehearsal";
import { RehearsalRow, RehearsalOptions, RehearsalInput } from "./RehearsalRow";


// Tasarim "Deneme Provası" govdesi: baslik, dort satirlik form, PROVA GUNU
// listesi ve not. Butonlar ekran dosyasinda.
export function RehearsalSetup({ r }) {
  const C = useC();
  const { form, open, toggleOpen, update } = r;
  const rules = [r.reminder, "O gün başka durak açılmaz", "Süre dolunca netleri elle girersin"].filter(Boolean);

  return (
    <View>
      <Animated.View style={s.intro}>
        <Text style={[TYPOGRAPHY.heading, s.title, { color: C.text }]}>Sınav saatinde prova.</Text>
        <Text style={[TYPOGRAPHY.body, s.sub, { color: C.text3 }]}>
          Gerçek oturum uzunluğu, gerçek saat. Prova sonrası netler rotaya işlenir.
        </Text>
      </Animated.View>

      <Animated.View style={s.block}>
        <Card tone="surface" radius="sheet" padded={false} style={[s.form, { borderColor: C.elev }]}>
          <RehearsalRow label="Tarih" value={formatRehearsalDate(form.dateKey)} open={open === "date"} onToggle={() => toggleOpen("date")}>
            <RehearsalOptions
              options={r.dateOptions.map((k) => ({ value: k, label: formatRehearsalDate(k) }))}
              selected={form.dateKey}
              onSelect={(v) => update("dateKey", v)}
            />
          </RehearsalRow>
          <RehearsalRow label="Başlangıç" value={form.start} open={open === "start"} onToggle={() => toggleOpen("start")}>
            <RehearsalInput time label="Başlangıç" value={form.start} onChange={(v) => update("start", v)} />
          </RehearsalRow>
          <RehearsalRow label="Oturum" value={sessionLabel(r.session)} open={open === "session"} onToggle={() => toggleOpen("session")}>
            <RehearsalOptions
              options={r.sessions.map((x) => ({ value: x.key, label: sessionLabel(x) }))}
              selected={form.sessionKey}
              onSelect={(v) => update("sessionKey", v)}
            />
          </RehearsalRow>
          <RehearsalRow last label="Kaynak" value={form.source || "—"} open={open === "source"} onToggle={() => toggleOpen("source")}>
            <RehearsalInput label="Kaynak" value={form.source} onChange={(v) => update("source", v)} />
          </RehearsalRow>
        </Card>
      </Animated.View>

      <Animated.View style={s.blockTight}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>PROVA GÜNÜ</Text>
        <View style={s.rules}>
          {rules.map((text) => (
            <View key={text} style={[s.rule, { backgroundColor: C.surface, borderColor: C.elev }]}>
              <View style={[s.dot, { backgroundColor: C.accent }]} />
              <Text style={[TYPOGRAPHY.caption, s.ruleText, { color: C.text2 }]}>{text}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View style={s.blockTight}>
        <View style={[s.note, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.meta, { color: C.text2, lineHeight: 20 }]}>
            Prova netleri tahmin bandına girer ama seriyi bozmaz. Yarım bırakırsan kayıt açılmaz.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  intro: { paddingTop: STEP.s4 - 2 },
  title: { maxWidth: 300 },
  sub: { marginTop: STEP.s2 + 2, maxWidth: 306 },
  block: { marginTop: STEP.s4 - 4 },
  blockTight: { marginTop: STEP.s3 + 6 },
  form: { paddingHorizontal: STEP.s3, paddingTop: 6, paddingBottom: STEP.s1 },
  rules: { gap: STEP.s1, marginTop: STEP.s2 + 2 },
  rule: {
    flexDirection: "row", alignItems: "center", gap: 13,
    paddingVertical: 15, paddingHorizontal: 16, borderRadius: SHAPE.panel, borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 1 },
  ruleText: { flex: 1 },
  note: { paddingVertical: 18, paddingHorizontal: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1 },
});
