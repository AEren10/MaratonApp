import { View, Text } from "react-native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { NAV_ICON } from "../../../themes/tokens";

export function WrongNotebookHeader({ C, counts, onAdd, onBack, styles }) {
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
        <Press haptic="none"
          onPress={onBack}
          hitSlop={10}
          accessibilityLabel="Geri"
          accessibilityRole="button"
          style={[styles.backBtn, { backgroundColor: C.surface, borderColor: C.border }]}
        >
          <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
        </Press>
        <View>
          <Text style={{ fontFamily: "Archivo_400", fontSize: 12, color: C.muted }}>
            {counts.open} çözülmemiş · {counts.total} toplam
          </Text>
          <Text style={[styles.title, { color: C.text }]}>Yanlış Defteri</Text>
        </View>
      </View>

      <Press haptic="none"
        onPress={onAdd}
        accessibilityLabel="Yeni yanlış ekle"
        accessibilityRole="button"
        accessibilityHint="Yeni yanlış soru ekleme ekranına gider"
        style={[
          styles.addBtn,
          {
            backgroundColor: C.accent,
            shadowColor: C.accent
          }
        ]}
      >
        <Icon name="plus" size={20} color={C.textOnFill} sw={1.5} />
      </Press>
    </View>
  );
}
