import { useCallback, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { useQuestionAnswers } from "../../../hooks/useQuestionAnswers";
import * as H from "../../../lib/haptics";
import { AnswerRow } from "./AnswerRow";
import { AnswerThreadSkeleton } from "./AnswerThreadSkeleton";

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
        <AnswerThreadSkeleton />
      ) : answers.length === 0 ? (
        <View style={s.empty}>
          <Icon name="chat" size={20} color={C.text3} />
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
          placeholderTextColor={C.text3}
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
            <Icon name={anonymous ? "checkCircle" : "circle"} size={16} color={anonymous ? C.accent : C.text3} />
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

function makeStyles(C) {
  return StyleSheet.create({
    wrap: { marginTop: STEP.s5, gap: STEP.s3 },
    headRow: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
    sectionLabel: { ...TYPOGRAPHY.label, color: C.text3 },
    count: { ...TYPOGRAPHY.captionMedium, color: C.text2 },
    center: { paddingVertical: STEP.s5, alignItems: "center" },
    empty: {
      alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s5,
      borderRadius: SHAPE.cardTight, backgroundColor: C.surface,
    },
    emptyText: { ...TYPOGRAPHY.caption, color: C.text3, textAlign: "center" },

    answer: {
      flexDirection: "row", gap: STEP.s3, padding: STEP.s3,
      backgroundColor: C.surface, borderRadius: SHAPE.cardTight,
      borderWidth: 1, borderColor: C.border,
    },
    answerHead: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
    answerName: { ...TYPOGRAPHY.captionMedium, color: C.text },
    answerTime: { ...TYPOGRAPHY.micro, color: C.text3 },
    answerText: { ...TYPOGRAPHY.caption, color: C.text2, lineHeight: 19 },
    answerImage: { width: "100%", height: 160, borderRadius: SHAPE.button, marginTop: STEP.s2 },

    composer: {
      backgroundColor: C.surface, borderRadius: SHAPE.cardTight,
      borderWidth: 1, borderColor: C.border, padding: STEP.s3, gap: STEP.s2,
    },
    input: { ...TYPOGRAPHY.body, color: C.text, minHeight: 64, textAlignVertical: "top" },
    composerFoot: { flexDirection: "row", alignItems: "center", gap: STEP.s3 },
    anonBtn: { flexDirection: "row", alignItems: "center", gap: STEP.s1, minHeight: 44, paddingRight: STEP.s2 },
    anonText: { ...TYPOGRAPHY.caption, color: C.text3 },
    counter: { ...TYPOGRAPHY.micro, color: C.text3, flex: 1, textAlign: "right" },
    sendBtn: {
      width: 44, height: 44, borderRadius: SHAPE.button, backgroundColor: C.accent,
      alignItems: "center", justifyContent: "center",
    },
    hint: { ...TYPOGRAPHY.micro, color: C.danger },
  });
}

