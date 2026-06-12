import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { BentoCard, Icon, Chip } from "../../../components/design";
import { C } from "../../../themes/tokens";
import { getSubjectByKey } from "../../../themes/subjects";
import { getTopicDifficulty } from "../../../lib/topicDifficulty";

function relativeDate(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 1) return "Bugün";
  if (diff < 2) return "Dün";
  if (diff < 7) return `${Math.floor(diff)} gün önce`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function resolveSubject(raw) {
  if (typeof raw === "string") {
    const found = getSubjectByKey(raw);
    return found ? { ...found, short: found.label } : { key: raw, label: raw, short: raw, color: "#A0A0B0", icon: "bookOpen" };
  }
  return raw || { key: "?", short: "?", color: "#A0A0B0", icon: "bookOpen" };
}

export function WrongCard({ item, onPress, onResolve }) {
  const subj = resolveSubject(item.subject);
  const diff = !item.is_resolved ? getTopicDifficulty(item.topic) : null;
  return (
    <BentoCard
      onPress={onPress}
      pad={14}
      style={{
        borderColor: item.is_resolved ? C.green + "30" : C.border,
        opacity: item.is_resolved ? 0.7 : 1,
      }}
    >
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: subj.color + "22",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={subj.icon} size={22} color={subj.color} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 12,
                color: subj.color,
              }}
            >
              {subj.short}
            </Text>
            <Text style={{ color: C.muted, fontSize: 12 }}>·</Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: C.sec }}>
              {item.topic}
            </Text>
          </View>

          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              color: C.text,
              lineHeight: 19,
            }}
            numberOfLines={2}
          >
            {item.note || "Not eklenmemiş"}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: C.muted }}>
              {relativeDate(item.created_at)}
            </Text>
            {diff ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: diff.color + "1A",
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Icon name="users" size={10} color={diff.color} />
                <Text style={{ fontSize: 10, color: diff.color, fontFamily: "Inter_600SemiBold" }}>
                  100'de ~{diff.correctRate} doğru · -{diff.netLoss} net
                </Text>
              </View>
            ) : null}
            {(item.correct_answer ?? item.correctAnswer) ? (
              <View
                style={{
                  flexDirection: "row",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 11, color: C.red, fontFamily: "Inter_600SemiBold" }}
                >
                  {item.my_answer ?? item.myAnswer}
                </Text>
                <Text style={{ fontSize: 11, color: C.muted }}>→</Text>
                <Text
                  style={{ fontSize: 11, color: C.green, fontFamily: "Inter_600SemiBold" }}
                >
                  {item.correct_answer ?? item.correctAnswer}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Pressable
          onPress={onResolve}
          hitSlop={8}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: item.is_resolved ? C.green + "33" : C.surface2,
            borderWidth: 1,
            borderColor: item.is_resolved ? C.green : C.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {item.is_resolved ? <Icon name="check" size={14} color={C.green} sw={3} /> : null}
        </Pressable>
      </View>

      {item.image_path || item.image ? (
        <Image
          source={{ uri: item.image_path || item.image }}
          style={{
            marginTop: 12,
            height: 120,
            borderRadius: 14,
            backgroundColor: C.surface2,
          }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
      ) : null}
    </BentoCard>
  );
}
