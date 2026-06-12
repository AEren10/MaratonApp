import { View, Text, Pressable } from "react-native";
import { ProgressRing, Icon } from "../../../components/design";
import { C } from "../../../themes/tokens";

// Madde 1: "Bugün kaç soru" mikro-hedef halkası.
// solved: bugün çözülen toplam soru, goal: kullanıcı hedefi.
export function DailyGoalCard({ solved, goal, onPress }) {
  const safeGoal = goal > 0 ? goal : 100;
  const pct = solved / safeGoal;
  const done = solved >= safeGoal;
  const remaining = Math.max(0, safeGoal - solved);
  const ringColor = done ? C.green : C.amber;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: C.surface,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: done ? C.green : C.border,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <ProgressRing size={64} stroke={7} value={pct} color={ringColor}>
        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, color: C.text }}>
          {solved}
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 9, color: C.muted }}>
          /{safeGoal}
        </Text>
      </ProgressRing>

      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: ringColor, letterSpacing: 0.6 }}>
          BUGÜNKÜ HEDEF
        </Text>
        {done ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
            <Icon name="checkCircle" size={18} color={C.green} sw={2.5} />
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.green }}>
              Hedefi tamamladın!
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 26, color: C.text, letterSpacing: -0.5 }}>
              {remaining}
            </Text>
            <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: C.sec }}>
              soru kaldı
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
