import { View, Text, StyleSheet } from "react-native";
import { Button } from "../../../components/design/Button";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

export function GroupDangerZone({ isAdmin, onLeave, onDelete, busy }) {
  const C = useC();

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <Text style={[styles.label, { color: C.danger }]}>TEHLİKELİ BÖLGE</Text>

      {isAdmin ? (
        <View style={styles.actionBlock}>
          <Text style={[styles.desc, { color: C.text2 }]}>
            Grubu sildiğinde tüm üyeler gruptan çıkarılır ve haftalık ilerleme kaydı sıfırlanır.
          </Text>
          <Button
            title="Grubu Sil"
            variant="danger"
            size="md"
            fullWidth
            loading={busy}
            icon="trash"
            onPress={onDelete}
          />
        </View>
      ) : (
        <View style={styles.actionBlock}>
          <Text style={[styles.desc, { color: C.text2 }]}>
            Gruptan ayrıldığında haftalık grup hedefine olan katkın silinir.
          </Text>
          <Button
            title="Gruptan Ayrıl"
            variant="danger"
            size="md"
            fullWidth
            loading={busy}
            icon="logOut"
            onPress={onLeave}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: SHAPE.card,
    borderWidth: 1,
    padding: STEP.s3,
    marginBottom: STEP.s5,
  },
  label: {
    ...TYPOGRAPHY.label,
    marginBottom: STEP.s2,
  },
  actionBlock: {
    gap: STEP.s2,
  },
  desc: {
    ...TYPOGRAPHY.micro,
    lineHeight: 16,
  },
});
