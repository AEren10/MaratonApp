import { View, Text, Pressable } from "react-native";
import { ProgressRing, Chip, Icon, AnimatedNumber } from "../../../components/design";
import { C } from "../../../themes/tokens";

export function PlanCard({ plan, onPress, onStart }) {
  const pct = plan.total ? plan.done / plan.total : 0;
  const remaining = plan.total - plan.done;

  return (
    <View
      style={{
        backgroundColor: C.surface,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: C.border,
        padding: 18,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={onPress}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Chip color={C.amber}>
          <Icon name="zap" size={11} color={C.amber} sw={2.5} />
          <Text style={{ color: C.amber, fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.6 }}>
            GÜNLÜK PLAN
          </Text>
        </Chip>
        <ProgressRing size={56} stroke={6} value={pct} color={C.amber}>
          <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 14, color: C.text }}>
            {plan.done}
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 9, color: C.muted }}>
            /{plan.total}
          </Text>
        </ProgressRing>
      </Pressable>

      <Pressable
        onPress={onPress}
        style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 14 }}
      >
        <AnimatedNumber
          value={remaining}
          style={{
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 48,
            color: C.text,
            letterSpacing: -1.5,
            includeFontPadding: false,
          }}
        />
        <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: C.sec, marginBottom: 4 }}>
          soru kaldı
        </Text>
      </Pressable>

      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: C.muted, marginTop: 2 }}>
        {plan.dersler} ders · {plan.hours}
      </Text>

      <Pressable
        onPress={onStart}
        style={({ pressed }) => ({
          marginTop: 16,
          backgroundColor: C.amber,
          borderRadius: 16,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.bg }}>
          Çalışmaya Başla
        </Text>
        <Icon name="arrowR" size={17} color={C.bg} sw={2.5} />
      </Pressable>
    </View>
  );
}
