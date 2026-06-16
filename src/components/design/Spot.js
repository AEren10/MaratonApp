import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { Icon } from "./Icon";
import { useC } from "../../contexts/ThemeContext";

// Tutarlı spot illüstrasyon seti: yumuşak blob + glyph + konfeti noktaları.
// Hepsi aynı görsel dili paylaşır → "birbirine bağlı set". Boş durum/dekor için.
const SCENES = {
  empty:  { icon: "notebook", key: "blue" },
  streak: { icon: "flame",  key: "coral" },
  done:   { icon: "check",  key: "green" },
  goal:   { icon: "target", key: "accent" },
  trophy: { icon: "trophy", key: "amber" },
  study:  { icon: "book",   key: "purple" },
  search: { icon: "search", key: "teal" },
};

export function Spot({ name = "empty", size = 120, icon, color }) {
  const C = useC();
  const scene = SCENES[name] || SCENES.empty;
  const hue = color || C[scene.key] || C.accent;
  const glyph = icon || scene.icon;
  const cx = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {/* yumuşak blob backdrop */}
        <Circle cx={cx} cy={cx} r={size * 0.42} fill={hue} opacity={0.12} />
        <Circle cx={cx} cy={cx} r={size * 0.30} fill={hue} opacity={0.16} />
        {/* konfeti noktaları — tutarlı imza */}
        <Circle cx={size * 0.18} cy={size * 0.30} r={size * 0.035} fill={hue} opacity={0.5} />
        <Circle cx={size * 0.83} cy={size * 0.24} r={size * 0.05} fill={hue} opacity={0.35} />
        <Circle cx={size * 0.80} cy={size * 0.74} r={size * 0.03} fill={hue} opacity={0.5} />
        <Path d={`M${size * 0.2} ${size * 0.72} l${size * 0.05} 0`} stroke={hue} strokeWidth={size * 0.02} strokeLinecap="round" opacity={0.4} />
      </Svg>
      <Icon name={glyph} size={size * 0.34} color={hue} sw={2.2} />
    </View>
  );
}
