import { Pressable, View, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, ZoomIn } from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL, ANIMATION } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

// Hedef Seç ekranındaki sınav/alan seçim kartı — 20px köşe, yaylı basış ve kare radio.
export function ExamOption({ item, selected, onPress, C }) {
  const active = selected === item.id;
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <ReanimatedPressable
      onPress={() => {
        H.select();
        onPress(item.id);
      }}
      onPressIn={() => {
        scale.value = withSpring(0.975, ANIMATION.spring.default);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, ANIMATION.spring.default);
      }}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      style={[
        animStyle,
        {
          flexDirection: "row",
          alignItems: "center",
          gap: STEP.s2 + STEP.s1 / 2,
          borderRadius: SHAPE.card,
          paddingVertical: STEP.s2 + 2,
          paddingHorizontal: STEP.s3 - 2,
          backgroundColor: active ? C.brandTint : C.surface,
          borderWidth: 1,
          borderColor: active ? C.accent : C.elev,
          minHeight: CONTROL.tapMin,
        },
      ]}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[TYPOGRAPHY.topicName, { color: C.text }]}>{item.label}</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 4 }]}>{item.desc}</Text>
      </View>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 4,
          flexShrink: 0,
          borderWidth: 1.8,
          borderColor: active ? C.accent : C.text4,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: active ? C.accent : "transparent",
        }}
      >
        {active && (
          <Animated.View entering={ZoomIn.springify().damping(14)}>
            <Icon name="check" size={12} color={C.accentInk} sw={2.6} />
          </Animated.View>
        )}
      </View>
    </ReanimatedPressable>
  );
}
