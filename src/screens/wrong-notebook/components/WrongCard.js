import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import SignedImage from "../../../components/common/SignedImage";
import { getTopicDifficulty } from "../../../lib/topicDifficulty";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

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
      style={[
        s.card,
        {
          backgroundColor: C.surface,
          borderColor: item.is_resolved ? C.up + "30" : C.border,
        },
      ]}
    >
      <Animated.View style={pressStyle}>
        <View style={s.headRow}>
          <View style={[s.avatar, { backgroundColor: subjColor + "1A" }]}>
            <Icon name={subj.icon} size={20} color={subjColor} />
          </View>

          <View style={s.headContent}>
            <View style={s.titleRow}>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{subj.label}</Text>
              <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>·</Text>
              <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>{relativeDate(item.created_at)}</Text>
            </View>
            {item.topic ? (
              <Text style={[TYPOGRAPHY.caption, { color: C.text2, marginTop: 1 }]} numberOfLines={1}>
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
            style={[
              s.resolveChip,
              {
                backgroundColor: item.is_resolved ? C.up + "1A" : C.warn + "14",
                borderColor: item.is_resolved ? C.up + "40" : C.warn + "30",
              },
            ]}
          >
            <Icon name={item.is_resolved ? "check" : "circle"} size={14} color={item.is_resolved ? C.up : C.warn} sw={item.is_resolved ? 3 : 1.5} />
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: item.is_resolved ? C.up : C.warn }]}>
              {item.is_resolved ? "Çözüldü" : "Çözdüm"}
            </Text>
          </Pressable>
        </View>

        {item.note ? (
          <Text style={[TYPOGRAPHY.body, s.note, { color: C.text }]} numberOfLines={3}>
            {item.note}
          </Text>
        ) : null}

        {imagePath || fallbackImage ? (
          imagePath ? (
            <SignedImage
              bucket="wrong-questions"
              path={imagePath}
              style={[s.img, { backgroundColor: C.elev }]}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <Image
              source={{ uri: fallbackImage }}
              style={[s.img, { backgroundColor: C.elev }]}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          )
        ) : null}

        <View style={s.footerRow}>
          {myA && corA ? (
            <View style={[s.answersChip, { backgroundColor: C.elev }]}>
              <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.red }]}>{myA}</Text>
              <Icon name="arrowR" size={11} color={C.text3} />
              <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.up }]}>{corA}</Text>
            </View>
          ) : null}

          {diff ? (
            <View style={[s.diffChip, { backgroundColor: C[diff.colorKey] + "16" }]}>
              <Icon name="users" size={10} color={C[diff.colorKey]} />
              <Text style={[TYPOGRAPHY.label, { color: C[diff.colorKey] }]}>
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
              style={({ pressed }) => [
                s.shareBtn,
                {
                  backgroundColor: shared ? C.up + "18" : C.accent + "14",
                  borderColor: shared ? C.up + "30" : C.accent + "30",
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Icon name={shared ? "check" : "share"} size={14} color={shared ? C.up : C.accent} />
              <Text style={[TYPOGRAPHY.metaSemiBold, { color: shared ? C.up : C.accent }]}>
                {shared ? "Paylaşıldı" : "Paylaş"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: SHAPE.card,
    borderWidth: 1,
    padding: STEP.s2,
  },
  headRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: SHAPE.iconBox,
    alignItems: "center",
    justifyContent: "center",
  },
  headContent: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  resolveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: STEP.s2,
    paddingVertical: 7,
    borderRadius: SHAPE.pill,
    borderWidth: 1,
  },
  note: { marginTop: STEP.s1, lineHeight: 21 },
  img: { marginTop: STEP.s2, height: 200, borderRadius: SHAPE.cardTight },
  footerRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s2, flexWrap: "wrap" },
  answersChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: STEP.s1,
    paddingVertical: 5,
    borderRadius: SHAPE.pill,
  },
  diffChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: STEP.s1,
    paddingVertical: 4,
    borderRadius: SHAPE.pill,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: STEP.s2,
    paddingVertical: 8,
    borderRadius: SHAPE.pill,
    borderWidth: 1,
  },
});