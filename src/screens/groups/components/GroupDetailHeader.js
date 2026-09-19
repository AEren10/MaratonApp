import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL, GUTTER } from "../../../themes/tokens";

export function GroupDetailHeader({ title, onBack, onSettings }) {
  const C = useC();

  return (
    <View style={[styles.header, { borderBottomColor: C.line }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Geri"
        onPress={onBack}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: C.surface, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Icon name="chevL" size={20} color={C.text} />
      </Pressable>

      <Text style={[styles.title, { color: C.text }]} numberOfLines={1}>
        {title}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Grup Ayarları"
        onPress={onSettings}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: C.surface, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Icon name="settings" size={20} color={C.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  btn: {
    width: CONTROL.buttonTertiary,
    height: CONTROL.buttonTertiary,
    borderRadius: SHAPE.iconBox,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...TYPOGRAPHY.subheading,
    maxWidth: 220,
    textAlign: "center",
  },
});
