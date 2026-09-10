import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button } from "../../../components/design/Button";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Birincil CTA: "Çalışmaya Başla" + sıradaki duraktan turetilen alt satir.
export function HomeHeroCTA({ label = "Çalışmaya Başla", subtitle, onPress, delay = 200 }) {
  const C = useC();
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(480).springify().damping(18)} style={s.wrap}>
      <Button variant="primary" size="lg" fullWidth onPress={onPress}>
        {label}
      </Button>
      {subtitle ? (
        <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s1, textAlign: "center" }]} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s3 },
});
