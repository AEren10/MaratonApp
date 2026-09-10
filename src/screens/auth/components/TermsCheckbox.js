import { Pressable, Text, View } from "react-native";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Kayıt ekranındaki Kullanım Şartları / Gizlilik Politikası onay kutusu.
export function TermsCheckbox({ checked, onToggle, onOpenTerms, onOpenPrivacy }) {
  const C = useC();
  return (
    <Pressable
      onPress={onToggle}
      style={{ flexDirection: "row", alignItems: "flex-start", gap: STEP.s2 - 1, minHeight: 44 }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel="Kullanım Şartları ve Gizlilik Politikası'nı onaylıyorum"
    >
      <View
        style={{
          width: 22, height: 22, marginTop: 1, borderRadius: 7,
          alignItems: "center", justifyContent: "center",
          backgroundColor: checked ? C.accent : "transparent",
          borderWidth: checked ? 0 : 1.5,
          borderColor: C.border,
        }}
      >
        {checked && <Icon name="check" size={12} color={C.accentInk} sw={2.5} />}
      </View>
      <Text style={[TYPOGRAPHY.meta, { color: C.text3, flex: 1 }]}>
        <Text
          onPress={onOpenTerms}
          suppressHighlighting={!onOpenTerms}
          accessibilityRole="link"
          style={{ color: C.text2, textDecorationLine: "underline" }}
        >
          Kullanım Şartları
        </Text>
        {" ve "}
        <Text
          onPress={onOpenPrivacy}
          suppressHighlighting={!onOpenPrivacy}
          accessibilityRole="link"
          style={{ color: C.text2, textDecorationLine: "underline" }}
        >
          Gizlilik Politikası
        </Text>
        {"'nı okudum, onaylıyorum."}
      </Text>
    </Pressable>
  );
}
