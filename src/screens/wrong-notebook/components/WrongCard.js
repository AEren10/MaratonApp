import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";
import { usePressScale } from "../../../components/design/usePressScale";
import { Icon } from "../../../components/design";
import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import SignedImage from "../../../components/common/SignedImage";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { alpha } from "../../../themes/palette";

function relativeDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 1) {
    const h = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60));
    return h <= 0 ? "Az önce" : `${h}sa`;
  }
  if (diff < 2) return "Dün";
  if (diff < 7) return `${Math.floor(diff)}g`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function resolveSubject(raw, C) {
  if (typeof raw === "string") {
    const found = getSubjectByKey(raw);
    return found
      ? { key: raw, label: found.label, color: found.color, icon: found.icon }
      : { key: raw, label: raw, color: C.text3, icon: "bookOpen" };
  }
  return raw || { key: "?", label: "?", color: C.text3, icon: "bookOpen" };
}

export function WrongCard({ item, onPress, onResolve, onShare, shared }) {
  const C = useC();
  const subj = resolveSubject(item.subject, C);
  const id = useSubjectIdentity(subj.key);
  const subjColor = id?.solid || subj.color;
  const imagePath = item.image_path || null;
  const fallbackImage = item.image || null;
  const myA = item.my_answer ?? item.myAnswer;
  const corA = item.correct_answer ?? item.correctAnswer;

  const press = usePressScale(0.985);
  const pressStyle = press.style;

  const statusColor = item.is_resolved ? C.text3 : C.warn;
  // Sagdaki metin bir DUGME: basinca cozuldu isaretlenir. "Acik" yazmak
  // ne olacagini soylemiyordu; eylem adi yaziliyor.
  const statusText = item.is_resolved ? "Çözüldü" : "Çözdüm";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${subj.label}${item.topic ? `, ${item.topic}` : ""}${item.is_resolved ? ", çözüldü" : ""}`}
      accessibilityHint="Detayları görmek için dokun"
      onPress={onPress}
      onPressIn={press.onIn}
      onPressOut={press.onOut}
      style={[s.row, { borderBottomColor: C.line }]}
    >
      <Animated.View style={[s.inner, pressStyle]}>
        {/* Sol: küçük kare fotoğraf veya ders ikonu */}
        {imagePath || fallbackImage ? (
          imagePath ? (
            <SignedImage bucket="wrong-questions" path={imagePath} style={[s.thumb, { backgroundColor: C.elev }]} contentFit="cover" transition={200} />
          ) : (
            <Image source={{ uri: fallbackImage }} style={[s.thumb, { backgroundColor: C.elev }]} contentFit="cover" cachePolicy="memory-disk" transition={200} />
          )
        ) : (
          <View style={[s.iconBox, { backgroundColor: alpha(subjColor, 10) }]}>
            <Icon name={subj.icon} size={18} color={subjColor} />
          </View>
        )}

        {/* Orta: ders · konu ve tarih */}
        <View style={s.body}>
          <View style={s.titleRow}>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>{subj.label}</Text>
            {item.topic ? (
              <>
                <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}> · </Text>
                <Text style={[TYPOGRAPHY.caption, { color: C.text2, flex: 1 }]} numberOfLines={1}>{item.topic}</Text>
              </>
            ) : null}
          </View>
          <WrongCardMeta C={C} item={item} myA={myA} corA={corA} />
        </View>

        {/* Sağ: durum metni + resolve düğmesi */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={item.is_resolved ? "Çözüldü" : "Çözdüm olarak işaretle"}
          onPress={onResolve}
          hitSlop={10}
          style={s.statusBtn}
        >
          <Icon name={item.is_resolved ? "check" : "circle"} size={13} color={statusColor} sw={item.is_resolved ? 2.5 : 1.5} />
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: statusColor }]}>{statusText}</Text>
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

// Alt satır: tarih, cevap bilgisi, paylaş
function WrongCardMeta({ C, item, myA, corA }) {
  const dateText = relativeDate(item.created_at);
  const answerText = myA && corA ? `${myA} → ${corA}` : null;

  return (
    <View style={s.metaRow}>
      {dateText ? <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{dateText}</Text> : null}
      {answerText ? (
        <>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}> · </Text>
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>{answerText}</Text>
        </>
      ) : null}
      {item.note ? (
        <>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}> · </Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]} numberOfLines={1}>Not var</Text>
        </>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    minHeight: CONTROL.tapMin,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: SHAPE.iconBox,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: SHAPE.iconBox,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  statusBtn: {
    minHeight: CONTROL.tapMin,
    paddingHorizontal: STEP.s1,
    flexDirection: "row",
    gap: STEP.s1 / 2,
    justifyContent: "center",
    alignItems: "center",
  },
});