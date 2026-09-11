import { View, Text, TextInput, Pressable } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import * as H from "../../../lib/haptics";

// Tasarimin alan satiri: buyuk harf etiket + 56px yukseklikte yuzey.
// Duzenlenebilir (TextInput) ya da baska ekrana yonlendiren (onPress +
// ok) iki halde kullanilir.
export function EditProfileField({ label, value, onChangeText, onPress, placeholder, maxLength, error }) {
  const C = useC();
  const fieldStyle = {
    flexDirection: "row", alignItems: "center", gap: STEP.s1 + 4,
    minHeight: CONTROL.tapMin + 12, marginTop: STEP.s1 + 1,
    paddingHorizontal: STEP.s2 + 6, borderRadius: SHAPE.cardTight,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.elev,
  };

  const body = onPress ? (
    <Pressable
      onPress={() => { H.tap(); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [fieldStyle, { opacity: pressed ? 0.85 : 1 }]}
    >
      <Text style={[TYPOGRAPHY.bodyMedium, { flex: 1, color: C.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Icon name="chevR" size={13} color={C.text5} />
    </Pressable>
  ) : (
    <View style={fieldStyle}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.text3}
        maxLength={maxLength}
        style={[TYPOGRAPHY.bodyMedium, { flex: 1, color: C.text, padding: 0 }]}
      />
    </View>
  );

  return (
    <View>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{label}</Text>
      {body}
      {error ? (
        <Text style={[TYPOGRAPHY.micro, { color: C.danger, marginTop: 4 }]}>{error}</Text>
      ) : null}
    </View>
  );
}
