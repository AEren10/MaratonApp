import { View } from "react-native";
import { useC } from "../../contexts/ThemeContext";

// "Ink & Volt" düz editöryal kart. Cam/blur/sheen YOK (o görünüm jenerikti).
// color verilirse: hafif kimlik yıkaması + sol kenarda ince aksan omurgası (imza).
// API geriye uyumlu: blurTint/intensity prop'ları yok sayılır.
export function GlassCard({ children, style, radius = 22, color }) {
  const C = useC();
  const shape = {
    borderRadius: radius,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: color ? color + "33" : C.border,
    backgroundColor: color ? color + "12" : C.surface,
  };

  return (
    <View style={[shape, style]}>
      {color ? (
        <View
          pointerEvents="none"
          style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: color, borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }}
        />
      ) : null}
      {children}
    </View>
  );
}
