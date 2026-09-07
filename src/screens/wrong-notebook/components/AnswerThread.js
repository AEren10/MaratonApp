import { useCallback, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from "react-native";

import { Icon, Avatar } from "../../../components/design";
import SignedImage from "../../../components/common/SignedImage";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { useQuestionAnswers } from "../../../hooks/useQuestionAnswers";
import { formatTime, formatShortDate } from "../../../lib/format";
import * as H from "../../../lib/haptics";

const MAX_LEN = 600;

/**
 * Topluluk cevap akışı — soru detayının altında.
 *
 * TASARIM NOTU: yeni tasarımda AKIŞ 10'da "Soru Sor → Cevap Yaz" olarak
 * geçiyor. Burada veri ve durum yönetimi hazır; görsel yeniden yazılırken
 * useQuestionAnswers hook'unu aynen kullanabilirsin — { answers, loading,
 * posting, submit } döndürüyor ve realtime aboneliği kendi yönetiyor.
 */
export function AnswerThread({ sharedQuestionId }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const { answers, loading, posting, submit } = useQuestionAnswers(sharedQuestionId);
  const [draft, setDraft] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [hint, setHint] = useState(null);

  const onSend = useCallback(async () => {
    const res = await submit({ text: draft, isAnonymous: anonymous });
    if (res.ok) {
      H.success();
      setDraft("");
      setHint(null);
      return;
    }
    if (res.reason === "empty") setHint("Önce bir şeyler yaz.");
    else if (res.reason === "auth") setHint("Cevap yazmak için giriş yapmalısın.");
    else if (res.reason === "network") setHint("Gönderilemedi. Bağlantını kontrol et.");
  }, [submit, draft, anonymous]);

  const canSend = draft.trim().length > 0 && !posting;

  return (
    <View style={s.wrap}>
      <View style={s.headRow}>
        <Text style={s.sectionLabel}>CEVAPLAR</Text>
        <Text style={s.count}>{answers.length}</Text>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={C.accent} /></View>
      ) : answers.length === 0 ? (
        <View style={s.empty}>
          <Icon name="chat" size={20} color={C.muted} />
          <Text style={s.emptyText}>Henüz cevap yok. İlk açıklamayı sen yaz.</Text>
        </View>
      ) : (
        answers.map((a) => <AnswerRow key={a.id} answer={a} s={s} C={C} />)
      )}

      <View style={s.composer}>
        <TextInput
          value={draft}
          onChangeText={(t) => { setDraft(t.slice(0, MAX_LEN)); if (hint) setHint(null); }}
          placeholder="Bu soruyu nasıl çözdün?"
          placeholderTextColor={C.muted}
          multiline
          style={s.input}
          accessibilityLabel="Cevabın"
        />
        <View style={s.composerFoot}>
          <Pressable
            onPress={() => setAnonymous((v) => !v)}
            accessibilityRole="switch"
            accessibilityState={{ checked: anonymous }}
            accessibilityLabel="Anonim yaz"
            style={s.anonBtn}
          >
            <Icon name={anonymous ? "checkCircle" : "circle"} size={16} color={anonymous ? C.accent : C.muted} />
            <Text style={[s.anonText, anonymous && { color: C.text }]}>Anonim</Text>
          </Pressable>

          <Text style={s.counter}>{draft.length}/{MAX_LEN}</Text>

          <Pressable
            onPress={onSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Cevabı gönder"
            style={[s.sendBtn, !canSend && { opacity: 0.45 }]}
          >
            {posting
              ? <ActivityIndicator size="small" color={C.textOnFill} />
              : <Icon name="arrowR" size={16} color={C.textOnFill} />}
          </Pressable>
        </View>
        {hint ? <Text style={s.hint}>{hint}</Text> : null}
      </View>
    </View>
  );
}

function AnswerRow({ answer, s, C }) {
  const name = answer.profile?.name || "Anonim";
  const when = answer.created_at
    ? `${formatShortDate(answer.created_at)} · ${formatTime(answer.created_at)}`
    : "";
  return (
    <View style={s.answer}>
      <Avatar init={name.slice(0, 2).toUpperCase()} size={28} image={answer.profile?.avatar_url} />
      <View style={{ flex: 1 }}>
        <View style={s.answerHead}>
          <Text style={s.answerName}>{name}</Text>
          <Text style={s.answerTime}>{when}</Text>
        </View>
        {answer.text ? <Text style={s.answerText}>{answer.text}</Text> : null}
        {answer.image_path ? (
          <SignedImage
            bucket="community-answers"
            path={answer.image_path}
            style={s.answerImage}
            contentFit="cover"
          />
        ) : null}
      </View>
    </View>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    wrap: { marginTop: SPACING.xxl, gap: SPACING.md },
    headRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
    sectionLabel: { ...TYPOGRAPHY.label, color: C.muted },
    count: { ...TYPOGRAPHY.captionMedium, color: C.sec },
    center: { paddingVertical: SPACING.xl, alignItems: "center" },
    empty: {
      alignItems: "center", gap: SPACING.sm, paddingVertical: SPACING.xl,
      borderRadius: RADIUS.lg, backgroundColor: C.surface,
    },
    emptyText: { ...TYPOGRAPHY.caption, color: C.muted, textAlign: "center" },

    answer: {
      flexDirection: "row", gap: SPACING.md, padding: SPACING.md,
      backgroundColor: C.surface, borderRadius: RADIUS.lg,
      borderWidth: 1, borderColor: C.border,
    },
    answerHead: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
    answerName: { ...TYPOGRAPHY.captionMedium, color: C.text },
    answerTime: { ...TYPOGRAPHY.micro, color: C.muted },
    answerText: { ...TYPOGRAPHY.caption, color: C.sec, lineHeight: 19 },
    answerImage: { width: "100%", height: 160, borderRadius: RADIUS.md, marginTop: SPACING.sm },

    composer: {
      backgroundColor: C.surface, borderRadius: RADIUS.lg,
      borderWidth: 1, borderColor: C.border, padding: SPACING.md, gap: SPACING.sm,
    },
    input: { ...TYPOGRAPHY.body, color: C.text, minHeight: 64, textAlignVertical: "top" },
    composerFoot: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
    anonBtn: { flexDirection: "row", alignItems: "center", gap: SPACING.xs, minHeight: 44, paddingRight: SPACING.sm },
    anonText: { ...TYPOGRAPHY.caption, color: C.muted },
    counter: { ...TYPOGRAPHY.micro, color: C.muted, flex: 1, textAlign: "right" },
    sendBtn: {
      width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: C.accent,
      alignItems: "center", justifyContent: "center",
    },
    hint: { ...TYPOGRAPHY.micro, color: C.danger },
  });
}
