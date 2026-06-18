import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ProgressRing, Chip, Icon, AnimatedNumber } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { RADIUS } from "../../../themes/tokens";

function statusMessage(pct) {
  if (pct >= 1) return { text: "Tebrikler! Plan tamamlandı", emoji: "🎉" };
  if (pct >= 0.75) return { text: "Neredeyse bitti, son hamle!", emoji: "🔥" };
  if (pct >= 0.5) return { text: "Yarıyı geçtin, devam et", emoji: "💪" };
  if (pct >= 0.25) return { text: "Güzel başlangıç", emoji: "📚" };
  return { text: "Bugünkü plan seni bekliyor", emoji: "⚡" };
}

export function PlanCard({ plan, onPress, onStart }) {
  const C = useC();
  const pct = plan.total ? plan.done / plan.total : 0;
  const remaining = Math.max(0, plan.total - plan.done);
  const done = pct >= 1;
  const status = statusMessage(pct);
  const ringColor = done ? C.green : C.amber;

  return (
    <View style={{
      backgroundColor: C.surface, borderRadius: 24,
      borderWidth: 1, borderColor: C.border, overflow: "hidden",
    }}>
      <Pressable onPress={onPress} style={{ padding: 18, paddingBottom: 0 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ gap: 6 }}>
            <Chip color={C.amber}>
              <Icon name="zap" size={11} color={C.amber} sw={2.5} />
              <Text style={{ color: C.amber, fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.6 }}>GÜNLÜK PLAN</Text>
            </Chip>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: C.muted }}>
              {plan.dersler} ders · {plan.hours}
            </Text>
          </View>
          <ProgressRing size={64} stroke={7} value={pct} color={ringColor} trackColor={C.surface2 || C.border}>
            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: C.text }}>{plan.done}</Text>
            <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: C.muted }}>/{plan.total}</Text>
          </ProgressRing>
        </View>

        <Animated.View entering={FadeInDown.delay(100).duration(300)} style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 14 }}>
          <AnimatedNumber
            value={remaining}
            style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 44, color: C.text, letterSpacing: -1.5, includeFontPadding: false }}
          />
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: C.sec, marginBottom: 4 }}>
            {done ? "tamamlandı" : "soru kaldı"}
          </Text>
        </Animated.View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, marginBottom: 14 }}>
          <Text style={{ fontSize: 14 }}>{status.emoji}</Text>
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: done ? C.green : C.sec }}>{status.text}</Text>
        </View>
      </Pressable>

      <View style={{ height: 4, backgroundColor: C.surface2 }}>
        <LinearGradient
          colors={done ? [C.green, C.teal] : [C.amber, C.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: `${Math.round(Math.min(1, pct) * 100)}%`, height: 4 }}
        />
      </View>

      <Pressable
        onPress={onStart}
        style={({ pressed }) => ({
          margin: 14, marginTop: 10,
          backgroundColor: done ? C.green : C.amber,
          borderRadius: RADIUS.lg,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Icon name={done ? "check" : "arrowR"} size={17} color={C.bg} sw={2.5} />
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.bg }}>
          {done ? "Planı Gör" : "Çalışmaya Başla"}
        </Text>
      </Pressable>
    </View>
  );
}
