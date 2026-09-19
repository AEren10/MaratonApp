import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../../components/design/Icon";
import { Button } from "../../../components/design/Button";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, GUTTER } from "../../../themes/tokens";
import { SCREENS } from "../../../constants/screens";

export function GroupsEmptyState() {
  const C = useC();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: C.surface, borderColor: C.border },
        ]}
      >
        <Icon name="users" size={32} color={C.accent} />
      </View>

      <Text style={[styles.title, { color: C.text }]}>
        Henüz bir grupta değilsin
      </Text>

      <Text style={[styles.description, { color: C.text2 }]}>
        Arkadaşlarınla birlikte haftalık soru hedeflerini yakala, sıralamada
        yarış ve ortak hedefi birlikte tamamla.
      </Text>

      <View style={styles.actions}>
        <Button
          title="Grup Kur"
          variant="primary"
          size="lg"
          fullWidth
          icon="plus"
          onPress={() => navigation.navigate(SCREENS.CREATE_GROUP)}
        />
        <Button
          title="Koda Katıl"
          variant="outline"
          size="lg"
          fullWidth
          icon="hash"
          onPress={() => navigation.navigate(SCREENS.JOIN_GROUP)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s5,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: SHAPE.sheet,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: STEP.s3,
  },
  title: {
    ...TYPOGRAPHY.subheading,
    textAlign: "center",
    marginBottom: STEP.s1,
  },
  description: {
    ...TYPOGRAPHY.body,
    textAlign: "center",
    marginBottom: STEP.s4,
    maxWidth: 320,
  },
  actions: {
    width: "100%",
    gap: STEP.s2,
  },
});
