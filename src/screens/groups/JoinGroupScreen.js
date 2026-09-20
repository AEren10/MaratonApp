import { useState, useEffect } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design/Icon";
import { Button } from "../../components/design/Button";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL, GUTTER } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { useGroupActions } from "../../hooks/useGroupActions";
import { JoinCodeInput } from "./components/JoinCodeInput";
import { GroupPreviewCard } from "./components/GroupPreviewCard";
import * as H from "../../lib/haptics";

export default function JoinGroupScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { previewGroupByCode, joinGroupByCode, busy } = useGroupActions();
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");

  const hasPreviewFn = typeof previewGroupByCode === "function";

  useEffect(() => {
    if (code.length === 6 && hasPreviewFn) {
      let active = true;
      setPreviewLoading(true);
      setError("");
      previewGroupByCode(code)
        .then((res) => { if (active) setPreview(res); })
        .catch((err) => {
          if (active) {
            setPreview(null);
            setError(err?.message || "Grup bulunamadı.");
          }
        })
        .finally(() => { if (active) setPreviewLoading(false); });
      return () => { active = false; };
    } else {
      setPreview(null);
      setError("");
    }
  }, [code, hasPreviewFn, previewGroupByCode]);

  const canJoin = code.length === 6 && !busy && (!hasPreviewFn || !!preview);

  const handleJoin = async () => {
    if (code.length !== 6 || busy) return;
    setError("");
    try {
      const res = await joinGroupByCode(code);
      H.success();
      navigation.replace(SCREENS.GROUP_DETAIL, { groupId: res.id, groupName: res.name });
    } catch (err) {
      setError(err?.message || "Gruba katılınamadı.");
      H.warn();
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.safeArea, { backgroundColor: C.bg }]}>
      <View style={[styles.header, { borderBottomColor: C.line }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Geri"
          onPress={() => { H.tap(); navigation.goBack(); }}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: C.surface, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Icon name="chevL" size={20} color={C.text} />
        </Pressable>
        <Text style={[styles.title, { color: C.text }]}>Koda Katıl</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 56 : 0}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.leadText, { color: C.text2 }]}>
            Arkadaşından aldığın 6 haneli katılım kodunu girerek grubuna dahil ol.
          </Text>

          <JoinCodeInput
            value={code}
            onChangeText={setCode}
            error={error}
            disabled={busy}
          />

          <GroupPreviewCard group={preview} loading={previewLoading} />

          <View style={styles.actionContainer}>
            <Button
              title="Gruba Katıl"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!canJoin}
              loading={busy}
              onPress={handleJoin}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  backBtn: {
    width: CONTROL.buttonTertiary,
    height: CONTROL.buttonTertiary,
    borderRadius: SHAPE.iconBox,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...TYPOGRAPHY.subheading },
  placeholder: { width: CONTROL.buttonTertiary },
  scrollContent: {
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s3,
    paddingBottom: STEP.s5,
  },
  leadText: { ...TYPOGRAPHY.body, marginBottom: STEP.s3 },
  actionContainer: { marginTop: STEP.s4 },
});
