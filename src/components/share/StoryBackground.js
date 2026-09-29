import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

import { alpha } from "../../themes/colorMix";
import { TYPOGRAPHY } from "../../themes/tokens";

// Marka zemini: kizil gecis (kullanici karari, 29 Eylul) -- ustte marka
// kirmizisi, asagi dogru koyulasip zemine iner; ustte yumusak bir hale.
export function BrandBackground({ C, width, height }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[C.brandFill, C.accentDeep, C.bg]}
        locations={[0, 0.48, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="storyGlowA" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={C.accentBright} stopOpacity={0.35} />
            <Stop offset="0.7" stopColor={C.accentBright} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={-140} y={-180} width={520} height={520} fill="url(#storyGlowA)" />
      </Svg>
      <View style={[s.topLine, { backgroundColor: alpha(C.text, 22) }]} />
    </View>
  );
}

// Fotograf zemini: kullanicinin kendi karesi, altta metni tasiyan koyu gecis.
export function PhotoBackground({ uri, label }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={0} />
      ) : (
        <LinearGradient
          colors={["#8FA6B8", "#6B7F8C", "#3E4A50", "#262D31"]}
          locations={[0, 0.34, 0.68, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.42)"]}
        style={s.scrim}
      />
      {!uri && label ? (
        <View style={s.hint}>
          <Text style={[TYPOGRAPHY.tableHead, s.hintText]}>{label}</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  topLine: { position: "absolute", left: 0, right: 0, top: 0, height: 1 },
  scrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: "44%" },
  hint: { position: "absolute", left: 0, right: 0, top: 76, alignItems: "center" },
  hintText: { color: "rgba(255,255,255,0.34)", letterSpacing: 2.6 },
});
