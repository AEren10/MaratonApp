import { useCallback, useState } from "react";
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { XPBoostToast } from "../../components/common/XPBoostToast";
import { TopicPicker } from "../../components/forms/TopicPicker";
import { useC } from "../../contexts/ThemeContext";
import { useAddWrong } from "../../hooks/useAddWrong";
import { subjectColorOf } from "../../themes/subjectPalette";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { AddWrongFooter } from "./components/add/AddWrongFooter";
import { ChoiceChip } from "./components/add/ChoiceChip";
import { FormSection } from "./components/add/FormSection";
import { PhotoCapture } from "./components/add/PhotoCapture";
import { Segmented } from "./components/Segmented";
import { WrongScreenHeader } from "./components/WrongScreenHeader";

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
                label={s.name}
                dotColor={subjectColorOf(C, s.key)}
                selected={form.subjectKey === s.key}
                onPress={() => form.changeSubject(s.key)}
              />
            ))}
          </FormSection>

          <FormSection
            label={"KONU"}
            suffix={form.inferredTopic ? "Matematik · son çalıştığından tahmin edildi" : ""}
            onSuffixPress={form.inferredTopic ? undefined : () => setPickerOpen(true)}
          >
            {form.topics.slice(0, 4).map((t) => (
              <ChoiceChip
                key={t.key}
                label={t.name + (form.inferredTopic?.key === t.key ? "  TAHMİN" : "")}
                selected={form.topicKey === t.key}
                onPress={() => form.changeTopic(t.key)}
              />
            ))}
            <ChoiceChip
              label={form.isOtherTopic ? form.topicLabel : "Konu ara"}
              selected={form.isOtherTopic}
              icon="search"
              onPress={() => setPickerOpen(true)}
            />
          </FormSection>

          <FormSection label="NEDEN YANLIŞ" suffix="isteğe bağlı">
            {form.reasons.map((r) => (
              <ChoiceChip
                key={r.key}
                label={r.label}
                selected={form.reason === r.key}
                onPress={() => form.changeReason(r.key)}
              />
            ))}
          </FormSection>

          <FormSection label="KENDİME NOT" suffix="isteğe bağlı" wrap={false}>
            <TextInput
              style={[TYPOGRAPHY.inputMedium, styles.input, { backgroundColor: C.surface, borderColor: C.elev, color: C.text }]}
              placeholder="Bir dahaki sefere neye dikkat edeceğim..."
              placeholderTextColor={C.text3}
              value={form.note}
              onChangeText={form.changeNote}
              multiline
              maxLength={200}
            />
          </FormSection>

          <View style={[styles.sourceRow, { borderBottomColor: C.line }]}>
            <Text style={[TYPOGRAPHY.body, { color: C.text2 }]}>Kaynak</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{form.sourceLabel}</Text>
              <Icon name="chevR" size={14} color={C.text3} />
            </View>
          </View>
        </ScrollView>
        <AddWrongFooter C={C} onSave={form.save} onSaveAndNew={form.saveAndNew} saving={form.saving} />
      </KeyboardAvoidingView>
      <TopicPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        subject={subject}
        selectedKey={form.topicKey}
        onSelect={(t) => { form.changeTopic(t.key); setPickerOpen(false); }}
      />
      <XPBoostToast
        visible={form.saved}
        xp={10}
        title="Deftere atıldı"
        subtitle="İlk tekrar yarın. Maraton bunu unutmana izin vermeyecek."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: STEP.s5 },
  input: {
    height: 104, padding: STEP.s3, borderRadius: SHAPE.card, borderWidth: 1,
    textAlignVertical: "top",
  },
  sourceRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: GUTTER, paddingVertical: STEP.s3, marginTop: STEP.s3,
    borderBottomWidth: 1,
  },
});
