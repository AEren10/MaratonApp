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
import SignedImage from "../../components/common/SignedImage";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { EmptyState } from "../../components/common/EmptyState";
import { SCREENS } from "../../constants/screens";

const FILTERS = [
  { key: "all", label: "Tümü", icon: "layers" },
  { key: "turkce", label: "Türkçe", icon: "bookOpen" },
  { key: "matematik", label: "Matematik", icon: "hash" },
  { key: "fizik", label: "Fizik", icon: "zap" },
  { key: "kimya", label: "Kimya", icon: "flask" },
  { key: "biyoloji", label: "Biyoloji", icon: "activity" },
  { key: "tarih", label: "Tarih", icon: "clock" },
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
  const hasImage = !!item.image_path;

  return (
    <Pressable
      onPress={() => onAnswer(item)}
      style={({ pressed }) => ({
        backgroundColor: C.surface, borderRadius: 22,
        borderWidth: 1, borderColor: C.border, padding: 14,
        opacity: pressed ? 0.95 : 1,
      })}
    >
      {/* Header: avatar + user + subject chip */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{
          width: 40, height: 40, borderRadius: 14,
          backgroundColor: color + "1A",
          alignItems: "center", justifyContent: "center",
        }}>
          <Icon name={icon} size={20} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ ...TYPOGRAPHY.bodySemiBold, fontSize: 14, color: C.text }}>
              {item.profile?.name || "Anonim"}
            </Text>
            <Text style={{ color: C.muted, fontSize: 13 }}>·</Text>
            <Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>
              {relativeTime(item.created_at)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 3,
              backgroundColor: color + "16", paddingHorizontal: 8, paddingVertical: 3,
              borderRadius: RADIUS.pill,
            }}>
              <Icon name={icon} size={10} color={color} />
              <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color }}>
                {subj?.label || item.subject}
              </Text>
            </View>
            {item.topic ? (
              <Text style={{ ...TYPOGRAPHY.micro, color: C.sec }} numberOfLines={1}>
                {item.topic}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {item.note ? (
        <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text, marginTop: 10, lineHeight: 21 }} numberOfLines={3}>
          {item.note}
        </Text>
      ) : null}

      {hasImage ? (
        <SignedImage
          bucket="wrong-questions"
          path={item.image_path}
          style={{ marginTop: 12, height: 220, borderRadius: 16, backgroundColor: C.surface2 }}
          contentFit="cover" transition={200}
        />
      ) : null}

      {/* Footer: answer count + answer button */}
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 10 }}>
        {item.answer_count > 0 ? (
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 5,
            backgroundColor: C.surface2, paddingHorizontal: 10, paddingVertical: 6,
            borderRadius: RADIUS.pill,
          }}>
            <Icon name="chat" size={13} color={C.sec} />
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: C.sec }}>
              {item.answer_count} cevap
            </Text>
          </View>
        ) : null}
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => onAnswer(item)}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", gap: 6,
            backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 9,
            borderRadius: RADIUS.pill, opacity: pressed ? 0.85 : 1,
          })}
        >
          <Icon name="edit" size={14} color="#FFFFFF" />
          <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" }}>
            Cevap Yaz
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
});

export function CommunityTab({ visible, onSwitchToMine }) {
  const C = useC();
  const { user } = useAuth();
  const nav = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getSharedQuestions(
        filter === "all" ? {} : { subject: filter },
      );
      setItems(data || []);
    } catch (e) {
      setLoadError(e?.message || "Yüklenemedi");
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { if (visible) load(); }, [visible, load]);

  useEffect(() => {
    if (!visible) return;
    const unsub = subscribeToFeed(() => load());
    return unsub;
  }, [visible, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const onAnswer = useCallback((item) => {
    nav.navigate(SCREENS.WRONG_DETAIL, { item, community: true });
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
          const clr = subj?.color || C.accent;
          const on = filter === f.key;
          return (
            <Pressable key={f.key} onPress={() => setFilter(f.key)} style={{
              flexDirection: "row", alignItems: "center", gap: 6,
              paddingHorizontal: 14, paddingVertical: 9, borderRadius: RADIUS.pill,
              backgroundColor: on ? clr + "1A" : "transparent",
              borderWidth: 1, borderColor: on ? clr + "40" : C.border,
            }}>
              <Icon name={f.icon} size={13} color={on ? clr : C.muted} />
              <Text style={{ fontSize: 13, fontFamily: on ? "Inter_600SemiBold" : "Inter_500Medium", color: on ? clr : C.sec }}>
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
      ) : loadError ? (
        <EmptyState
          icon="alert"
          title="Yüklenemedi"
          message={`Topluluk verileri alınamadı: ${loadError}`}
          actionLabel="Tekrar Dene"
          onAction={load}
          color="red"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="globe"
          title="Binlerce öğrenci birlikte çalışıyor"
          message="Yanlış defterinden bir soru paylaş — diğer adaylar çözüm önersin, sen de onlarınkine bak. Sınava en iyi hazırlık başkalarının hatalarından öğrenmek."
          actionLabel="İlk Soruyu Paylaş"
          onAction={onSwitchToMine}
          color="accent"
        />
      ) : (
        <FlatList
          data={filtered} renderItem={renderItem}
          keyExtractor={(i) => i.id} showsVerticalScrollIndicator={false}
          windowSize={5}
          maxToRenderPerBatch={10}
          contentContainerStyle={{ gap: SPACING.md, paddingHorizontal: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={C.accent} colors={[C.accent]} />}
        />
      )}
    </View>
  );
}
