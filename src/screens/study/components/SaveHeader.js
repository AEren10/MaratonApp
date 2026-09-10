import { View, Text, Pressable } from "react-native";

import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE, CONTROL } from "../../../themes/tokens";

// Tasarım: geri + "Atla" — başlık gerçek süreyle kişiselleşir.
export function SaveHeader({ C, duration, onBack }) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingTop: STEP.s2 }}>
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Geri"
          style={{
            width: CONTROL.buttonTertiary,
            height: CONTROL.buttonTertiary,
            borderRadius: SHAPE.iconBox,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="chevL" size={16} color={C.text2} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: GUTTER, marginTop: STEP.s2 }}>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, maxWidth: 270 }]}>
          {duration} dakika çalıştın. Neye saydıralım?
        </Text>
        <Text style={[TYPOGRAPHY.body, { color: C.text3, marginTop: STEP.s1, maxWidth: 290 }]}>
          Boş bırakırsan sadece süre kaydedilir, rotaya işlenmez.
        </Text>
      </View>
    </View>
  );
}
