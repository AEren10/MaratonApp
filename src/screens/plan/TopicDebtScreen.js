import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated from "react-native-reanimated";
import { SCREENS } from "../../constants/screens";
import { Icon, Card, Button, EmptyState, Skeleton } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useTopicDebt } from "../../hooks/useTopicDebt";
import { TopicDebtStopRow } from "./components/TopicDebtStopRow";
import { TopicDebtHero } from "./components/TopicDebtHero";
import { TopicDebtImpactCard } from "./components/TopicDebtImpactCard";
import { DebtDistributedView } from "./components/DebtDistributedView";
import * as H from "../../lib/haptics";
import { Press } from "../../components/design/Press";

export default function TopicDebtScreen() {
  const C = useC();
  const navigation = useNavigation();
  const {
    stops, stopCount, totalHours, hasHours, capped,
    canDistribute, distributing, distribute, isEmpty, loading,
  } = useTopicDebt();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Press haptic="none"
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Geri"
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <Icon name="chevL" size={18} color={C.text} />
          <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Konu borcu</Text>
        </Press>
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TopicDebtHero loading />
          <View style={styles.loadingList}>
            <Skeleton width="100%" height={160} radius={SHAPE.card} />
            <Skeleton width="100%" height={68} radius={SHAPE.card} />
            <Skeleton width="100%" height={68} radius={SHAPE.card} />
          </View>
        </ScrollView>
      ) : isEmpty ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            title="Konu borcun yok."
            body="Atlanmış durak oluştuğunda burada görünür; dağıtınca rota yeniden dengelenir."
            primary="Günün Planına Dön"
            onPrimary={() => navigation.navigate(SCREENS.DAILY_PLAN)}
          />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <TopicDebtHero totalHours={totalHours} hasHours={hasHours} capped={capped} />

            {hasHours ? (
              <Animated.View>
                <TopicDebtImpactCard C={C} totalHours={totalHours} />
              </Animated.View>
            ) : null}

            <Animated.View style={styles.listWrap}>
              <View style={styles.listHead}>
                <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>BİRİKEN DURAKLAR</Text>
                <View style={[styles.rule, { backgroundColor: C.line }]} />
                <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{stopCount} durak</Text>
              </View>
              {stops.map((item) => (
                <TopicDebtStopRow
                  key={item.key}
                  item={{
                    subjectKey: item.subjectKey,
                    title: item.title,
                    statusLabel: "atlandı",
                    dueLabel: `${item.hours} sa`,
                    minutesLabel: `${item.hours} sa`,
                  }}
                  C={C}
                />
              ))}
            </Animated.View>

            <View style={styles.actionWrap}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={distribute}
                loading={distributing}
                disabled={!canDistribute}
              >
                Borcu üç haftaya dağıt
              </Button>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3, textAlign: "center", marginTop: STEP.s2 }]}>
                Dağıtınca borç durakları rotaya yeniden yazılır.
              </Text>
            </View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s2 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: STEP.s5 },
  loadingList: { marginTop: STEP.s4, gap: STEP.s3 },
  emptyWrap: { flex: 1, paddingHorizontal: GUTTER, justifyContent: "center", alignItems: "center" },
  listWrap: { marginTop: STEP.s5 },
  listHead: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingBottom: STEP.s3 },
  rule: { flex: 1, height: 1 },
  actionWrap: { marginTop: STEP.s5, paddingBottom: STEP.s4 },
});
