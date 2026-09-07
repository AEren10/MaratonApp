import { View, Text, Pressable } from "react-native";

import { Icon } from "../../../components/design";

export function WrongNotebookHeader({ C, counts, onAdd, onBack, styles }) {
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
        <Pressable
          onPress={onBack}
          hitSlop={10}
          accessibilityLabel="Geri"
          accessibilityRole="button"
          style={[styles.backBtn, { backgroundColor: C.surface, borderColor: C.border }]}
        >
          <Icon name="arrowL" size={18} color={C.text} />
        </Pressable>
        <View>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: C.muted }}>
            {counts.open} çözülmemiş · {counts.total} toplam
          </Text>
          <Text style={[styles.title, { color: C.text }]}>Yanlış Defteri</Text>
        </View>
      </View>

      <Pressable
        onPress={onAdd}
        accessibilityLabel="Yeni yanlış ekle"
        accessibilityRole="button"
        accessibilityHint="Yeni yanlış soru ekleme ekranına gider"
        style={({ pressed }) => [
          styles.addBtn,
          {
            backgroundColor: C.orange,
            shadowColor: C.orange,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <Icon name="plus" size={22} color={C.textOnFill} sw={3} />
      </Pressable>
    </View>
  );
}
