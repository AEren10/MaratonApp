import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withSpring, Easing,
} from "react-native-reanimated";
import { Icon, SparkBurst } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { SHADOWS } from "../../../themes/tokens";
import { useAuth } from "../../../contexts/AuthContext";
import { getProfile } from "../../../supabase/profiles";

function greet() {
  const h = new Date().getHours();
  if (h < 5) return ["İyi geceler", "🌙"];
  if (h < 12) return ["Günaydın", "☀️"];
  if (h < 18) return ["İyi günler", "🌤"];
  return ["İyi akşamlar", "🌆"];
}

const AVATAR_PAL = [["purple","#C5B0FF"],["coral","#FFC9A8"],["blue","#A6CCFF"],["pink","#FFC0DC"],["amber","#FFE6A8"],["teal","#9EE0D2"]];
function avatarColors(name = "?", C) {
  const p = AVATAR_PAL[name.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_PAL.length];
  return [C[p[0]], p[1]];
}

export function HomeHeader({ name = "Öğrenci", streak = 0, freezeCount = 1, lastStudyDate, onStreakPress, onCalendarPress, onProfilePress }) {
  const C = useC();
  const { user } = useAuth();
  const initials = name.slice(0, 2).toUpperCase();
  const [c1, c2] = avatarColors(name, C);
  const [avatarUri, setAvatarUri] = useState(null);
  const [streakBurst, setStreakBurst] = useState(false);

  const prevStreakRef = useRef(null);
  useEffect(() => {
    if (prevStreakRef.current !== null && streak > prevStreakRef.current && streak > 0) {
      setStreakBurst(true);
    }
    prevStreakRef.current = streak;
  }, [streak]);

  const flamePulse = useSharedValue(1);
  const flameBoost = useSharedValue(1);

  useEffect(() => {
    flamePulse.value = withRepeat(withSequence(
      withTiming(1.18, { duration: 600, easing: Easing.inOut(Easing.quad) }),
      withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) })
    ), -1, false);
  }, []);

  useEffect(() => {
    if (!streakBurst) return;
    flameBoost.value = withSequence(
      withSpring(1.6, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 12, stiffness: 180 }),
    );
  }, [streakBurst]);

  const flameAnim = useAnimatedStyle(() => ({
    transform: [{ scale: flamePulse.value * flameBoost.value }],
  }));

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    let cancelled = false;
    getProfile(user.id)
      .then((p) => { if (!cancelled && p?.avatar_url) setAvatarUri(p.avatar_url); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]);

  const [g, gEmoji] = greet();
  const todayStr = new Date().toISOString().split("T")[0];
  const studiedToday = lastStudyDate === todayStr;
  const atRisk = streak > 0 && !studiedToday && new Date().getHours() >= 18;
  const avatarShadow = { shadowColor: c1, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.32, shadowRadius: 14, elevation: 5 };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14, paddingTop: 6, paddingBottom: 22 }}>
      <Pressable onPress={onProfilePress} hitSlop={6} accessibilityRole="button" accessibilityLabel="Profil" accessibilityHint="Profil sayfanı açar">
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={{ width: 52, height: 52, borderRadius: 18, ...avatarShadow }} cachePolicy="memory-disk" transition={200} />
        ) : (
          <LinearGradient colors={[c1, c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center", ...avatarShadow }}>
            <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 19, color: "#FFFFFF", letterSpacing: -0.5 }}>{initials}</Text>
          </LinearGradient>
        )}
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: C.sec, letterSpacing: 0.2 }}>{g} {gEmoji}</Text>
        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 22, color: C.text, letterSpacing: -0.4, marginTop: 1 }} numberOfLines={1}>{name}</Text>
      </View>

      {/* Calendar */}
      <Pressable
        onPress={onCalendarPress}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Takvim"
        accessibilityHint="Çalışma takvimini açar"
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

      {/* Streak pill */}
      <Pressable onPress={onStreakPress} hitSlop={6} accessibilityRole="button" accessibilityLabel={`Streak ${streak} gün`} accessibilityHint="Streak detaylarını gösterir" style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
        {streak > 0 ? (
          <View style={{ position: "relative" }}>
            <LinearGradient
              colors={atRisk ? [C.danger, C.danger + "CC"] : [C.orange, C.orange + "CC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: "row", alignItems: "center", gap: 5,
                borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9,
                ...(atRisk ? { ...SHADOWS.orange, shadowColor: C.danger } : SHADOWS.orange),
              }}
            >
              <Animated.View style={flameAnim}>
                <Icon name={atRisk ? "alert" : "flame"} size={18} color="#FFFFFF" sw={2.6} />
              </Animated.View>
              <Text style={{
                fontFamily: "SpaceGrotesk_700Bold", fontSize: 17,
                color: "#FFFFFF", letterSpacing: -0.3,
              }}>
                {streak}
              </Text>
            </LinearGradient>
            {freezeCount > 0 && (
              <View style={{
                position: "absolute", top: -5, right: -5,
                width: 18, height: 18, borderRadius: 9,
                backgroundColor: C.info, alignItems: "center", justifyContent: "center",
                borderWidth: 2, borderColor: C.bg,
              }}>
                <Icon name="shield" size={10} color="#FFFFFF" sw={2.5} />
              </View>
            )}
            <SparkBurst trigger={streakBurst} onDone={() => setStreakBurst(false)} />
          </View>
        ) : (
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 5,
            borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9,
            backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
          }}>
            <Icon name="flame" size={16} color={C.muted} sw={2} />
            <Text style={{
              fontFamily: "Inter_500Medium", fontSize: 13,
              color: C.muted, letterSpacing: -0.1,
            }}>
              Başla
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
