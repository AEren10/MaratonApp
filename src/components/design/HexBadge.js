import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Polygon, Defs, LinearGradient as SvgGrad, Stop } from "react-native-svg";
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Icon } from "./Icon";
import { useC } from "../../contexts/ThemeContext";

// Duolingo-vari altıgen rozet. Açık = canlı dolu gradient + beyaz ikon.
// Kilitli = nötr gri + kilit. Bas-küçül animasyonu + giriş fade.
export function HexBadge({ icon = "trophy", color, locked = false, size = 64, label, onPress }) {
  const C = useC();
  const fill = locked ? C.muted : (color || C.accent);
  const S = size;
  const pts = `${S / 2},0 ${S},${S * 0.25} ${S},${S * 0.75} ${S / 2},${S} 0,${S * 0.75} 0,${S * 0.25}`;
  const innerPad = S * 0.12;
  const iS = S - innerPad * 2;
  const ipts = `${iS / 2},0 ${iS},${iS * 0.25} ${iS},${iS * 0.75} ${iS / 2},${iS} 0,${iS * 0.75} 0,${iS * 0.25}`;

  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: "center", gap: 6, width: S + 12 }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.9, { damping: 12 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      >
        <Animated.View style={[{ width: S, height: S, alignItems: "center", justifyContent: "center" }, aStyle]}>
          <Svg width={S} height={S} style={StyleSheet.absoluteFill}>
            <Defs>
              <SvgGrad id={`hg${icon}${locked ? "L" : ""}`} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={fill} stopOpacity={locked ? 0.55 : 1} />
                <Stop offset="1" stopColor={fill} stopOpacity={locked ? 0.4 : 0.78} />
              </SvgGrad>
            </Defs>
            <Polygon points={pts} fill={`url(#hg${icon}${locked ? "L" : ""})`} />
            <Polygon points={ipts} fill="rgba(255,255,255,0.16)" x={innerPad} y={innerPad} />
          </Svg>
          <Icon name={locked ? "lock" : icon} size={S * 0.4} color={C.textOnFill} sw={2.4} />
        </Animated.View>
      </Pressable>
      {label ? (
        <Text style={[s.label, { color: locked ? C.muted : C.sec }]} numberOfLines={2}>{label}</Text>
      ) : null}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  label: { fontFamily: "Inter_600SemiBold", fontSize: 11, lineHeight: 14, textAlign: "center" },
});
