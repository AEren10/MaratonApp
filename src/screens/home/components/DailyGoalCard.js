import { View, Text, Pressable } from "react-native";
import { ProgressRing, Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";

// "Bugün kaç soru" mikro-hedef halkası.
// solved: bugün çözülen toplam soru, goal: kullanıcı hedefi.
export function DailyGoalCard({ solved, goal, onPress }) {
  const C = useC();
  const safeGoal = goal > 0 ? goal : 100;
  const pct = solved / safeGoal;
  const done = solved >= safeGoal;
  const remaining = Math.max(0, safeGoal - solved);
  const accent = done ? C.green : C.purple;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: done ? C.green + "14" : C.purple + "10",
        borderRadius: 28,
        borderWidth: 1,
        borderColor: done ? C.green + "40" : C.purple + "26",
        padding: 18,
        flexDirection: "row",
        alignItems: "center",
        gap: 18,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <ProgressRing size={72} stroke={8} value={pct} color={accent} trackColor={accent + "1F"}>
        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 18, color: C.text }}>
          {solved}
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 10, color: C.muted }}>
          /{safeGoal}
        </Text>
      </ProgressRing>

      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: accent, letterSpacing: 0.6 }}>
          BUGÜNKÜ HEDEF
        </Text>
        {done ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
            <Icon name="check" size={18} color={C.green} sw={2.5} />
            <Text style={{ fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 17, color: C.green }}>
              Tamamlandı!
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 4 }}>
            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 30, color: C.text, letterSpacing: -0.5 }}>
              {remaining}
            </Text>
            <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: C.sec }}>
              soru kaldı
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
