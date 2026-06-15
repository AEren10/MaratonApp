import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Icon } from "../../../components/design";
import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import { getWrongQuestionImageUrl } from "../../../supabase/storage";
import { getTopicDifficulty } from "../../../lib/topicDifficulty";

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

function resolveSubject(raw) {
  if (typeof raw === "string") {
    const found = getSubjectByKey(raw);
    return found
      ? { key: raw, label: found.label, color: found.color, icon: found.icon }
      : { key: raw, label: raw, color: "#9A9EAB", icon: "bookOpen" };
  }
  return raw || { key: "?", label: "?", color: "#9A9EAB", icon: "bookOpen" };
}

// Twitter-tweet benzeri kart: kimlik avatar + ders/konu + içerik + büyük foto + meta.
export function WrongCard({ item, onPress, onResolve }) {
  const C = useC();
  const subj = resolveSubject(item.subject);
  const id = useSubjectIdentity(subj.key);
  const subjColor = id?.solid || subj.color;
  const diff = !item.is_resolved ? getTopicDifficulty(item.topic) : null;
  const imageUri = item.image_path
    ? getWrongQuestionImageUrl(item.image_path)
    : item.image || null;
  const myA = item.my_answer ?? item.myAnswer;
  const corA = item.correct_answer ?? item.correctAnswer;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: C.surface,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: item.is_resolved ? C.green + "30" : C.border,
        padding: 14,
        opacity: pressed ? 0.95 : item.is_resolved ? 0.7 : 1,
      })}
    >
      {/* Header row — avatar + ders chip + tarih + resolve check */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{
          width: 40, height: 40, borderRadius: 14,
          backgroundColor: subjColor + "1A",
          alignItems: "center", justifyContent: "center",
        }}>
          <Icon name={subj.icon} size={20} color={subjColor} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: C.text }}>
              {subj.label}
            </Text>
            <Text style={{ color: C.muted, fontSize: 13 }}>·</Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: C.muted }}>
              {relativeDate(item.created_at)}
            </Text>
          </View>
          {item.topic ? (
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: C.sec, marginTop: 1 }} numberOfLines={1}>
              {item.topic}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={onResolve}
          hitSlop={8}
          style={{
            width: 30, height: 30, borderRadius: 10,
            backgroundColor: item.is_resolved ? C.green + "26" : C.surface2,
            borderWidth: 1,
            borderColor: item.is_resolved ? C.green : C.border,
            alignItems: "center", justifyContent: "center",
          }}
        >
          {item.is_resolved ? <Icon name="check" size={14} color={C.green} sw={3} /> : null}
        </Pressable>
      </View>

      {/* İçerik (not) */}
      {item.note ? (
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 15,
            color: C.text,
            lineHeight: 21,
            marginTop: 10,
          }}
          numberOfLines={3}
        >
          {item.note}
        </Text>
      ) : null}

      {/* Foto — büyük, twitter style */}
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{
            marginTop: 12,
            height: 200,
            borderRadius: 16,
            backgroundColor: C.surface2,
          }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
      ) : null}

      {/* Meta row — cevaplar + zorluk badge */}
      {(myA || diff) ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {myA && corA ? (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 5,
              backgroundColor: C.surface2,
              paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999,
            }}>
              <Text style={{ fontSize: 12, color: C.red, fontFamily: "Inter_600SemiBold" }}>{myA}</Text>
              <Icon name="arrowR" size={11} color={C.muted} />
              <Text style={{ fontSize: 12, color: C.green, fontFamily: "Inter_600SemiBold" }}>{corA}</Text>
            </View>
          ) : null}

          {diff ? (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              backgroundColor: diff.color + "16",
              paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
            }}>
              <Icon name="users" size={10} color={diff.color} />
              <Text style={{ fontSize: 11, color: diff.color, fontFamily: "Inter_600SemiBold" }}>
                ~%{diff.correctRate} doğru · -{diff.netLoss}
              </Text>
            </View>
          ) : null}

          {item.is_resolved ? (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              backgroundColor: C.green + "18",
              paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
            }}>
              <Icon name="check" size={10} color={C.green} />
              <Text style={{ fontSize: 11, color: C.green, fontFamily: "Inter_600SemiBold" }}>
                Çözüldü
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}
