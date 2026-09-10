import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WRONG_NOTEBOOK_TAB } from "../../domain/wrongNotebook/wrongNotebookModel";
import { SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { CommunityTab } from "./CommunityTab";
import { WrongNotebookHeader } from "./components/WrongNotebookHeader";
import { WrongNotebookMineTab } from "./components/WrongNotebookMineTab";
import { WrongNotebookModals } from "./components/WrongNotebookModals";
import { WrongNotebookTabs } from "./components/WrongNotebookTabs";
import { useWrongNotebookController } from "./useWrongNotebookController";

export default function WrongNotebookScreen() {
  const C = useC();
  const notebook = useWrongNotebookController();
  const {
    closeErrorModal,
    closeShareModal,
    dismissXP,
    doShare,
    errorModal,
    goAddWrong,
    goBack,
    goClassicReview,
    goSwipeReview,
    handleCardPress,
    handleDelete,
    handleShare,
    loading,
    mainTab,
    onRefresh,
    refreshing,
    setStatusFilter,
    setSubjectAndReset,
    setTab,
    setTopic,
    shareModal,
    sharedIds,
    status,
    subject,
    topicFilter,
    toggleResolve,
    viewModel,
    xpToast,
  } = notebook;
  const filters = useMemo(() => ({ status, subject, topicFilter }), [status, subject, topicFilter]);
  const handlers = useMemo(() => ({
    onAddWrong: goAddWrong,
    onCardPress: handleCardPress,
    onChangeStatus: setStatusFilter,
    onChangeSubject: setSubjectAndReset,
    onChangeTab: setTab,
    onChangeTopic: setTopic,
    onClassicReview: goClassicReview,
    onDelete: handleDelete,
    onRefresh,
    onResolve: toggleResolve,
    onShare: handleShare,
    onSwipeReview: goSwipeReview,
  }), [
    goAddWrong,
    goClassicReview,
    goSwipeReview,
    handleCardPress,
    handleDelete,
    handleShare,
    onRefresh,
    setStatusFilter,
    setSubjectAndReset,
    setTab,
    setTopic,
    toggleResolve,
  ]);

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <WrongNotebookHeader
        C={C}
        counts={viewModel.counts}
        onAdd={goAddWrong}
        onBack={goBack}
        styles={styles}
      />
      <WrongNotebookTabs C={C} activeTab={mainTab} onChange={setTab} />

      {mainTab === WRONG_NOTEBOOK_TAB.COMMUNITY ? (
        <CommunityTab visible onSwitchToMine={() => setTab(WRONG_NOTEBOOK_TAB.MINE)} />
      ) : (
        <WrongNotebookMineTab
          C={C}
          filters={filters}
          handlers={handlers}
          loading={loading}
          refreshing={refreshing}
          sharedIds={sharedIds}
          styles={styles}
          viewModel={viewModel}
        />
      )}

      <WrongNotebookModals
        C={C}
        dismissXP={dismissXP}
        errorModal={errorModal}
        onCloseError={closeErrorModal}
        onCloseShare={closeShareModal}
        onShare={doShare}
        shareModal={shareModal}
        xpToast={xpToast}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  title: {
    fontFamily: "Bricolage_400",
    fontSize: 24,
    letterSpacing: -0.5,
    marginTop: 1,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.orange,
  },
  statusTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 6,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  subjectFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 6,
  },
  topicChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
});
