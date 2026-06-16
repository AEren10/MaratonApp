import { useState, useCallback, useEffect, useMemo, memo } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useC, useSubjectIdentity } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { getSubjectByKey } from "../../themes/subjects";
import { getSharedQuestions, subscribeToFeed } from "../../supabase/community";
import { getWrongQuestionImageUrl } from "../../supabase/storage";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { EmptyState } from "../../components/common/EmptyState";
import { SCREENS } from "../../constants/screens";

const FILTERS = [
  { key: "all", label: "Tümü" },
  { key: "turkce", label: "Türkçe" },
  { key: "matematik", label: "Mat" },
  { key: "fen", label: "Fen" },
  { key: "sosyal", label: "Sosyal" },
];

function relativeTime(iso) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3.6e6);
  if (h < 1) return "Az önce";
  if (h < 24) return `${h}sa`;
  if (h < 48) return "Dün";
  return `${Math.floor(h / 24)}g`;
}

const SharedCard = memo(function SharedCard({ item, C, onAnswer }) {
  const subj = getSubjectByKey(item.subject);
  const id = useSubjectIdentity(item.subject);
  const color = id?.solid || subj?.color || C.muted;
  const icon = subj?.icon || "bookOpen";
  const imageUri = item.image_path ? getWrongQuestionImageUrl(item.image_path) : null;

  return (
    <View style={{
      backgroundColor: C.surface, borderRadius: 22,
      borderWidth: 1, borderColor: C.border, padding: 14,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{
          width: 40, height: 40, borderRadius: 14,
          backgroundColor: color + "1A",
          alignItems: "center", justifyContent: "center",
        }}>
          <Icon name={icon} size={20} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.text }}>
            {item.profile?.display_name || "Anonim Kullanıcı"}
          </Text>
          <Text style={{ ...TYPOGRAPHY.micro, color: C.muted, marginTop: 1 }}>
            {relativeTime(item.created_at)}
          </Text>
        </View>
      </View>

      {item.note ? (
        <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text, marginTop: 10 }} numberOfLines={3}>
          {item.note}
        </Text>
      ) : null}

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ marginTop: 12, height: 220, borderRadius: 16, backgroundColor: C.surface2 }}
          contentFit="cover" cachePolicy="memory-disk" transition={200}
        />
      ) : null}

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8 }}>
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 4,
          backgroundColor: color + "16", paddingHorizontal: 9, paddingVertical: 5,
          borderRadius: RADIUS.pill,
        }}>
          <Icon name={icon} size={11} color={color} />
          <Text style={{ ...TYPOGRAPHY.micro, color }}>
            {item.topic || subj?.label || item.subject}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        {item.answer_count > 0 ? (
          <View style={{
            backgroundColor: C.surface2, paddingHorizontal: 8, paddingVertical: 4,
            borderRadius: RADIUS.pill, flexDirection: "row", alignItems: "center", gap: 4,
          }}>
            <Icon name="chat" size={11} color={C.sec} />
            <Text style={{ ...TYPOGRAPHY.micro, color: C.sec }}>{item.answer_count}</Text>
          </View>
        ) : null}
        <Pressable
          onPress={() => onAnswer(item)}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", gap: 5,
            backgroundColor: C.accent, paddingHorizontal: 12, paddingVertical: 7,
            borderRadius: RADIUS.pill, opacity: pressed ? 0.85 : 1,
          })}
        >
          <Icon name="camera" size={13} color="#FFFFFF" />
          <Text style={{ ...TYPOGRAPHY.micro, color: "#FFFFFF" }}>Cevap ver</Text>
        </Pressable>
      </View>
    </View>
  );
});

export function CommunityTab({ visible }) {
  const C = useC();
  const { user } = useAuth();
  const nav = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSharedQuestions(
        filter === "all" ? {} : { subject: filter },
      );
      setItems(data || []);
    } catch {}
    setLoading(false);
  }, [filter]);

  useEffect(() => { if (visible) load(); }, [visible, load]);

  useEffect(() => {
    if (!visible) return;
    const unsub = subscribeToFeed((row) => setItems((prev) => [row, ...prev]));
    return unsub;
  }, [visible]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const onAnswer = useCallback((item) => {
    nav.navigate(SCREENS.WRONG_DETAIL, { id: item.id, community: true });
  }, [nav]);

  const filtered = useMemo(() =>
    filter === "all" ? items : items.filter((i) => i.subject === filter),
    [items, filter],
  );

  const renderItem = useCallback(({ item }) => (
    <SharedCard item={item} C={C} onAnswer={onAnswer} />
  ), [C, onAnswer]);

  if (!visible) return null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: SPACING.md, alignItems: "center" }}>
        {FILTERS.map((f) => {
          const subj = f.key !== "all" ? getSubjectByKey(f.key) : null;
          const clr = subj?.color || C.amber;
          const on = filter === f.key;
          return (
            <Pressable key={f.key} onPress={() => setFilter(f.key)} style={{
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.pill,
              backgroundColor: on ? clr + "22" : C.surface,
              borderWidth: 1, borderColor: on ? clr : C.border,
            }}>
              <Text style={{ ...TYPOGRAPHY.captionMedium, color: on ? clr : C.sec }}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={{ gap: SPACING.md, paddingHorizontal: 16 }}>
          <SkeletonCard height={200} /><SkeletonCard height={160} /><SkeletonCard height={180} />
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState icon="users" title="Henüz paylaşım yok"
          message="Topluluktan yanlış soru paylaşıldığında burada görünecek." />
      ) : (
        <FlatList
          data={filtered} renderItem={renderItem}
          keyExtractor={(i) => i.id} showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: SPACING.md, paddingHorizontal: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={C.accent} colors={[C.accent]} />}
        />
      )}
    </View>
  );
}
