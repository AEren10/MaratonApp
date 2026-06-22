import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";

// Pulse dot — Apple Live tarzı
function PulseDot({ color }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(2.4, { duration: 1100, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 0 })
      ),
      -1
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1100, easing: Easing.out(Easing.quad) }),
        withTiming(0.7, { duration: 0 })
      ),
      -1
    );
  }, [scale, opacity]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={{ width: 10, height: 10, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 10, height: 10, borderRadius: 5,
            backgroundColor: color,
          },
          ringStyle,
        ]}
      />
      <View style={{
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: color,
      }} />
    </View>
  );
}

export function LiveCard({ count = 0, avatars = [], onPress }) {
  const C = useC();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        padding: 16,
        borderRadius: 22,
        backgroundColor: C.green + "10",
        borderWidth: 1,
        borderColor: C.green + "28",
        overflow: "hidden",
        opacity: pressed ? 0.92 : 1,
      })}
    >
      {/* Live header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <PulseDot color={C.green} />
        <Text style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
          color: C.green,
          letterSpacing: 0.8,
        }}>
          CANLI
        </Text>
      </View>

      {/* Count */}
      <Text style={{
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 30,
        color: C.text,
        marginTop: 16,
        letterSpacing: -0.8,
      }}>
        {count}
      </Text>
      <Text style={{
        fontFamily: "Inter_400Regular",
        fontSize: 12,
        color: C.sec,
        marginTop: 1,
      }}>
        {count > 0 ? "öğrenci çalışıyor" : "kimse yok şu an"}
      </Text>

      {/* Avatar stack */}
      {avatars.length > 0 ? (
        <View style={{ flexDirection: "row", marginTop: 14 }}>
          {avatars.slice(0, 4).map((a, i) => (
            <View
              key={i}
              style={{
                width: 24, height: 24, borderRadius: 12,
                backgroundColor: [C.purple, C.teal, C.blue, C.accent][i % 4],
                alignItems: "center", justifyContent: "center",
                marginLeft: i ? -7 : 0,
                borderWidth: 2,
                borderColor: C.surface,
              }}
            >
              <Text style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 11,
                color: "#FFFFFF",
              }}>
                {a}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 14 }}>
          <Icon name="users" size={11} color={C.muted} />
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 11, color: C.muted }}>
            arkadaş ekle
          </Text>
        </View>
      )}
    </Pressable>
  );
}
