import { View, Text } from "react-native";
import { Icon, IconBox } from "../../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { getSubjectByKey } from "../../../themes/subjects";
import { TRIAL_TYPES } from "../../trial/trialTypes";

function formatDay(iso) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function LogRow({ log }) {
  const subj = getSubjectByKey(log.subject) || { label: log.subject, color: C.amber, icon: "bookOpen" };
  return (
    <View style={styles.row}>
      <IconBox icon={subj.icon} color={subj.color} size={32} rounded={8} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{subj.label}</Text>
        {log.topic && <Text style={styles.sub}>{log.topic}</Text>}
      </View>
      <View style={styles.metrics}>
        {log.question_count > 0 && (
          <Text style={[styles.metric, { color: C.amber }]}>{log.question_count} soru</Text>
        )}
        {log.duration_minutes > 0 && (
          <Text style={[styles.metric, { color: C.blue }]}>{log.duration_minutes}dk</Text>
        )}
      </View>
    </View>
  );
}

function TrialRow({ trial }) {
  const meta = TRIAL_TYPES[trial.trialType];
  const color = meta?.color || C.amber;
  return (
    <View style={styles.row}>
      <IconBox icon={meta?.icon || "chart"} color={color} size={32} rounded={8} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{meta?.label || trial.name || "Deneme"}</Text>
        <Text style={styles.sub}>{trial.totalNet?.toFixed(1) || "0.0"} net</Text>
      </View>
    </View>
  );
}

export function DayDetails({ day, data }) {
  const label = formatDay(day);

  if (!data || (data.logs.length === 0 && data.trials.length === 0)) {
    return (
      <View style={styles.card}>
        <Text style={styles.dayLabel}>{label}</Text>
        <View style={styles.empty}>
          <Icon name="moon" size={28} color={C.muted} />
          <Text style={styles.emptyText}>Bu gün boş geçmiş</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.dayLabel}>{label}</Text>
      {data.trials.length > 0 && (
        <View style={{ marginTop: SPACING.md }}>
          <Text style={styles.section}>DENEMELER</Text>
          {data.trials.map((t) => <TrialRow key={t.id} trial={t} />)}
        </View>
      )}
      {data.logs.length > 0 && (
        <View style={{ marginTop: SPACING.md }}>
          <Text style={styles.section}>ÇALIŞMALAR</Text>
          {data.logs.map((l) => <LogRow key={l.id} log={l} />)}
        </View>
      )}
    </View>
  );
}

const styles = {
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: C.border,
    padding: SPACING.lg,
  },
  dayLabel: {
    ...TYPOGRAPHY.subheading,
    color: C.text,
    textTransform: "capitalize",
  },
  section: {
    ...TYPOGRAPHY.label,
    color: C.muted,
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.bodySemiBold,
    color: C.text,
  },
  sub: {
    ...TYPOGRAPHY.caption,
    color: C.muted,
    marginTop: 2,
  },
  metrics: {
    alignItems: "flex-end",
    gap: 2,
  },
  metric: {
    ...TYPOGRAPHY.captionMedium,
  },
  empty: {
    paddingVertical: SPACING.xl,
    alignItems: "center",
    gap: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.caption,
    color: C.muted,
  },
};
