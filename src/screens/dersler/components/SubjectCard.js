import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../../themes/tokens";
import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import { TopicRow } from "./TopicRow";
import { masteryPercent } from "../../../lib/mastery";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function ProgressBar({ pct, color, C, done, total }) {
  return (
    <View style={{ marginTop: SPACING.lg }}>
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: color + "20",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${Math.max(Math.min(pct, 100), 2)}%`,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
          }}
        />
      </View>
      <Text
        style={{
          ...TYPOGRAPHY.micro,
          color: C.sec,
          marginTop: 4,
          textAlign: "right",
        }}
      >
        {done}/{total} konu
      </Text>
    </View>
  );
}

// Hero card: ders kendi kimlik rengi büyük üst yarısı (soft solid), beyaz alt yarısı detay.
// Kapalıyken yatay büyük kart, açık expand: alt kısımda topic list.
export const SubjectCard = React.memo(function SubjectCard({ subject }) {
  const C = useC();
  const id = useSubjectIdentity(subject?.key);
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    if (Platform.OS !== "web") {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setOpen((v) => !v);
  }, []);

  const { name, icon, pct, done, total, last, topics } = subject;
  const color = id?.solid || subject.color;
  const tint  = id?.tint  || (color + "18");
  const soft  = id?.soft  || (color + "30");
  const masteryPct = masteryPercent(topics);

  return (
    <View
      style={{
        borderRadius: RADIUS.xxl,
        overflow: "hidden",
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
        ...SHADOWS.card,
      }}
    >
      {/* Üst yarı — ders renginin tint'i */}
      <Pressable
        onPress={toggle}
        style={({ pressed }) => ({
          padding: SPACING.lg,
          backgroundColor: tint,
          opacity: pressed ? 0.94 : 1,
        })}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Büyük renkli ikon kart */}
          <View style={{
            width: SPACING.huge + SPACING.sm, height: SPACING.huge + SPACING.sm, borderRadius: RADIUS.lg,
            backgroundColor: color,
            alignItems: "center", justifyContent: "center",
            shadowColor: color, shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.32, shadowRadius: 12, elevation: 4,
          }}>
            <Icon name={icon} size={26} color={C.textOnFill} />
          </View>

          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 19, color: C.text, letterSpacing: -0.3 }}>
              {name}
            </Text>
            <Text style={{ ...TYPOGRAPHY.micro, color: C.sec, marginTop: 3 }}>
              {done}/{total} konu · {last || "Keşfetmeye hazır"}
            </Text>
          </View>

          {/* % rozet */}
          <View style={{
            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
            backgroundColor: pct === 0 ? color + "20" : color,
            borderWidth: pct === 0 ? 1 : 0,
            borderColor: pct === 0 ? color + "40" : C.border,
          }}>
            <Text style={{
              fontFamily: "SpaceGrotesk_700Bold", fontSize: 14, letterSpacing: -0.2,
              color: pct === 0 ? color : C.textOnFill,
            }}>
              {pct === 0 ? "Başla" : `%${pct}`}
            </Text>
          </View>

          <Icon
            name={open ? "chevUp" : "chevDown"}
            size={18}
            color={C.sec}
            style={{ marginLeft: 8 }}
          />
        </View>

        <ProgressBar pct={pct} color={color} C={C} done={done} total={total} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: SPACING.md,
          }}
        >
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 5,
            backgroundColor: masteryPct > 0 ? color + "20" : C.surface2,
            paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.pill,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: masteryPct > 50 ? C.green : masteryPct > 20 ? C.amber : color + "40" }} />
            <Text style={{ ...TYPOGRAPHY.micro, color: masteryPct === 0 ? C.sec : color }}>
              {masteryPct === 0 ? "Keşfetmeye hazır" : `%${masteryPct} ustalaşıldı`}
            </Text>
          </View>

          <Text style={{ ...TYPOGRAPHY.micro, color: color, fontFamily: "Inter_600SemiBold" }}>
            {open ? "Kapat" : "Konuları gör →"}
          </Text>
        </View>
      </Pressable>

      {/* Alt yarı — beyaz/surface, açıkken topic list */}
      {open && topics?.length > 0 ? (
        <View style={{ paddingBottom: SPACING.xs }}>
          {topics.map((t) => (
            <TopicRow key={t.name} topic={t} color={color} subject={subject} />
          ))}
        </View>
      ) : null}
    </View>
  );
});
