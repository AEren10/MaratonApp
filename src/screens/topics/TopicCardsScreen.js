import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Icon, IconBox, Chip } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { useAuth } from "../../contexts/AuthContext";
import { getTopicProgress } from "../../supabase/topicProgress";

const ItemSeparator = () => <View style={{ height: SPACING.md }} />;

const CardItem = React.memo(function CardItem({ item, onPress, styles, C }) {
  const pct = item.count > 0 ? Math.round((item.mastered / item.count) * 100) : 0;
  const pctColor = pct >= 70 ? C.green : pct >= 40 ? C.amber : C.red;
  const handlePress = useCallback(() => onPress(item.id), [onPress, item.id]);
  return (
    <Pressable onPress={handlePress} style={styles.card}>
      <IconBox icon={item.icon} color={item.color} size={44} rounded={14} />
      <View style={{ flex: 1 }}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{item.title}</Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.muted, marginTop: 2 }]}>
          {item.mastered}/{item.count} öğrenildi
        </Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <Chip color={pctColor}>%{pct}</Chip>
        <View style={styles.miniBar}>
          <View style={[styles.miniBarFill, { width: `${pct}%`, backgroundColor: item.color }]} />
        </View>
      </View>
      <Icon name="chevR" size={16} color={C.muted} />
    </Pressable>
  );
});

export default function TopicCardsScreen() {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const { user } = useAuth();
  const [cards, setCards] = useState([]);

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
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
      .catch(() => {});
  }, [user?.id, C]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const openCard = useCallback((id) => {
    navigation.navigate(SCREENS.CARD_DETAIL, { cardId: id });
  }, [navigation]);

  const renderItem = useCallback(({ item }) => (
    <CardItem item={item} onPress={openCard} styles={styles} C={C} />
  ), [openCard, styles, C]);

  const keyExtractor = useCallback((item) => String(item.id), []);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>
          Konu Kartları
        </Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.muted }]}>
          {cards.length} konu
        </Text>
      </View>

      {cards.length === 0 ? (
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
      paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    list: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },
    card: {
      flexDirection: "row", alignItems: "center", gap: SPACING.md,
      backgroundColor: C.surface, borderRadius: RADIUS.xl,
      padding: SPACING.lg,
    },
    miniBar: {
      width: 50, height: 4, borderRadius: 2, backgroundColor: C.surface2, overflow: "hidden",
    },
    miniBarFill: { height: 4, borderRadius: 2 },
  });
}
