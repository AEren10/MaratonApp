import { useCallback, useState } from "react";
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Button } from "../../components/design";
import { XPBoostToast } from "../../components/common/XPBoostToast";
import { TopicPicker } from "../../components/forms/TopicPicker";
import { useC } from "../../contexts/ThemeContext";
import { useAddWrong } from "../../hooks/useAddWrong";
import { subjectColorOf } from "../../themes/subjectPalette";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { ChoiceChip } from "./components/add/ChoiceChip";
import { FormSection } from "./components/add/FormSection";
import { PhotoCapture } from "./components/add/PhotoCapture";
import { Segmented } from "./components/Segmented";
import { WrongScreenHeader } from "./components/WrongScreenHeader";

// "Yanlış Ekle" artboardi: fotograf -> sinav turu -> ders -> konu -> not -> kaydet.
// Istege bagli route.params.subjectKey dersi dolu acar (deneme detayindan gelis).
export default function AddWrongScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { params } = useRoute();
  const [pickerOpen, setPickerOpen] = useState(false);
  const onSaved = useCallback(() => navigation.goBack(), [navigation]);
  const form = useAddWrong({ initialSubjectKey: params?.subjectKey, onSaved });
  const { subject } = form;

  const groupOptions = form.groupLabels.map((label, i) => ({ key: i, label }));

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <WrongScreenHeader
          icon="x"
          title="Yanlış ekle"
          onPress={() => navigation.goBack()}
          right={<Text style={[TYPOGRAPHY.tableHead, { color: C.text3, letterSpacing: 0 }]}>~15 sn</Text>}
        />
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <PhotoCapture image={form.image} onCamera={() => form.pick("camera")} onGallery={() => form.pick("gallery")} />

          <FormSection label="SINAV TÜRÜ" wrap={false}>
            <Segmented options={groupOptions} value={form.group} onChange={form.changeGroup} />
          </FormSection>

          <FormSection label="DERS">
            {form.subjects.map((s) => (
              <ChoiceChip
                key={s.key}
                label={s.label}
                dot={subjectColorOf(C, s.key)}
                active={subject?.key === s.key}
                onPress={() => form.changeSubject(s.key)}
              />
            ))}
          </FormSection>

          {subject ? (
            <FormSection
              label="KONU"
              hint={form.guess ? `${subject.label} · son çalıştığından tahmin edildi` : null}
            >
              {form.suggestions.map((name) => (
                <ChoiceChip
                  key={name}
                  label={name}
                  active={form.selectedTopic === name}
                  badge={name === form.guess ? "TAHMİN" : null}
                  onPress={() => form.setTopic(name)}
                />
              ))}
              <ChoiceChip label="Konu ara" icon="search" dashed onPress={() => setPickerOpen(true)} />
            </FormSection>
          ) : null}

          <FormSection label="KENDİME NOT" hint="isteğe bağlı" wrap={false}>
            <TextInput
              value={form.note}
              onChangeText={form.setNote}
              placeholder="Bir dahaki sefere neye dikkat edeceğim…"
              placeholderTextColor={C.text3}
              multiline
              accessibilityLabel="Kendime not"
              style={[TYPOGRAPHY.body, styles.note, { color: C.text, backgroundColor: C.surface, borderColor: C.elev }]}
            />
          </FormSection>

          <View style={styles.save}>
            <Button size="lg" fullWidth loading={form.saving} onPress={form.save}>
              Kaydet
            </Button>
            <Text style={[TYPOGRAPHY.meta, styles.foot, { color: C.text3 }]}>
              Kaydedince 1. gün tekrarına düşer.
            </Text>
          </View>
        </ScrollView>

        <TopicPicker
          visible={pickerOpen}
          subject={subject}
          onClose={() => setPickerOpen(false)}
          onSelect={(name) => form.setTopic(name)}
        />
        <XPBoostToast amount={form.xpToast.amount} visible={form.xpToast.visible} multiplier={form.xpToast.multiplier} onDismiss={form.dismissXP} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: STEP.s4 },
  note: {
    minHeight: 76,
    paddingHorizontal: STEP.s3 - 2,
    paddingVertical: STEP.s2 + 4,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
    textAlignVertical: "top",
  },
  save: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 4 },
  foot: { marginTop: STEP.s2 + 2, textAlign: "center" },
});
