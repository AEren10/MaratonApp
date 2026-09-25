import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useAuth } from "../../contexts/AuthContext";
import { getTopicProgress } from "../../supabase/topicProgress";
import { CardItem } from "./components/CardItem";
import { TopicCardsSkeleton } from "./components/TopicCardsSkeleton";
import { Press } from "../../components/design/Press";

const ItemSeparator = () => <View style={{ height: STEP.s2 }} />;

export default function TopicCardsScreen() {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || user.id === "dev") {
      setLoading(false);
      return;
    }
    setLoading(true);
    getTopicProgress(user.id)
      .then((rows) => {
        const mapped = rows.map((r) => ({
          id: r.topic_id || r.id,
          title: r.topic_name || "Konu",
          count: r.total_questions || 0,
          mastered: r.correct_count || 0,
          color: C.accent,
          icon: "hash",
        }));
        setCards(mapped.filter((c) => c.count > 0));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id, C]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const openCard = useCallback((item) => {
    navigation.navigate(SCREENS.CARD_DETAIL, {
      cardId: item?.id,
      title: item?.title,
      flashcards: item?.flashcards || [],
    });
  }, [navigation]);

  const renderItem = useCallback(({ item }) => (
    <CardItem item={item} onPress={openCard} styles={styles} C={C} />
  ), [openCard, styles, C]);

  const keyExtractor = useCallback((item) => String(item.id), []);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Press haptic="none" onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Press>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: STEP.s2 }]}>
          Konu Kartları
        </Text>
        <Press haptic="none" onPress={() => navigation.navigate(SCREENS.HOW_IT_WORKS)} hitSlop={12} style={{ marginRight: STEP.s2 }}>
          <Icon name="info" size={22} color={C.text2} />
        </Press>
        <Text style={[TYPOGRAPHY.caption, { color: C.muted }]}>
          {cards.length} konu
        </Text>
      </View>

      {loading ? (
        <TopicCardsSkeleton />
      ) : cards.length === 0 ? (
        <EmptyState
          icon="bookOpen"
          title="Konu kartların burada oluşacak"
          message="Soru çözdükçe her konunun ilerleme kartı otomatik olarak burada belirecek. İlk adımı at!"
          actionLabel="Soru Çöz"
          onAction={() => navigation.navigate(SCREENS.QUICK_PRACTICE)}
          color="accent"
        />
      ) : (
        <FlatList
          data={cards}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          windowSize={5}
          maxToRenderPerBatch={10}
          ItemSeparatorComponent={ItemSeparator}
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: GUTTER, paddingVertical: STEP.s2,
    },
    list: { paddingHorizontal: GUTTER, paddingBottom: 60 },
    card: {
      flexDirection: "row", alignItems: "center", gap: STEP.s2,
      backgroundColor: C.surface, borderRadius: SHAPE.card,
      padding: GUTTER,
    },
    miniBar: {
      width: 50, height: 4, borderRadius: 2, backgroundColor: C.elev, overflow: "hidden",
    },
    miniBarFill: { height: 4, borderRadius: 2 },
  });
}


