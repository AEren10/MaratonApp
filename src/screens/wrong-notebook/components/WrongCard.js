import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import SignedImage from "../../../components/common/SignedImage";
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

function resolveSubject(raw, C) {
  if (typeof raw === "string") {
    const found = getSubjectByKey(raw);
    return found
      ? { key: raw, label: found.label, color: found.color, icon: found.icon }
      : { key: raw, label: raw, color: C.muted, icon: "bookOpen" };
  }
  return raw || { key: "?", label: "?", color: C.muted, icon: "bookOpen" };
}

// Twitter-tweet benzeri kart: kimlik avatar + ders/konu + içerik + büyük foto + meta.
export function WrongCard({ item, onPress, onResolve, onShare, shared }) {
  const C = useC();
  const subj = resolveSubject(item.subject, C);
  const id = useSubjectIdentity(subj.key);
  const subjColor = id?.solid || subj.color;
  const diff = !item.is_resolved ? getTopicDifficulty(item.topic) : null;
  const imagePath = item.image_path || null;
  const fallbackImage = item.image || null;
  const myA = item.my_answer ?? item.myAnswer;
  const corA = item.correct_answer ?? item.correctAnswer;

  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${subj.label}${item.topic ? `, ${item.topic}` : ""}${item.is_resolved ? ", çözüldü" : ""}`}
      accessibilityHint="Detayları görmek için dokun"
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      style={{
        backgroundColor: C.surface,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: item.is_resolved ? C.green + "30" : C.border,
        padding: 14,
      }}
    >
      <Animated.View style={pressStyle}>
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
          accessibilityRole="button"
          accessibilityLabel={item.is_resolved ? "Çözüldü" : "Çözdüm olarak işaretle"}
          accessibilityHint={item.is_resolved ? "" : "Yanlışı çözülmüş olarak işaretler"}
          onPress={onResolve}
          hitSlop={8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 999,
            backgroundColor: item.is_resolved ? C.green + "1A" : C.amber + "14",
            borderWidth: 1,
            borderColor: item.is_resolved ? C.green + "40" : C.amber + "30",
          }}
        >
          <Icon name={item.is_resolved ? "check" : "circle"} size={14} color={item.is_resolved ? C.green : C.amber} sw={item.is_resolved ? 3 : 1.5} />
          <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: item.is_resolved ? C.green : C.amber }}>
            {item.is_resolved ? "Çözüldü" : "Çözdüm"}
          </Text>
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
      {(imagePath || fallbackImage) ? (
        imagePath ? (
          <SignedImage
            bucket="wrong-questions"
            path={imagePath}
            style={{ marginTop: 12, height: 200, borderRadius: 16, backgroundColor: C.surface2 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Image
            source={{ uri: fallbackImage }}
            style={{ marginTop: 12, height: 200, borderRadius: 16, backgroundColor: C.surface2 }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
        )
      ) : null}

      {/* Meta row — cevaplar + zorluk + share */}
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
            backgroundColor: C[diff.colorKey] + "16",
            paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
          }}>
            <Icon name="users" size={10} color={C[diff.colorKey]} />
            <Text style={{ fontSize: 11, color: C[diff.colorKey], fontFamily: "Inter_600SemiBold" }}>
              ~%{diff.correctRate} doğru · -{diff.netLoss}
            </Text>
          </View>
        ) : null}

        <View style={{ flex: 1 }} />

        {onShare ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={shared ? "Paylaşıldı" : "Paylaş"}
            accessibilityHint={shared ? "" : "Soruyu toplulukla paylaşır"}
            onPress={onShare}
            hitSlop={8}
            style={({ pressed }) => ({
              flexDirection: "row", alignItems: "center", gap: 6,
              backgroundColor: shared ? C.green + "18" : C.accent + "14",
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
              borderWidth: 1,
              borderColor: shared ? C.green + "30" : C.accent + "30",
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Icon name={shared ? "check" : "share"} size={14} color={shared ? C.green : C.accent} />
            <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: shared ? C.green : C.accent }}>
              {shared ? "Paylaşıldı" : "Paylaş"}
            </Text>
          </Pressable>
        ) : null}
      </View>
      </Animated.View>
    </Pressable>
  );
}
