import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../../../components/design";
import { useC, useTheme } from "../../../contexts/ThemeContext";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

function emoji() {
  const h = new Date().getHours();
  if (h < 5) return "🌙";
  if (h < 12) return "☀️";
  if (h < 18) return "🌤";
  return "🌆";
}

// İsmin ilk 2 harfini kullanarak deterministik renk
function avatarColors(name = "?", C) {
  const sum = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const palette = [
    [C.purple, "#C5B0FF"],
    [C.coral,  "#FFC9A8"],
    [C.blue,   "#A6CCFF"],
    [C.pink,   "#FFC0DC"],
    [C.amber,  "#FFE6A8"],
    [C.teal,   "#9EE0D2"],
  ];
  return palette[sum % palette.length];
}

export function HomeHeader({ name = "Öğrenci", streak = 0, onStreakPress, onCalendarPress, onProfilePress }) {
  const C = useC();
  const { scheme } = useTheme();
  const initials = name.slice(0, 2).toUpperCase();
  const [c1, c2] = avatarColors(name, C);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingTop: 6,
        paddingBottom: 22,
      }}
    >
      {/* Gradient avatar — profile linki */}
      <Pressable onPress={onProfilePress} hitSlop={6}>
        <LinearGradient
          colors={[c1, c2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 52, height: 52, borderRadius: 18,
            alignItems: "center", justifyContent: "center",
            shadowColor: c1,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.32,
            shadowRadius: 14,
            elevation: 5,
          }}
        >
          <Text style={{
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 19,
            color: "#FFFFFF",
            letterSpacing: -0.5,
          }}>
            {initials}
          </Text>
        </LinearGradient>
      </Pressable>

      {/* Greeting */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontFamily: "Inter_400Regular",
          fontSize: 13,
          color: C.muted,
          letterSpacing: 0.2,
        }}>
          {greeting()} {emoji()}
        </Text>
        <Text
          style={{
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 22,
            color: C.text,
            letterSpacing: -0.4,
            marginTop: 1,
          }}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>

      {/* Calendar */}
      <Pressable
        onPress={onCalendarPress}
        hitSlop={6}
        style={({ pressed }) => ({
          width: 42, height: 42, borderRadius: 14,
          backgroundColor: C.surface,
          borderWidth: 1,
          borderColor: C.border,
          alignItems: "center", justifyContent: "center",
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Icon name="calendar" size={18} color={C.text} />
      </Pressable>

      {/* Streak pill — flame + sayı, kimlik renkli */}
      <Pressable
        onPress={onStreakPress}
        hitSlop={6}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          backgroundColor: C.coral + "16",
          borderWidth: 1,
          borderColor: C.coral + "30",
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 10,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Icon name="flame" size={18} color={C.coral} />
        <Text style={{
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 17,
          color: C.coral,
          letterSpacing: -0.3,
        }}>
          {streak}
        </Text>
      </Pressable>
    </View>
  );
}
