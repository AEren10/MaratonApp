import React, { useCallback } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Button, SectionLabel, Icon } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useAppSearch } from "../../hooks/useAppSearch";
import { subjectColorOf } from "../../themes/subjectPalette";
import { reviewDueLabel } from "../../lib/searchIndex";
import { SearchField } from "./components/SearchField";
import { SearchResultRow } from "./components/SearchResultRow";
import { RecentSearches } from "./components/RecentSearches";

const daysAgo = (iso) => {
  if (!iso) return null;
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (Number.isNaN(d)) return null;
  if (d <= 0) return "bugün";
  if (d === 1) return "dün";
  return `${d} gün önce`;
};

export default function SearchScreen() {
  const C = useC();
  const navigation = useNavigation();
  const {
    query, setQuery, clear, topics, wrongs, recent, remember, clearRecent,
    hasQuery, noResults, suggestion,
  } = useAppSearch();

  const openTopic = useCallback((hit) => {
    remember(query);
    navigation.navigate(SCREENS.TOPIC_STUDY, {
      topic: { name: hit.topic },
      subject: { key: hit.subjectKey, name: hit.subjectLabel },
    });
  }, [navigation, remember, query]);

  const openWrong = useCallback((row) => {
    remember(query);
    navigation.navigate(SCREENS.WRONG_DETAIL, { question: row });
  }, [navigation, remember, query]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <SearchField
        C={C}
        value={query}
        onChange={setQuery}
        onSubmit={() => remember(query)}
        onClear={clear}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {noResults ? (
          <View style={styles.empty}>
            <Icon name="search" size={44} color={C.text4} sw={1.6} />
            <Text style={[styles.emptyTitle, { color: C.text }]}>
              "{query.trim()}" için sonuç yok.
            </Text>
            <Text style={[TYPOGRAPHY.caption, styles.emptyBody, { color: C.text3 }]}>
              Yol haritasında bu adla bir konu bulunmuyor.
              {suggestion ? ` "${suggestion}" olarak aramayı dene.` : ""}
            </Text>
            {suggestion ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => setQuery(suggestion)}
                style={{ marginTop: 32 }}
              >
                {`${suggestion} olarak ara`}
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="md"
              fullWidth
              onPress={() => navigation.navigate(SCREENS.ROADMAP)}
              style={{ marginTop: STEP.s2 }}
            >
              Tüm yol haritasına bak
            </Button>
          </View>
        ) : (
          <>
            {topics.length > 0 && (
              <View style={styles.section}>
                <SectionLabel>{`KONULAR · ${topics.length}`}</SectionLabel>
                {topics.map((hit) => (
                  <SearchResultRow
                    key={`${hit.subjectKey}-${hit.topic}`}
                    C={C}
                    title={hit.topic}
                    meta={hit.subjectLabel}
                    dotColor={subjectColorOf(C, hit.subjectKey)}
                    onPress={() => openTopic(hit)}
                  />
                ))}
              </View>
            )}

            {wrongs.length > 0 && (
              <View style={styles.section}>
                <SectionLabel>{`DEFTERDEKİ YANLIŞLAR · ${wrongs.length}`}</SectionLabel>
                {wrongs.map((row) => {
                  const due = reviewDueLabel(row.next_review_at);
                  const when = daysAgo(row.created_at);
                  return (
                    <SearchResultRow
                      key={row.id}
                      C={C}
                      title={row.topic || row.note || "Yanlış"}
                      meta={when ? `${row.subject} · ${when}` : row.subject}
                      trailing={due?.text}
                      trailingAccent={due?.due}
                      onPress={() => openWrong(row)}
                    />
                  );
                })}
              </View>
            )}

            {!hasQuery && (
              <RecentSearches C={C} items={recent} onPick={setQuery} onClear={clearRecent} />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: GUTTER, paddingTop: 22, paddingBottom: 34 },
  section: { marginBottom: 26 },
  empty: { alignItems: "center", paddingTop: 56, paddingHorizontal: 18 },
  emptyTitle: { fontFamily: "Bricolage_400", fontSize: 22, lineHeight: 29, marginTop: 26, textAlign: "center" },
  emptyBody: { marginTop: 12, maxWidth: 256, textAlign: "center", lineHeight: 22 },
});
