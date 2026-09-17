// Topluluk sorusu detayi (WrongDetail, params.community === true).
// Sosyal v1 disi; bu yol yeni tasarima TASINMADI, eski WrongDetailScreen
// govdesi degistirilmeden buraya alindi ki derin baglanti kirilmasin.
import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Icon, IconBox, Chip } from "../../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../../themes/tokens";
import { useC } from "../../../../contexts/ThemeContext";
import SignedImage from "../../../../components/common/SignedImage";
import { resolveWrongQuestion, getWrongQuestionById } from "../../../../supabase/wrongQuestions";
import { useAuth } from "../../../../contexts/AuthContext";
import { getSubjectByKey } from "../../../../themes/subjects";
import { useGamification } from "../../../../hooks/useGamification";
import { useAlert } from "../../../../contexts/AlertContext";
import * as H from "../../../../lib/haptics";
import { AnswerThread } from "../AnswerThread";

function InfoRow({ icon, label, value, color, styles, C }) {
  return (
    <View style={styles.infoRow}>
      <Icon name={icon} size={16} color={color || C.text3} />
      <Text style={[TYPOGRAPHY.caption, { color: C.text2, flex: 1 }]}>{label}</Text>
      <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>{value}</Text>
    </View>
  );
}

function AnswerBadge({ label, answer, color, styles, C }) {
  return (
    <View style={[styles.answerBox, { borderColor: color + "40" }]}>
      <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{label}</Text>
      <Text style={[TYPOGRAPHY.statSmall, { color }]}>{answer}</Text>
    </View>
  );
}

export function CommunityQuestionDetail() {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const route = useRoute();
  const showAlert = useAlert();
  const { user } = useAuth();
  const { item: passedItem, id: linkedId, community } = route.params ?? {};
  const [photoZoom, setPhotoZoom] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [localResolved, setLocalResolved] = useState(false);
  const { reward } = useGamification();

  // Deep link (`yanlis/:id`) yalnızca id taşıyor; ekran sadece params.item
  // okuduğu için boş bir kart ve "Invalid Date" gösteriyordu.
  const [fetched, setFetched] = useState(null);
  useEffect(() => {
    if (passedItem || !linkedId || !user?.id) return;
    let cancelled = false;
    getWrongQuestionById(linkedId, user.id)
      .then((d) => { if (!cancelled && d) setFetched(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [passedItem, linkedId, user?.id]);

  const item = passedItem || fetched || {};
  const subjectKey = typeof item.subject === "string" ? item.subject : item.subject?.key;
  const s = getSubjectByKey(subjectKey) || { key: subjectKey, label: subjectKey, color: C.text3, icon: "bookOpen" };
  const hasImage = !!item.image_path;
  const date = item.created_at
    ? new Date(item.created_at).toLocaleDateString("tr-TR", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "";

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: STEP.s3 }]}>
          Soru Detayı
        </Text>
        {!community && (
          <Chip color={item.is_resolved ? C.green : C.red}>
            {item.is_resolved ? "Çözüldü" : "Bekliyor"}
          </Chip>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(60).duration(400).springify()} style={[styles.subjectCard, { borderLeftColor: s.color }]}>
          <IconBox icon={s.icon} color={s.color} size={44} rounded={14} />
          <View style={{ flex: 1 }}>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{s.label || s.name}</Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.text2, marginTop: 2 }]}>{item.topic}</Text>
          </View>
        </Animated.View>

        {!community && (
          <Animated.View entering={FadeInDown.delay(120).duration(400).springify()} style={styles.answersRow}>
            <AnswerBadge label="Benim cevabım" answer={item.my_answer ?? item.myAnswer ?? "-"} color={C.red} styles={styles} C={C} />
            <AnswerBadge label="Doğru cevap" answer={item.correct_answer ?? item.correctAnswer ?? "-"} color={C.green} styles={styles} C={C} />
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(180).duration(400).springify()} style={styles.section}>
          <Text style={[TYPOGRAPHY.label, { color: C.text2, marginBottom: STEP.s3 }]}>
            DETAYLAR
          </Text>
          <InfoRow icon="calendar" label="Tarih" value={date} styles={styles} C={C} />
          <InfoRow icon="bookOpen" label="Konu" value={item.topic} color={s.color} styles={styles} C={C} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(400).springify()} style={styles.section}>
          <Text style={[TYPOGRAPHY.label, { color: C.text2, marginBottom: STEP.s3 }]}>
            NOTLARIM
          </Text>
          <View style={styles.noteCard}>
            <Text style={[TYPOGRAPHY.body, { color: C.text2 }]}>
              {item.note || "Not eklenmedi."}
            </Text>
          </View>
        </Animated.View>

        {hasImage && (
          <Animated.View entering={FadeInDown.delay(300).duration(400).springify()} style={styles.section}>
            <Text style={[TYPOGRAPHY.label, { color: C.text2, marginBottom: STEP.s3 }]}>
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
                <Text style={[TYPOGRAPHY.micro, { color: C.text2 }]}>Büyütmek için dokun</Text>
              </View>
            </Pressable>
          </Animated.View>
        )}

        {!community && !item.is_resolved && !localResolved && (
          <Animated.View entering={FadeInDown.delay(360).duration(400).springify()}>
            <Pressable
              onPress={async () => {
                if (resolving) return;
                setResolving(true);
                try {
                  await resolveWrongQuestion(item.id, user.id);
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

        {/* Topluluktan gelindiyse cevap akışı. Backend (getAnswers/postAnswer/
            subscribeToAnswers) zaten yazılıydı ama hiçbir ekran çağırmıyordu —
            "soruya cevap yaz" özelliği arayüzsüz duruyordu. */}
        {community && item?.id && (
          <Animated.View entering={FadeInDown.delay(400).duration(400).springify()}>
            <AnswerThread sharedQuestionId={item.shared_question_id || item.id} />
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
      paddingHorizontal: GUTTER, paddingVertical: STEP.s3,
    },
    scroll: { paddingHorizontal: GUTTER, paddingBottom: 60 },
    subjectCard: {
      flexDirection: "row", alignItems: "center", gap: STEP.s3,
      backgroundColor: C.surface, borderRadius: SHAPE.sheet,
      borderLeftWidth: 3, padding: STEP.s4, marginBottom: STEP.s5,
    },
    answersRow: {
      flexDirection: "row", gap: STEP.s3, marginBottom: STEP.s5,
    },
    answerBox: {
      flex: 1, alignItems: "center", paddingVertical: STEP.s4,
      backgroundColor: C.surface, borderRadius: SHAPE.sheet,
      borderWidth: 1,
    },
    section: { marginBottom: STEP.s5 },
    infoRow: {
      flexDirection: "row", alignItems: "center", gap: STEP.s2,
      paddingVertical: STEP.s3, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    noteCard: {
      backgroundColor: C.surface, borderRadius: SHAPE.card,
      padding: STEP.s4, borderWidth: 1, borderColor: C.border,
    },
    resolveBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: STEP.s2,
      backgroundColor: C.green, borderRadius: SHAPE.sheet, paddingVertical: STEP.s4,
    },
    photo: {
      width: "100%", height: 200, borderRadius: SHAPE.card,
      backgroundColor: C.surface,
    },
    zoomHint: {
      flexDirection: "row", alignItems: "center", gap: 4,
      position: "absolute", bottom: 8, right: 8,
      backgroundColor: C.bg + "CC", borderRadius: SHAPE.cardTight,
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

