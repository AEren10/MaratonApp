import { useCallback, useMemo } from "react";
import { View, FlatList, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Button, ErrorState, SectionLabel, Skeleton } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { NOTEBOOK_FILTER } from "../../domain/wrongNotebook/wrongTopicGroups";
import { GUTTER, SHAPE, STEP } from "../../themes/tokens";
import { NotebookEmpty } from "./components/NotebookEmpty";
import { PhotoLostBanner } from "./components/PhotoLostBanner";
import { ReviewDueCard } from "./components/ReviewDueCard";
import { Segmented } from "./components/Segmented";
import { WrongScreenHeader } from "./components/WrongScreenHeader";
import { WrongTopicRow } from "./components/WrongTopicRow";
import { useWrongNotebookController } from "./useWrongNotebookController";

// "Yanlış Defteri" artboardi. Sosyal sekme v1 disi karariyla
// basilmiyor (ilgili eski dosya duruyor, ekrana baglanmiyor).
export default function WrongNotebookScreen() {
  const C = useC();
  const nb = useWrongNotebookController();
  const { view } = nb;

  const filterOptions = useMemo(() => [
    { key: NOTEBOOK_FILTER.OPEN, label: `Bekleyen · ${view.openCount}` },
    { key: NOTEBOOK_FILTER.RESOLVED, label: "Çözüldü" },
    { key: NOTEBOOK_FILTER.ALL, label: "Tümü" },
  ], [view.openCount]);

  const renderItem = useCallback(({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(500)} style={styles.gutter}>
      <WrongTopicRow group={item} onPress={nb.openGroup} />
    </Animated.View>
  ), [nb.openGroup]);

  const header = (
    <View>
      <PhotoLostBanner C={C} count={nb.lostPhotoCount} onRetry={nb.dismissLostPhotos} />
      <View style={[styles.gutter, styles.segment]}>
        <Segmented options={filterOptions} value={nb.filter} onChange={nb.changeFilter} />
      </View>
      {view.dueCount > 0 ? (
        <View style={[styles.gutter, styles.due]}>
          <ReviewDueCard count={view.dueCount} onStart={nb.goReview} />
        </View>
      ) : null}
      {view.groups.length > 0 ? (
        <SectionLabel style={[styles.gutter, styles.section, { color: C.text2 }]}>KONUYA GÖRE</SectionLabel>
      ) : null}
    </View>
  );

  const footer = (
    <View style={[styles.gutter, styles.footer]}>
      <Button variant="outline" size="md" fullWidth onPress={nb.goAddWrong}>
        Yanlış ekle
      </Button>
    </View>
  );

  let body;
  if (nb.loading) {
    body = <NotebookLoading />;
  } else if (nb.loadFailed && view.total === 0) {
    body = (
      <ErrorState preset="server" secondary="" onPrimary={nb.retry} style={styles.gutter} />
    );
  } else if (view.total === 0) {
    body = <NotebookEmpty onAdd={nb.goAddWrong} />;
  } else {
    body = (
      <FlatList
        data={view.groups}
        keyExtractor={(g) => g.key}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        refreshControl={
          <RefreshControl refreshing={nb.refreshing} onRefresh={nb.onRefresh} tintColor={C.accent} colors={[C.accent]} />
        }
        windowSize={5}
        maxToRenderPerBatch={10}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <WrongScreenHeader title="Defter" onPress={nb.goBack} />
      {body}
    </SafeAreaView>
  );
}

function NotebookLoading() {
  return (
    <View style={[styles.gutter, styles.loading]}>
      <Skeleton height={44} radius={SHAPE.segment} />
      <Skeleton height={150} radius={SHAPE.sheet} />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} height={62} radius={SHAPE.cardTight} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  gutter: { paddingHorizontal: GUTTER },
  segment: { paddingTop: STEP.s3 },
  due: { paddingTop: STEP.s3 },
  section: { marginTop: STEP.s4, marginBottom: 4 },
  footer: { paddingTop: STEP.s4, paddingBottom: STEP.s4 + STEP.s1 },
  loading: { paddingTop: STEP.s3, gap: STEP.s3 },
});
