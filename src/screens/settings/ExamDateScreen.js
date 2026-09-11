import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon, Card, Button, StatBlock } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExamDatePicker } from "../../hooks/useExamDatePicker";
import { MonthDayGrid } from "./components/MonthDayGrid";

// Tasarim: "Tarih Secici". Ayarlar > Sinav tarihi satirindan aciliyor.
// Uc sayi (gun / hafta / durak-hafta) TURETILMIS: gun tarihten, hafta
// gunden, yuk kalan durak / kalan hafta. Rota bastan hesaplanmiyor.
export default function ExamDateScreen() {
  const C = useC();
  const {
    monthLabel, selectedDay, heroDay, heroMonth, caption, summary,
    minDate, cursor, changed, selectDay, shiftMonth, save, cancel, saving,
  } = useExamDatePicker();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={cancel} hitSlop={12} accessibilityRole="button" accessibilityLabel="Kapat">
          <Icon name="x" size={15} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Sınav tarihi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <StatBlock value={heroDay ?? "—"} size="page" />
          <View style={styles.heroText}>
            {heroMonth ? (
              <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>{heroMonth}</Text>
            ) : null}
            {caption ? (
              <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 4 }]}>{caption}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.monthRow}>
          <Pressable
            onPress={() => shiftMonth(-1)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Önceki ay"
            style={styles.monthBtn}
          >
            <Icon name="chevL" size={14} color={C.text2} />
          </Pressable>
          <Text style={[TYPOGRAPHY.bodySemiBold, styles.monthLabel, { color: C.text }]}>
            {monthLabel}
          </Text>
          <Pressable
            onPress={() => shiftMonth(1)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Sonraki ay"
            style={styles.monthBtn}
          >
            <Icon name="chevR" size={14} color={C.text2} />
          </Pressable>
        </View>

        <MonthDayGrid
          C={C}
          year={cursor.year}
          month={cursor.month}
          selectedDay={selectedDay}
          minDate={minDate}
          onSelectDay={selectDay}
        />

        {summary ? (
          <>
            <Text style={[TYPOGRAPHY.label, styles.sectionLabel, { color: C.text2 }]}>
              TARİH DEĞİŞİNCE
            </Text>
            <View style={styles.stats}>
              <Stat C={C} value={summary.days} unit="gün kaldı" />
              <Stat C={C} value={summary.weeks} unit="hafta" />
              {/* Yuk yalniz hesaplanabildiyse gosteriliyor: hafta ya da
                  kalan is sifirsa sayi uydurulmuyor. */}
              {summary.perWeek != null ? (
                <Stat C={C} value={summary.perWeek} unit="durak / hafta" />
              ) : null}
            </View>
          </>
        ) : null}

        <Card tone="surface" radius="panel" style={styles.note}>
          <Text style={[TYPOGRAPHY.meta, { color: C.text2, lineHeight: 21 }]}>
            Tarihi öne alırsan haftalık durak sayısı artar, hedef net aynı kalır.
            Geçmiş kayıtlar değişmez.
          </Text>
        </Card>
      </ScrollView>

      <View style={[styles.cta, { borderTopColor: C.line }]}>
        <Button onPress={save} size="lg" fullWidth loading={saving} disabled={!changed}>
          Kaydet
        </Button>
        <Pressable onPress={cancel} style={styles.cancelBtn} accessibilityRole="button" accessibilityLabel="Vazgeç">
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>Vazgeç</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Stat({ C, value, unit }) {
  return (
    <Card tone="surface" radius="panel" style={styles.statCard}>
      <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]} allowFontScaling={false}>
        {value}
      </Text>
      <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 4 }]}>{unit}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: GUTTER, paddingVertical: STEP.s2,
  },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: STEP.s3 },
  hero: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s2 },
  heroText: { flex: 1, paddingBottom: STEP.s1 },
  monthRow: { flexDirection: "row", alignItems: "center", marginTop: STEP.s4 },
  monthBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  monthLabel: { flex: 1, textAlign: "center" },
  sectionLabel: { marginTop: STEP.s4, marginBottom: STEP.s2 },
  stats: { flexDirection: "row", gap: STEP.s1 },
  statCard: { flex: 1, alignItems: "center" },
  note: { marginTop: STEP.s3 },
  cta: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: STEP.s2, borderTopWidth: 1 },
  cancelBtn: { height: 44, alignItems: "center", justifyContent: "center", marginTop: STEP.s1 },
});
