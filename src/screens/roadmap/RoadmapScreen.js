import { useCallback, useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { SPACING, TYPOGRAPHY } from "../../themes/tokens";
import RouteProgressHeader from "./components/RouteProgressHeader";
import RouteCreationCard from "./components/RouteCreationCard";
import RouteWeekCard from "./components/RouteWeekCard";
import { EmptyState } from "../../components/common/EmptyState";
import { usePremium } from "../../contexts/PremiumContext";
import { useAlert } from "../../contexts/AlertContext";
import RouteNextActionPanel from "./components/RouteNextActionPanel";
import RouteDebtCard from "./components/RouteDebtCard";
import { useRoadmapNextAction } from "./useRoadmapNextAction";
import { useRoadmapConfirmations } from "./useRoadmapConfirmations";

export default function RoadmapScreen() {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const { showPaywall } = usePremium();
  const showAlert = useAlert();
  const { targetNet } = useExam();
  const {
    weeks, totals, daysLeft, hasRouteAccess, routeAccessError,
    routeAccessLoading, refreshRouteAccess, isPaused, pause, resume,
    intelligence, routeCreated, routeCreating, routeCreationError, routeReadiness, createRoute,
    debt, debtWeeks, distributeDebt, forecast,
  } = useStudyRoute({ persist: false });

  const { nextRouteAction, startNextRouteAction } = useRoadmapNextAction({ navigation, routeCreated, weeks });
  const debtPlan = useMemo(() => distributeDebt(weeks), [debt?.totalQuestions, distributeDebt, weeks]);
  const { togglePause, handleCreateRoute } = useRoadmapConfirmations({
    isPaused, pause, resume, createRoute, routeCreated, navigation, showAlert,
  });
  const renderWeek = useCallback(
    ({ item }) => <RouteWeekCard week={item} frozen={isPaused} C={C} />,
    [C, isPaused],
  );
  const keyExtractor = useCallback((item) => item.weekStart || `week-${item.weekNo}`, []);
  const header = useMemo(() => (
    <>
      <RouteCreationCard
        C={C}
        daysLeft={daysLeft}
        disabled={isPaused}
        error={routeCreationError}
        intelligence={intelligence}
        loading={routeCreating}
        onCreate={handleCreateRoute}
        readiness={routeReadiness}
        routeCreated={routeCreated}
        weeks={weeks}
      />
      <RouteNextActionPanel
        C={C}
        action={nextRouteAction}
        disabled={isPaused}
        onStart={startNextRouteAction}
      />
      <RouteDebtCard C={C} debt={debt} debtPlan={debtPlan} debtWeeks={debtWeeks} />
      <RouteProgressHeader
        totals={totals}
        daysLeft={daysLeft}
        isPaused={isPaused}
        intelligence={intelligence}
        onTogglePause={togglePause}
        forecast={forecast}
        targetNet={targetNet}
        C={C}
      />
    </>
  ), [C, daysLeft, debt, debtPlan, debtWeeks, forecast, handleCreateRoute, intelligence, isPaused, nextRouteAction,
    routeCreated, startNextRouteAction, targetNet,
    routeCreating, routeCreationError, routeReadiness, togglePause, totals, weeks]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Geri"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => navigation.goBack()}
          style={styles.headerAction}
        >
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Yol Haritası</Text>
        <View style={styles.headerAction} />
      </View>

      {routeAccessLoading ? (
        <View style={styles.locked}><ActivityIndicator color={C.accent} size="large" /></View>
      ) : routeAccessError ? (
        <View style={styles.locked}>
          <EmptyState icon="refresh" title="Rota erişimi doğrulanamadı"
            message="Bağlantını kontrol edip yeniden deneyebilirsin. Rotan ve geçmiş ilerlemen güvende."
            actionLabel="Tekrar dene" onAction={refreshRouteAccess} />
        </View>
      ) : !hasRouteAccess ? (
        <View style={styles.locked}>
          <EmptyState icon="lock" title="Kişisel rota Pro'da"
            message="İlk 7 günden sonra rota, tahmin bandı ve tempo senaryoları Pro ile devam eder. Geçmiş rotan silinmez."
            actionLabel="Pro'yu incele" onAction={() => showPaywall("route_gate")} />
        </View>
      ) : <FlatList
        contentContainerStyle={styles.content}
        data={weeks}
        keyExtractor={keyExtractor}
        ListHeaderComponent={header}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Icon name="flag" size={28} color={C.muted} />
            <Text style={styles.emptyTitle}>Rotan hazırlanıyor</Text>
            <Text style={styles.emptyText}>Sınav ve hedef bilgilerin tamamlandığında ilk durakların burada görünür.</Text>
          </View>
        )}
        renderItem={renderWeek}
        showsVerticalScrollIndicator={false}
        windowSize={7}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
      />}
    </SafeAreaView>
  );
}

const makeStyles = (C) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
  },
  headerAction: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  headerTitle: { ...TYPOGRAPHY.subheading, color: C.text },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.huge },
  empty: { alignItems: "center", paddingVertical: SPACING.huge, gap: SPACING.sm },
  emptyTitle: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
  emptyText: { ...TYPOGRAPHY.caption, color: C.sec, textAlign: "center", maxWidth: 280 },
  locked: { flex: 1, justifyContent: "center", paddingHorizontal: SPACING.lg },
});
