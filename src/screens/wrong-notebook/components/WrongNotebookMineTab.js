import { useCallback } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, ScrollView } from "react-native";

import { EmptyState } from "../../../components/common/EmptyState";
import { Icon } from "../../../components/design";
import {
  WRONG_NOTEBOOK_STATUS,
  WRONG_NOTEBOOK_TAB,
} from "../../../domain/wrongNotebook/wrongNotebookModel";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { DueBanner } from "./DueBanner";
import { FilterPill, SubjectFilterPill } from "./FilterPills";
import { SwipeableWrongCard } from "./SwipeableWrongCard";
import { WrongNotebookSkeleton } from "./WrongNotebookSkeleton";

const STATUS_TABS = [
  { key: WRONG_NOTEBOOK_STATUS.OPEN, getLabel: (counts) => `Çözülmemiş · ${counts.open}`, colorKey: "accent" },
  { key: WRONG_NOTEBOOK_STATUS.RESOLVED, getLabel: (counts) => `Çözüldü · ${counts.total - counts.open}`, colorKey: "success" },
  { key: WRONG_NOTEBOOK_STATUS.ALL, getLabel: () => "Tümü", colorKey: "text" },
];

export function WrongNotebookMineTab({
  C,
  filters,
  handlers,
  loading,
  refreshing,
  sharedIds,
  styles,
  viewModel,
}) {
  const renderItem = useCallback(({ item }) => (
    <SwipeableWrongCard
      item={item}
      onPress={handlers.onCardPress}
      onResolve={handlers.onResolve}
      onShare={handlers.onShare}
      onDelete={handlers.onDelete}
      shared={sharedIds.has(item.id)}
    />
  ), [handlers, sharedIds]);

  return (
    <View style={{ flex: 1 }}>
      {viewModel.counts.open > 0 && (
        <Pressable
          onPress={() => handlers.onChangeTab(WRONG_NOTEBOOK_TAB.COMMUNITY)}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: SPACING.sm,
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.sm,
            backgroundColor: C.accent + "12",
            borderRadius: RADIUS.lg,
            padding: SPACING.md,
            borderWidth: 1,
            borderColor: C.accent + "25",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Icon name="globe" size={18} color={C.accent} />
          <Text style={{ ...TYPOGRAPHY.caption, color: C.text, flex: 1 }}>
            Yanlışlarını paylaş, diğer adaylardan çözüm önerisi al
          </Text>
          <Icon name="chevR" size={14} color={C.accent} />
        </Pressable>
      )}

      <View style={styles.statusTabs}>
        {STATUS_TABS.map((tab) => {
          const active = filters.status === tab.key;
          const color = C[tab.colorKey];
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityLabel={tab.getLabel(viewModel.counts)}
              accessibilityState={{ selected: active }}
              onPress={() => handlers.onChangeStatus(tab.key)}
              style={[
                styles.statusChip,
                {
                  backgroundColor: active ? color + "18" : "transparent",
                  borderColor: active ? color + "40" : C.border,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: active ? "Archivo_600" : "Archivo_500",
                  fontSize: 13,
                  color: active ? color : C.muted,
                }}
              >
                {tab.getLabel(viewModel.counts)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <DueBanner
        dueCount={viewModel.dueCount}
        onClassic={handlers.onClassicReview}
        onSwipe={handlers.onSwipeReview}
      />

      {viewModel.filtered.length > 0 || filters.subject !== "all" ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectFilterRow}>
          <FilterPill
            label="Tüm Dersler"
            count={Object.values(viewModel.subjectCounts).reduce((a, b) => a + b, 0)}
            color={C.accent}
            active={filters.subject === "all"}
            onPress={() => handlers.onChangeSubject("all")}
          />
          {viewModel.subjectKeys.map((key) => (
            <SubjectFilterPill
              key={key}
              subKey={key}
              count={viewModel.subjectCounts[key]}
              active={filters.subject === key}
              onPress={() => handlers.onChangeSubject(key)}
            />
          ))}
        </ScrollView>
      ) : null}

      {viewModel.topicOptions.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 6, paddingBottom: 8 }}
        >
          <TopicFilterChip
            C={C}
            active={filters.topicFilter === "all"}
            label="Tüm konular"
            onPress={() => handlers.onChangeTopic("all")}
            styles={styles}
          />
          {viewModel.topicOptions.map((topic) => (
            <TopicFilterChip
              key={topic.name}
              C={C}
              active={filters.topicFilter === topic.name}
              label={`${topic.name} (${topic.n})`}
              accessibilityLabel={`${topic.name}, ${topic.n} yanlış`}
              onPress={() => handlers.onChangeTopic(topic.name)}
              styles={styles}
            />
          ))}
        </ScrollView>
      ) : null}

      {loading ? (
        <WrongNotebookSkeleton />
      ) : (
        <FlatList
          data={viewModel.filtered}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handlers.onRefresh} tintColor={C.accent} colors={[C.accent]} />}
          renderItem={renderItem}
          windowSize={5}
          maxToRenderPerBatch={10}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 110,
            gap: 12,
          }}
          ListEmptyComponent={
            <EmptyState
              icon={filters.status === WRONG_NOTEBOOK_STATUS.RESOLVED ? "check" : "notebook"}
              title={filters.status === WRONG_NOTEBOOK_STATUS.RESOLVED ? "Çözülmüş yanlışlar burada görünecek" : "Yanlış defterini doldur, konularına hakim ol"}
              message={filters.subject === "all" ? "Deneme veya pratik yaptıktan sonra yanlış soruların burada toplanır. Bir soru eklemek 30 saniye sürer!" : "Bu ders için kayıt yok, başka dersi dene"}
              actionLabel={filters.status !== WRONG_NOTEBOOK_STATUS.RESOLVED ? "Yanlış Ekle" : undefined}
              onAction={filters.status !== WRONG_NOTEBOOK_STATUS.RESOLVED ? handlers.onAddWrong : undefined}
              color="accent"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function TopicFilterChip({ C, active, accessibilityLabel, label, onPress, styles }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.topicChip,
        {
          backgroundColor: active ? C.surface2 : "transparent",
          borderColor: active ? C.border : "transparent",
        },
      ]}
    >
      <Text style={{ ...TYPOGRAPHY.captionMedium, color: active ? C.text : C.muted }}>
        {label}
      </Text>
    </Pressable>
  );
}
