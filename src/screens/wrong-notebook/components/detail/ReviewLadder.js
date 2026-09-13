import { Fragment } from "react";
import { View, Text, StyleSheet } from "react-native";

import { Icon, SectionLabel } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { formatDayMonth } from "../../../../lib/format";
import { ladderStageOf, REVIEW_LADDER } from "../../../../lib/wrongReviewLadder";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// "TEKRAR GEÇMİŞİ": merdiven dugumleri. Gecilen kademe dolu kutu + tik,
// siradaki kademe kizil cerceve, gelecek kademe iz rengi.
// Kapanmis soruda tum dugumler dolu ve "Sonraki tekrar" satiri yok.
export function ReviewLadder({ item }) {
  const C = useC();
  const closed = !!item?.is_resolved;
  const current = closed ? REVIEW_LADDER.length : ladderStageOf(item);
  const next = !closed && item?.next_review_at ? formatDayMonth(item.next_review_at, null) : null;

  return (
    <View style={styles.wrap}>
      <SectionLabel style={{ color: C.text2 }}>TEKRAR GEÇMİŞİ</SectionLabel>
      <View style={styles.track}>
        {REVIEW_LADDER.map((day, i) => {
          const done = i < current;
          const isNext = i === current;
          return (
            <Fragment key={day}>
              {i > 0 ? <View style={[styles.link, { backgroundColor: done ? C.accent : C.track }]} /> : null}
              <View style={styles.node}>
                <View
                  style={[
                    styles.box,
                    done
                      ? { backgroundColor: C.accent }
                      : { borderWidth: 2, borderColor: isNext ? C.accent : C.track },
                  ]}
                >
                  {done ? <Icon name="check" size={11} color={C.accentInk} sw={2.4} /> : null}
                </View>
                <Text style={[TYPOGRAPHY.micro, { color: isNext ? C.accentBright : done ? C.text2 : C.text3 }]}>
                  {day}. gün
                </Text>
              </View>
            </Fragment>
          );
        })}
      </View>
      {next ? (
        <View style={[styles.nextRow, { borderTopColor: C.line }]}>
          <Text style={[TYPOGRAPHY.captionMedium, styles.flex, { color: C.text3 }]}>Sonraki tekrar</Text>
          <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{next}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 6 },
  track: { flexDirection: "row", alignItems: "flex-start", marginTop: STEP.s2 },
  node: { width: 64, alignItems: "center", gap: STEP.s1 },
  box: { width: 24, height: 24, borderRadius: 4, alignItems: "center", justifyContent: "center" },
  link: { flex: 1, height: 2, marginTop: 11 },
  nextRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: STEP.s2,
    marginTop: STEP.s3,
    paddingTop: STEP.s2 + 4,
    borderTopWidth: 1,
  },
  flex: { flex: 1 },
});
