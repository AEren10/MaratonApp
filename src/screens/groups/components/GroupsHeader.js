import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL, GUTTER } from "../../../themes/tokens";
import { SCREENS } from "../../../constants/screens";
import * as H from "../../../lib/haptics";

export function GroupsHeader({ title = "Gruplarım", onAddPress }) {
  const C = useC();
  const navigation = useNavigation();

  const handleBack = () => {
    H.tap();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(SCREENS.PROFILE);
    }
  };

  const handleAdd = () => {
    H.tap();
    if (onAddPress) {
      onAddPress();
    } else {
      navigation.navigate(SCREENS.CREATE_GROUP);
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: C.line }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Geri dön"
        onPress={handleBack}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: C.surface, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Icon name="chevL" size={20} color={C.text} />
      </Pressable>

      <Text style={[styles.title, { color: C.text }]}>{title}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Yeni grup oluştur"
        onPress={handleAdd}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: C.surface, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Icon name="plus" size={20} color={C.accent} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  },
});
