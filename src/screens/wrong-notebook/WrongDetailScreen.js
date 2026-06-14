import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Modal } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Icon, IconBox, Chip } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { getWrongQuestionImageUrl } from "../../supabase/storage";
import { resolveWrongQuestion } from "../../supabase/wrongQuestions";
import { getSubjectByKey } from "../../themes/subjects";
import { useGamification } from "../../hooks/useGamification";

function InfoRow({ icon, label, value, color }) {
  return (
    <View style={styles.infoRow}>
      <Icon name={icon} size={16} color={color || C.muted} />
      <Text style={[TYPOGRAPHY.caption, { color: C.sec, flex: 1 }]}>{label}</Text>
      <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>{value}</Text>
    </View>
  );
}

function AnswerBadge({ label, answer, color }) {
  return (
    <View style={[styles.answerBox, { borderColor: color + "40" }]}>
      <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>{label}</Text>
      <Text style={[TYPOGRAPHY.statSmall, { color }]}>{answer}</Text>
    </View>
  );
}

export default function WrongDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { item: passedItem } = route.params ?? {};
  const [photoZoom, setPhotoZoom] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [localResolved, setLocalResolved] = useState(false);
  const { reward } = useGamification();

  const item = passedItem || {};
  const subjectKey = typeof item.subject === "string" ? item.subject : item.subject?.key;
  const s = getSubjectByKey(subjectKey) || { key: subjectKey, label: subjectKey, color: "#9A9EAB", icon: "bookOpen" };
  const imageUrl = item.image_path ? getWrongQuestionImageUrl(item.image_path) : null;
  const date = new Date(item.created_at).toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>
          Soru Detayi
        </Text>
        <Chip color={item.is_resolved ? C.green : C.red}>
          {item.is_resolved ? "Cozuldu" : "Bekliyor"}
        </Chip>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.subjectCard, { borderLeftColor: s.color }]}>
          <IconBox icon={s.icon} color={s.color} size={44} rounded={14} />
          <View style={{ flex: 1 }}>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{s.label || s.name}</Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.sec, marginTop: 2 }]}>{item.topic}</Text>
          </View>
        </View>

        <View style={styles.answersRow}>
          <AnswerBadge label="Benim cevabim" answer={item.my_answer ?? item.myAnswer ?? "-"} color={C.red} />
          <AnswerBadge label="Dogru cevap" answer={item.correct_answer ?? item.correctAnswer ?? "-"} color={C.green} />
        </View>

        <View style={styles.section}>
          <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>
            DETAYLAR
          </Text>
          <InfoRow icon="calendar" label="Tarih" value={date} />
          <InfoRow icon="bookOpen" label="Konu" value={item.topic} color={s.color} />
        </View>

        <View style={styles.section}>
          <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>
            NOTLARIM
          </Text>
          <View style={styles.noteCard}>
            <Text style={[TYPOGRAPHY.body, { color: C.sec }]}>
              {item.note || "Not eklenmedi."}
            </Text>
          </View>
        </View>

        {imageUrl && (
          <View style={styles.section}>
            <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>
              FOTOĞRAF
            </Text>
            <Pressable onPress={() => setPhotoZoom(true)}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.photo}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
              <View style={styles.zoomHint}>
                <Icon name="eye" size={14} color={C.text} />
                <Text style={[TYPOGRAPHY.micro, { color: C.sec }]}>Büyütmek için dokun</Text>
              </View>
            </Pressable>
          </View>
        )}

        {!item.is_resolved && !localResolved && (
          <Pressable
            onPress={async () => {
              if (resolving) return;
              setResolving(true);
              try {
                await resolveWrongQuestion(item.id);
                setLocalResolved(true);
                reward("wrong_resolved", {
                  statUpdates: [{ type: "increment", key: "wrongsResolved" }],
                });
                Alert.alert("Çözüldü", "Bu soru çözüldü olarak işaretlendi.");
                navigation.goBack();
              } catch (e) {
                Alert.alert("Hata", e.message || "Kaydedilemedi.");
              } finally {
                setResolving(false);
              }
            }}
            disabled={resolving}
            style={[styles.resolveBtn, resolving && { opacity: 0.6 }]}
          >
            <Icon name="check" size={20} color={C.bg} />
            <Text style={[TYPOGRAPHY.button, { color: C.bg }]}>
              {resolving ? "İşleniyor..." : "Çözüldü İşaretle"}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {imageUrl && (
        <Modal visible={photoZoom} transparent animationType="fade">
          <View style={styles.zoomOverlay}>
            <Pressable style={styles.zoomClose} onPress={() => setPhotoZoom(false)}>
              <Icon name="x" size={22} color={C.text} />
            </Pressable>
            <Image
              source={{ uri: imageUrl }}
              style={styles.zoomImage}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },
  subjectCard: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    backgroundColor: C.surface, borderRadius: RADIUS.xl,
    borderLeftWidth: 3, padding: SPACING.lg, marginBottom: SPACING.xl,
  },
  answersRow: {
    flexDirection: "row", gap: SPACING.md, marginBottom: SPACING.xxl,
  },
  answerBox: {
    flex: 1, alignItems: "center", paddingVertical: SPACING.lg,
    backgroundColor: C.surface, borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
  section: { marginBottom: SPACING.xxl },
  infoRow: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  noteCard: {
    backgroundColor: C.surface, borderRadius: RADIUS.lg,
    padding: SPACING.lg, borderWidth: 1, borderColor: C.border,
  },
  resolveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm,
    backgroundColor: C.green, borderRadius: RADIUS.xl, paddingVertical: SPACING.lg,
  },
  photo: {
    width: "100%", height: 200, borderRadius: RADIUS.lg,
    backgroundColor: C.surface,
  },
  zoomHint: {
    flexDirection: "row", alignItems: "center", gap: 4,
    position: "absolute", bottom: 8, right: 8,
    backgroundColor: C.bg + "CC", borderRadius: RADIUS.sm,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  zoomOverlay: {
    flex: 1, backgroundColor: C.bg + "F0",
    alignItems: "center", justifyContent: "center",
  },
  zoomClose: {
    position: "absolute", top: 60, right: 20, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.surface, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: C.border,
  },
  zoomImage: {
    width: "92%", height: "70%",
  },
});
