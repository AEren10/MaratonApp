import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Input } from "../../../components/design/Input";
import { Button } from "../../../components/design/Button";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, SPACING } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

const PRESETS = [1000, 1500, 2000, 3000];

export function CreateGroupForm({ onSubmit, busy }) {
  const C = useC();
  const [name, setName] = useState("");
  const [target, setTarget] = useState(1500);
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");

  const handleSubmit = () => {
    if (name.trim().length < 3) {
      setNameError("Grup adı en az 3 karakter olmalıdır.");
      H.warn();
      return;
    }
    setNameError("");
    onSubmit({ name: name.trim(), weekly_target: target, description: description.trim() });
  };

  return (
    <View style={styles.container}>
      <Input
        label="Grup Adı *"
        placeholder="Örn: Sayısal İlk 1000"
        value={name}
        onChangeText={(val) => {
          setName(val);
          if (nameError) setNameError("");
        }}
        maxLength={30}
        error={nameError}
      />

      <View style={styles.section}>
        <Text style={[styles.label, { color: C.text2 }]}>Haftalık Ortak Soru Hedefi</Text>
        <Text style={[styles.hint, { color: C.text3 }]}>
          Tüm üyelerin hafta boyunca çözeceği toplam soru hedefi (Öneri: üye başı 250 soru).
        </Text>

        <View style={styles.presetsRow}>
          {PRESETS.map((val) => {
            const active = target === val;
            return (
              <Pressable
                key={val}
                accessibilityRole="button"
                onPress={() => {
                  H.tap();
                  setTarget(val);
                }}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: active ? C.accent : C.surface,
                    borderColor: active ? C.accent : C.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.presetText,
                    { color: active ? C.accentInk : C.text },
                  ]}
                >
                  {val.toLocaleString("tr-TR")}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Input
        label="Grup Açıklaması (Opsiyonel)"
        placeholder="Örn: Her gün düzenli çalışma ve deneme paylaşımı."
        value={description}
        onChangeText={setDescription}
        maxLength={80}
      />

      <Button
        title="Grubu Oluştur"
        variant="primary"
        size="lg"
        fullWidth
        loading={busy}
        onPress={handleSubmit}
        style={styles.submitBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: STEP.s3,
  },
  section: {
    gap: SHAPE.chip,
  },
  label: {
    ...TYPOGRAPHY.captionMedium,
  },
  hint: {
    ...TYPOGRAPHY.micro,
  },
  presetsRow: {
    flexDirection: "row",
    gap: STEP.s1,
    marginTop: SPACING.xs,
  },
  presetChip: {
    flex: 1,
    height: 40,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  presetText: {
    ...TYPOGRAPHY.micro,
  },
  submitBtn: {
    marginTop: STEP.s2,
  },
});
