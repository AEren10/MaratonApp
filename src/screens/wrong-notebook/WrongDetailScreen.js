import { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, IconBox, Chip } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import SignedImage from "../../components/common/SignedImage";
import { resolveWrongQuestion } from "../../supabase/wrongQuestions";
import { getSubjectByKey } from "../../themes/subjects";
import { useGamification } from "../../hooks/useGamification";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

function InfoRow({ icon, label, value, color, styles, C }) {
  return (
    <View style={styles.infoRow}>
      <Icon name={icon} size={16} color={color || C.muted} />
      <Text style={[TYPOGRAPHY.caption, { color: C.sec, flex: 1 }]}>{label}</Text>
      <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>{value}</Text>
    </View>
  );
}

function AnswerBadge({ label, answer, color, styles, C }) {
  return (
    <View style={[styles.answerBox, { borderColor: color + "40" }]}>
      <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>{label}</Text>
      <Text style={[TYPOGRAPHY.statSmall, { color }]}>{answer}</Text>
    </View>
  );
}

export default function WrongDetailScreen() {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const route = useRoute();
  const showAlert = useAlert();
  const { item: passedItem } = route.params ?? {};
  const [photoZoom, setPhotoZoom] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [localResolved, setLocalResolved] = useState(false);
  const { reward } = useGamification();

  const item = passedItem || {};
  const subjectKey = typeof item.subject === "string" ? item.subject : item.subject?.key;
  const s = getSubjectByKey(subjectKey) || { key: subjectKey, label: subjectKey, color: C.muted, icon: "bookOpen" };
  const hasImage = !!item.image_path;
  const date = new Date(item.created_at).toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
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
        <Animated.View entering={FadeInDown.delay(60).duration(400).springify()} style={[styles.subjectCard, { borderLeftColor: s.color }]}>
          <IconBox icon={s.icon} color={s.color} size={44} rounded={14} />
          <View style={{ flex: 1 }}>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{s.label || s.name}</Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.sec, marginTop: 2 }]}>{item.topic}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(400).springify()} style={styles.answersRow}>
          <AnswerBadge label="Benim cevabim" answer={item.my_answer ?? item.myAnswer ?? "-"} color={C.red} styles={styles} C={C} />
          <AnswerBadge label="Dogru cevap" answer={item.correct_answer ?? item.correctAnswer ?? "-"} color={C.green} styles={styles} C={C} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(400).springify()} style={styles.section}>
          <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>
            DETAYLAR
          </Text>
          <InfoRow icon="calendar" label="Tarih" value={date} styles={styles} C={C} />
          <InfoRow icon="bookOpen" label="Konu" value={item.topic} color={s.color} styles={styles} C={C} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(400).springify()} style={styles.section}>
          <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>
            NOTLARIM
          </Text>
          <View style={styles.noteCard}>
            <Text style={[TYPOGRAPHY.body, { color: C.sec }]}>
              {item.note || "Not eklenmedi."}
            </Text>
          </View>
        </Animated.View>

        {hasImage && (
          <Animated.View entering={FadeInDown.delay(300).duration(400).springify()} style={styles.section}>
            <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>
              FOTOĞRAF
            </Text>
            <Pressable onPress={() => setPhotoZoom(true)}>
              <SignedImage
                bucket="wrong-questions"
                path={item.image_path}
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
          </Animated.View>
        )}

        {!item.is_resolved && !localResolved && (
          <Animated.View entering={FadeInDown.delay(360).duration(400).springify()}>
            <Pressable
              onPress={async () => {
                if (resolving) return;
                setResolving(true);
                try {
                  await resolveWrongQuestion(item.id);
                  H.success();
                  setLocalResolved(true);
                  reward("wrong_resolved", {
                    statUpdates: [{ type: "increment", key: "wrongsResolved" }],
                  });
                  showAlert("Çözüldü", "Bu soru çözüldü olarak işaretlendi.");
                  navigation.goBack();
                } catch (e) {
                  showAlert("Hata", e.message || "Kaydedilemedi.");
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
          </Animated.View>
        )}
      </ScrollView>

      {hasImage && (
        <Modal visible={photoZoom} transparent animationType="fade">
          <View style={styles.zoomOverlay}>
            <Pressable style={styles.zoomClose} onPress={() => setPhotoZoom(false)} accessibilityLabel="Kapat" accessibilityRole="button">
              <Icon name="x" size={22} color={C.text} />
            </Pressable>
            <SignedImage
              bucket="wrong-questions"
              path={item.image_path}
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

function makeStyles(C) {
  return StyleSheet.create({
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
}
